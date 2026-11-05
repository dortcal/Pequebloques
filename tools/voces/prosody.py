"""
Capa de interpretación de texto + modelado prosódico para voces TTS en español.

Motor base: Kokoro (neuronal, sin SSML ni etiquetas de emoción: solo texto + voz + velocidad).
Lo que el motor NO controla (melodía, duración por palabra, énfasis, pausas) se modela aquí,
sobre el audio, con Praat (PSOLA): PitchTier + DurationTier + envolvente de intensidad.
"""
import re, zlib, io, subprocess, wave
import numpy as np
import parselmouth
from parselmouth.praat import call
from kokoro_onnx import Kokoro

SR = 24000
_K = None
def kokoro():
    global _K
    if _K is None:
        _K = Kokoro('/tmp/tts/kokoro-v1.0.onnx', '/tmp/tts/voices-v1.0.bin')
    return _K

# ------------------------------------------------------------------ 1. ANÁLISIS DEL TEXTO
WH = {'qué','cómo','dónde','cuándo','cuál','cuáles','quién','quiénes','cuánto','cuánta','cuántos','cuántas','adónde'}
IMPER = set('''camina levanta tapa toca gira da alarga abre salpica ponte colócate agáchate estírate sigue seguid mirad haced sed
quedaos moveos cambia dadme dale ayudadme aguantad cuenta pulsa colócate ponte haz mira escucha repite imita sube baja salta
mueve cierra pon siéntate ven vamos'''.split())
EMPH_LEX = set('''derecha derecho izquierda izquierdo adelante atrás delante detrás arriba abajo lado dos tres cinco muy nunca solo
sin no todos despacio rápido quietos estatuas silencio importante cuidado ayuda increíble genial fantástico bravo'''.split())
FUNC = set('''el la los las un una unos unas de del a al y e o u en con por para que se me te lo le les su sus tu tus mi mis
es son fue ha han he como pero si sí ya aquí ahí allí hay''' .split())
INTERJ = set('achís plas chas croac shhh jijiji buaaah uf ay hola uuuuh'.split())

def norm_tts(t):
    NUM = {'1':'un','2':'dos','3':'tres','5':'cinco'}
    t = re.sub(r'\{/?[DI]\}', '', t)
    t = t.replace('Mapa 1', 'Mapa uno').replace('Mapa 2', 'Mapa dos')
    t = re.sub(r'\b(\d)\b', lambda m: NUM[m.group(1)], t)
    t = re.sub(r'\b[A-ZÁÉÍÓÚ]{3,}\b', lambda m: m.group(0).lower(), t)
    return t.replace('…', '...')

def words_of(s):
    return [w for w in re.findall(r"[A-Za-zÁÉÍÓÚáéíóúÜüÑñ]+", s)]

def split_sentences(text):
    return [p for p in re.split(r'(?<=[.!?…])\s+', text.strip()) if p]

def classify(s):
    st = s.strip()
    ws = [w.lower() for w in words_of(st)]
    short = len(ws) <= 3
    if st.endswith('...') or st.endswith('…'):
        return 'suspense', short
    if st.endswith('?') or st.startswith('¿'):
        first = ws[:2]
        open_q = bool(first) and (first[0] in WH or (first[0] in ('por','para') and len(first) > 1 and first[1] == 'qué'))
        # "¿Sabes qué es...?" -> pregunta cerrada con subordinada: la sube igual
        return ('q_open' if open_q else 'q_closed'), short
    if st.endswith('!') or st.startswith('¡'):
        inter = short and any(w in INTERJ for w in ws) or (short and len(ws) <= 2)
        return ('interj' if inter else 'excl'), short
    if ws and (ws[0] in IMPER or re.search(r'(ad|ed|id|ate|ete|aos|eos)$', ws[0]) and len(ws[0]) > 4):
        return 'instr', short
    return 'statement', short

def split_groups(s):
    """Grupos fónicos: coma, dos puntos, punto y coma; y partes largas ante conjunción."""
    core = s.strip()
    parts = [p.strip() for p in re.split(r'(?<=[,:;])\s+', core) if p.strip()]
    out = []
    for p in parts:
        ws = p.split()
        if len(ws) >= 10:
            idx = [i for i, w in enumerate(ws) if w.lower().strip(',') in ('y', 'pero', 'ahora', 'que', 'porque') and 3 <= i <= len(ws) - 3]
            if idx:
                i = idx[len(idx) // 2]
                out += [' '.join(ws[:i]), ' '.join(ws[i:])]
                continue
        out.append(p)
    return out

# ------------------------------------------------------------------ 2. SÍLABAS Y TIEMPOS
STRONG, WEAK = 'aeoáéóíú', 'iuü'
def syl_count_and_stress(w):
    w = w.lower()
    nuclei = []
    i = 0
    while i < len(w):
        if w[i] in STRONG + WEAK:
            j = i
            while j + 1 < len(w) and w[j + 1] in STRONG + WEAK:
                j += 1
            run = w[i:j + 1]
            k = 0
            nuclei.append(i)
            for a in range(1, len(run)):
                if (run[a] in STRONG and run[a - 1] in STRONG) or run[a] in 'íú' or run[a - 1] in 'íú':
                    nuclei.append(i + a)
            i = j + 1
        else:
            i += 1
    n = max(1, len(nuclei))
    acc = [k for k, p in enumerate(nuclei) if w[p] in 'áéíóú']
    if acc: s = acc[0]
    elif n == 1: s = 0
    elif w[-1] in 'aeiouns': s = n - 2
    else: s = n - 1
    return n, s

def word_timeline(words, dur):
    """Reparte la duración del grupo entre palabras según sílabas (aprox.). Devuelve [(ini,fin,centro_tónica)]"""
    w8 = []
    for w in words:
        n, s = syl_count_and_stress(w)
        func = w.lower() in FUNC and n == 1
        sw = [1.0] * n
        if not func: sw[s] = 1.35
        else: sw = [0.6]
        w8.append((n, s, sw, func))
    total = sum(sum(x[2]) for x in w8) or 1.0
    t = 0.0; out = []
    for (n, s, sw, func) in w8:
        d = dur * sum(sw) / total
        if func: c = t + d / 2
        else: c = t + d * (sum(sw[:s]) + sw[s] / 2) / sum(sw)
        out.append((t, t + d, c, func))
        t += d
    return out

# ------------------------------------------------------------------ 3. PARÁMETROS PROSÓDICOS POR TIPO
def ramp(u, u0): return np.clip((u - u0) / (1 - u0), 0, 1)
def bump(u, c, w): return np.exp(-0.5 * ((u - c) / w) ** 2)

def spec_for(stype, role, short, rng):
    R = rng.uniform
    if role == 'cont':
        rise = R(0.9, 1.8)
        return dict(base=0.0, rng=1.0, fin=1.07, speed=1.0, gain=0,
                    f=lambda u: -0.6 * u + rise * ramp(u, 0.72))
    if stype == 'statement':
        d, fall = R(1.2, 2.2), R(1.6, 3.2)
        return dict(base=0.0, rng=1.05, fin=1.20, speed=1.0, gain=0, f=lambda u: -d * u - fall * ramp(u, 0.78))
    if stype == 'instr':
        d, fall = R(0.8, 1.6), R(1.3, 2.4)
        return dict(base=0.0, rng=0.95, fin=1.14, speed=0.96, gain=0, f=lambda u: -d * u - fall * ramp(u, 0.8))
    if stype == 'q_closed':
        rise = R(4.2, 5.6)
        return dict(base=0.5, rng=1.15, fin=1.12, speed=1.0, gain=0.5,
                    f=lambda u: -0.9 * u + rise * ramp(u, 0.68) ** 1.2)
    if stype == 'q_open':
        top, d, fall = R(1.8, 2.6), R(1.8, 2.6), R(0.8, 1.6)
        return dict(base=0.4, rng=1.15, fin=1.10, speed=1.0, gain=0.5,
                    f=lambda u: top * np.exp(-u / 0.2) - d * u - fall * ramp(u, 0.8))
    if stype == 'interj':
        pk, fall = R(3.0, 4.0), R(5.0, 7.0)
        return dict(base=2.8, rng=1.5, fin=1.25, speed=0.92, gain=3.0,
                    f=lambda u: pk * bump(u, 0.18, 0.2) - fall * ramp(u, 0.45))
    if stype == 'excl':
        pk, d, fall = R(2.0, 3.0), R(1.2, 2.0), R(2.4, 3.6)
        return dict(base=1.6, rng=1.3, fin=1.12, speed=1.03, gain=1.5,
                    f=lambda u: pk * bump(u, 0.22, 0.18) - d * u - fall * ramp(u, 0.72))
    if stype == 'sneeze':   # estornudo con entusiasmo: pico alto y caída rápida
        return dict(base=4.5, rng=1.8, fin=1.0, speed=0.92, gain=6.0,
                    f=lambda u: 7.0 * bump(u, 0.2, 0.16) - 9.0 * ramp(u, 0.4))
    if stype == 'snap':     # «¡Chas!» seco y enérgico, como una pinza que se cierra
        return dict(base=3.2, rng=1.7, fin=0.95, speed=1.0, gain=5.0,
                    f=lambda u: 5.0 * bump(u, 0.18, 0.14) - 7.0 * ramp(u, 0.35))
    if stype == 'suspense':
        rise = R(1.0, 1.8)
        return dict(base=0.0, rng=0.95, fin=1.32, speed=0.96, gain=-0.5, f=lambda u: -0.3 * u + rise * ramp(u, 0.7))
    raise ValueError(stype)

# ------------------------------------------------------------------ 4. MODELADO CON PRAAT
def trim(a, thr=0.012, pad=int(SR * 0.02)):
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx) == 0: return a
    return a[max(0, idx[0] - pad): idx[-1] + pad]

def shape_group(a, gtext, spec, stype, role, rng):
    snd = parselmouth.Sound(a.astype(np.float64), SR)
    dur = snd.duration
    manip = call(snd, 'To Manipulation', 0.01, 75, 420)
    pt = call(manip, 'Extract pitch tier')
    n = call(pt, 'Get number of points')
    if n < 6:
        return a
    ts = np.array([call(pt, 'Get time from index', i) for i in range(1, n + 1)])
    fs = np.array([call(pt, 'Get value at index', i) for i in range(1, n + 1)])
    t0, t1 = ts[0], ts[-1]
    med = np.median(fs)
    words = words_of(gtext)
    tl = word_timeline(words, dur) if words else []
    # palabras con énfasis: léxico + núcleo (última palabra de contenido del grupo final)
    emph = []
    content = [i for i, w in enumerate(words) if w.lower() not in FUNC and len(w) > 3]
    for i, w in enumerate(words):
        if w.lower() in EMPH_LEX: emph.append((i, 2.6, True))
    if role == 'final' and stype in ('statement', 'instr') and content:
        if content[-1] not in [e[0] for e in emph]: emph.append((content[-1], 1.4, False))
    if stype in ('excl',) and content:
        if content[0] not in [e[0] for e in emph]: emph.append((content[0], 1.6, False))
    ph1, ph2 = rng.uniform(0, 6.28, 2)
    new = []
    U = (ts - t0) / max(t1 - t0, 1e-6); ST = 12 * np.log2(fs / med)
    # El motor trae su propia caída final. La retiramos (total o parcialmente) para poder diseñar el cierre:
    # subida en preguntas cerradas, continuidad en grupos intermedios, caída variable en afirmaciones.
    nat = np.mean(ST[U >= 0.8]) - np.mean(ST[(U >= 0.3) & (U <= 0.7)]) if np.any(U >= 0.8) else 0.0
    kfix = 1.0 if role == 'cont' else {'q_closed': 1.0, 'q_open': 0.6, 'suspense': 1.0, 'excl': 0.5, 'interj': 0.3,
                                       'statement': 0.5, 'instr': 0.5, 'sneeze': 0.2, 'snap': 0.2}[stype]
    remove = -nat * kfix if nat < 0 else 0.0   # semitonos a devolver en la zona final
    for t, f in zip(ts, fs):
        u = (t - t0) / max(t1 - t0, 1e-6)
        st = 12 * np.log2(f / med)
        st += remove * float(ramp(u, 0.7))
        st = st * spec['rng'] + spec['base'] + float(spec['f'](u))
        for (i, amp, _) in emph:
            c = tl[i][2]; sd = max(0.045, (tl[i][1] - tl[i][0]) * 0.35)
            st += amp * np.exp(-0.5 * ((t - c) / sd) ** 2)
        st += 0.45 * np.sin(2 * np.pi * 0.8 * t + ph1) + 0.25 * np.sin(2 * np.pi * 2.1 * t + ph2)   # deriva natural
        new.append((t, med * 2 ** (st / 12)))
    npt = call('Create PitchTier', 'n', snd.xmin, snd.xmax)
    for t, f in new: call(npt, 'Add point', t, float(np.clip(f, 60, 600)))
    call([npt, manip], 'Replace pitch tier')
    # ritmo: variación suave, alargamiento final, alargamiento de palabras enfatizadas
    grid = np.arange(0, dur, 0.01)
    u = grid / dur
    fac = np.ones_like(grid)
    if stype in ('statement', 'instr'): fac *= np.where((u > .15) & (u < .8), 0.97, 1.0)
    fac *= 1 + 0.03 * np.sin(2 * np.pi * 0.9 * grid + ph2)
    fac *= 1 + (spec['fin'] - 1) * ramp(u, 0.85)
    for (i, amp, lex) in emph:
        if lex:
            s0, s1 = tl[i][0], tl[i][1]
            w = np.clip(np.minimum((grid - s0) / 0.03, (s1 - grid) / 0.03), 0, 1)
            fac *= 1 + 0.14 * w
    dt = call('Create DurationTier', 'd', snd.xmin, snd.xmax)
    for t, f in zip(grid, fac): call(dt, 'Add point', float(t), float(f))
    call([dt, manip], 'Replace duration tier')
    out = call(manip, 'Get resynthesis (overlap-add)')
    y = np.array(out.values[0], dtype=np.float64)
    # intensidad: énfasis +2,5 dB, cierre suave en afirmaciones, ganancia por tipo
    tout = np.cumsum(fac) * 0.01
    env_db = np.zeros(len(y)); tt = np.arange(len(y)) / SR
    for (i, amp, lex) in emph:
        c_in = tl[i][2]; c_out = np.interp(c_in, grid, tout)
        env_db += (2.5 if lex else 1.2) * np.exp(-0.5 * ((tt - c_out) / 0.09) ** 2)
    if stype in ('statement', 'instr') and role == 'final':
        env_db -= 3.0 * ramp(tt / max(tt[-1], 1e-6), 0.8)
    env_db += spec['gain']
    y = y * 10 ** (env_db / 20)
    return y.astype(np.float32)

# ------------------------------------------------------------------ 5. SÍNTESIS COMPLETA
def synth_text(text, voice, seed_extra='', verbose=False):
    text = norm_tts(text)
    rng = np.random.default_rng(zlib.crc32((text + seed_extra).encode()))
    pieces = []
    sents = split_sentences(text)
    for si, s in enumerate(sents):
        stype, short = classify(s)
        groups = split_groups(s)
        for gi, g in enumerate(groups):
            final = gi == len(groups) - 1
            role = 'final' if final else 'cont'
            spec = spec_for(stype, role, short, rng)
            ktext = g.strip()
            if not final:
                ktext = re.sub(r'^[¿¡]', '', ktext) if gi > 0 else ktext
                ktext = ktext.rstrip(',;:') + ','
            a, sr = kokoro().create(ktext, voice=voice, speed=float(spec['speed'] * rng.uniform(0.97, 1.03)), lang='es')
            a = trim(np.asarray(a, dtype=np.float32))
            y = shape_group(a, re.sub(r'[¿¡?!.,;:…]', ' ', g), spec, stype, role, rng)
            pieces.append(y)
            if not final:
                pieces.append(np.zeros(int(SR * rng.uniform(0.15, 0.24)), np.float32))
        pause = {'statement': (0.38, 0.52), 'instr': (0.36, 0.48), 'q_closed': (0.42, 0.56),
                 'q_open': (0.42, 0.56), 'excl': (0.30, 0.42), 'interj': (0.26, 0.36), 'suspense': (0.60, 0.72)}[stype]
        if si < len(sents) - 1:
            pieces.append(np.zeros(int(SR * rng.uniform(*pause)), np.float32))
        if verbose: print(f'  [{stype}{" corta" if short else ""}] {s}  -> {len(groups)} grupo(s)')
    return np.concatenate(pieces).astype(np.float32)

# ------------------------------------------------------------------ 6. PERSONAJE (tono y formantes sin "efecto ardilla")
def character(y, pitch_factor, formant_ratio):
    snd = parselmouth.Sound(y.astype(np.float64), SR)
    pitch = snd.to_pitch(0.01, 75, 450)
    med = call(pitch, 'Get quantile', 0, 0, 0.5, 'Hertz')
    new = snd if (abs(pitch_factor - 1) < 1e-3 and abs(formant_ratio - 1) < 1e-3) else \
        call(snd, 'Change gender', 75, 450, formant_ratio, med * pitch_factor, 1.0, 1.0)
    return np.array(new.values[0], dtype=np.float32)

def to_mp3(y, path, tempo=1.0, extra='', br='48k'):
    pcm = (np.clip(y, -1, 1) * 32767).astype(np.int16)
    flt = f'atempo={tempo:.4f}{extra},silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-18:TP=-2:LRA=14'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', flt,
                    '-ac', '1', '-ar', '24000', '-c:a', 'libmp3lame', '-b:a', br, path], input=pcm.tobytes(), check=True)
