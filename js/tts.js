/* PequeBloques — diseñado por David OZC
 * tts.js: motor de voz. Español de España (es-ES).
 *
 * Dos motores, por este orden:
 *   1. NEURONAL (pregrabado): frases ya sintetizadas con un modelo neuronal (Kokoro, código abierto) y con
 *      entonación modelada por tipo de frase. Están en la carpeta audio/ (un mp3 por frase y voz) y se
 *      localizan por una clave calculada con el texto exacto y el tipo de voz. No hay servidor, ni claves, ni
 *      datos que salgan del dispositivo. Si un texto es de una sola frase conocida, o todas sus frases lo son,
 *      se reproduce con la voz neuronal. Una locución nunca mezcla las dos voces.
 *   2. DISPOSITIVO (respaldo): la voz del navegador, siempre en es-ES, eligiendo la mejor voz española
 *      instalada (las «Natural» de Edge, las de Google, las «Mejoradas» de Apple) y nunca una que no sea
 *      española si hay una de España. Se usa para los textos que no se pueden pregrabar (lo que escribe el
 *      alumnado) o si no se encuentra la carpeta audio/.
 * Ajustes (velocidad, volumen, motor, voz del dispositivo y voz de Pipo) en PQ.voiceCfg, guardados en el
 * navegador, con su ventana en PQ.openVoiceSettings().
 */
(function (g) {
  'use strict';
  const PQ = g.PQ = g.PQ || {};
  const STORE = 'pequebloques.voz';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- ajustes ---------- */
  const cfg = PQ.voiceCfg = { rate: 1, volume: 1, engine: 'auto', device: '', pipo: 'f', fx: true };
  try { Object.assign(cfg, JSON.parse(localStorage.getItem(STORE) || '{}')); } catch (e) { /* sin almacenamiento */ }
  cfg.rate = clamp(+cfg.rate || 1, 0.6, 1.4); cfg.volume = clamp(cfg.volume === undefined ? 1 : +cfg.volume, 0, 1);
  if (cfg.engine !== 'device' && cfg.engine !== 'clips') cfg.engine = 'auto';
  if (cfg.pipo !== 'm') cfg.pipo = 'f';
  cfg.fx = cfg.fx !== false;
  try { if (/[?&]voz=dispositivo\b/.test(g.location.search)) cfg.engine = 'device'; } catch (e) { /* nada */ }   // para pruebas y para forzar la voz del dispositivo con ?voz=dispositivo
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(cfg)); } catch (e) { /* nada */ } };

  /* ---------- clave de cada clip (idéntica a la del generador de audios) ---------- */
  function h32(s, seed) { let h = seed >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
  const hex8 = (n) => ('00000000' + n.toString(16)).slice(-8);
  const clean = (t) => String(t).replace(/[«»]/g, '').replace(/\s+/g, ' ').trim();
  function clipKey(voice, text) { const s = voice + '|' + clean(text); return hex8(h32(s, 0x811c9dc5)) + hex8(h32(s, 0x9747b28c)); }
  /* Las voces grabadas viven en una carpeta externa (audio/). Si no está —por ejemplo, al publicar solo el HTML— o si
   * sus archivos no se pueden reproducir, se deja de intentar y se usa siempre la voz del dispositivo (ver status()). */
  let clipsBroken = false;
  const audioPresent = () => !!(PQ.AUDIO && PQ.AUDIO.k) && !clipsBroken && typeof Audio !== 'undefined';
  const has = (k) => !!(PQ.AUDIO && PQ.AUDIO.k && PQ.AUDIO.k[k]);
  const voiceId = (voice) => (voice === 'PIPO' && cfg.pipo === 'm') ? 'PIPOM' : voice;
  /* Motor «automático»: si el dispositivo tiene una voz española NATURAL utilizable (Microsoft «Natural», Google, Siri, mejoradas…),
   * se usa esa para todo —suena mejor que las voces pregrabadas—; si no, las grabadas (Kokoro). «clips» fuerza las grabadas. */
  const neuralReady = () => audioPresent() && (cfg.engine === 'clips' || (cfg.engine === 'auto' && !naturalDevice()));

  /* ¿Se puede decir este texto con la voz neuronal? Devuelve la lista de claves (con pausas) o null. */
  function plan(text, voice) {
    if (!neuralReady()) return null;
    const v = voiceId(voice);
    const full = clipKey(v, text);
    if (has(full)) return [{ k: full, gap: 0 }];
    const ss = PQ.prosody && PQ.prosody.sentences ? PQ.prosody.sentences(text) : [];
    if (ss.length < 2) return null;
    const out = [];
    for (let i = 0; i < ss.length; i++) {
      const k = clipKey(v, ss[i]);
      if (!has(k)) return null;
      out.push({ k, gap: i < ss.length - 1 ? (/[?]$/.test(ss[i]) ? 0.34 : /…$/.test(ss[i]) ? 0.5 : 0.3) : 0 });
    }
    return out;
  }

  /* ---------- reproductor neuronal ---------- */
  const pool = new Map();                                   // precarga: clave -> Audio
  function clip(k) {
    let a = pool.get(k);
    if (!a) {
      a = new Audio(PQ.AUDIO_BASE + k + '.mp3'); a.preload = 'auto';
      pool.set(k, a);
      if (pool.size > 24) pool.delete(pool.keys().next().value);
    }
    return a;
  }
  /* Reproduce job.clips seguidos. onEnd() al terminar; onFail() si el audio no se puede reproducir (para usar el respaldo). */
  function play(job, onEnd, onFail) {
    let i = 0, dead = false, cur = null, tm = 0, played = 0;
    job.stop = () => { dead = true; clearTimeout(tm); if (cur) { cur.onended = cur.onerror = null; try { cur.pause(); } catch (e) { /* nada */ } } pool.forEach((a, k) => { if (a === cur) pool.delete(k); }); };
    const step = () => {
      if (dead) return;
      if (i >= job.clips.length) { onEnd(); return; }
      const c = job.clips[i++];
      const a = clip(c.k); cur = a;
      if (job.clips[i]) clip(job.clips[i].k);               // precarga la siguiente
      try { a.currentTime = 0; } catch (e) { /* aún sin metadatos */ }
      a.playbackRate = cfg.rate; a.volume = clamp(cfg.volume * (job.vol === undefined ? 1 : job.vol), 0, 1);
      try { a.preservesPitch = true; a.mozPreservesPitch = true; a.webkitPreservesPitch = true; } catch (e) { /* nada */ }
      let moved = false;
      const nx = () => { if (moved || dead) return; moved = true; pool.delete(c.k); tm = setTimeout(step, (c.gap || 0) * 1000 / cfg.rate); };
      a.onended = nx;
      a.onerror = () => { if (dead) return; if (played === 0) { dead = true; onFail('error'); } else nx(); };
      const p = a.play();
      /* NotAllowedError = el navegador aún no deja sonar (falta un toque del usuario): no significa que falten los archivos */
      if (p && p.then) p.then(() => { played++; }, (err) => { if (dead) return; if (played === 0) { dead = true; onFail(err && err.name === 'NotAllowedError' ? 'blocked' : 'error'); } else nx(); });
    };
    step();
  }

  /* ---------- voces del dispositivo: solo español, y la mejor ---------- */
  const NATURAL = /natural|neural|online|premium|enhanced|mejorad|siri|google/i;
  /* voces de sistema de Apple (Mónica, Paulina, Jorge… y las «Eddy, Flo, Reed…»): suenan bien sin pedir tonos forzados */
  const APPLE = /^(m[oó]nica|paulina|jorge|juan|diego|soledad|[aá]ngelica|marisol|francisca|carlos|isabela|jimena|montserrat|luciana|(eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley) \()/i;
  const POOR = /compact|espeak|festival|robot|novelty|bad news|whisper|zarvox|trinoids|bubbles|cellos|boing|bells|organ/i;
  const isES = (v) => /^es([-_]|$)/i.test(v.lang || '');
  const isSpain = (v) => /^es[-_]ES/i.test(v.lang || '');
  let vlist = [];
  function refreshVoices() {
    try {
      const all = (g.speechSynthesis && g.speechSynthesis.getVoices()) || [];
      vlist = all.filter(isES).map((v) => ({ v, name: v.name, lang: v.lang, spain: isSpain(v),
        score: (isSpain(v) ? 100 : 0) + (NATURAL.test(v.name) ? 120 : 0) + (v.localService ? 0 : 5) - (POOR.test(v.name) ? 200 : 0) }));   // las robóticas (espeak…) van siempre las últimas
      vlist.sort((a, b) => b.score - a.score);
      vlist._all = all.length;
    } catch (e) { vlist = []; vlist._all = 0; }
  }
  refreshVoices();
  /* mejor voz natural que se pueda usar ahora (las de red necesitan conexión) o null */
  function naturalDevice() {
    const online = !(g.navigator && g.navigator.onLine === false);
    const x = vlist.find((e) => (NATURAL.test(e.name) || (APPLE.test(e.name) && e.v.localService)) && !POOR.test(e.name) && (e.v.localService || online));
    return x ? x.v : null;
  }
  try { if (g.speechSynthesis) g.speechSynthesis.addEventListener('voiceschanged', refreshVoices); } catch (e) { /* nada */ }
  /* ¿puede el dispositivo hablar en español? (si aún no ha cargado ninguna voz se intenta igualmente con lang = es-ES) */
  const deviceOK = () => !!g.speechSynthesis && typeof SpeechSynthesisUtterance !== 'undefined' && (vlist.length > 0 || (vlist._all || 0) === 0);

  /* ---------- qué voz se está usando de verdad, y aviso si no es la esperada ---------- */
  function status() {
    if (neuralReady()) return { engine: 'neural', why: 'ok', label: 'voces grabadas' };
    if (!deviceOK()) return { engine: 'none', why: clipsBroken ? 'broken' : (PQ.AUDIO && PQ.AUDIO.k ? 'nodevice' : 'missing'), label: 'sin voz en este dispositivo' };
    const nat = naturalDevice(), dv = nat || (vlist[0] && vlist[0].v);
    const why = clipsBroken ? 'broken' : !(PQ.AUDIO && PQ.AUDIO.k) ? 'missing' : cfg.engine === 'device' ? 'chosen' : 'natural';
    return { engine: 'device', why, natural: !!nat, voice: dv ? dv.name : '', label: 'voz de este dispositivo' + (dv ? ' (' + dv.name + ')' : '') };
  }
  const told = {};
  function tell(key, msg) {
    if (told[key]) return; told[key] = true;
    const b = document.getElementById('btnVoice'); if (b) b.title = 'Voz: ' + status().label;
    const go = () => { if (PQ.ui && PQ.ui.toast) PQ.ui.toast(msg, { ms: 6500 }); else setTimeout(go, 400); };
    go();
  }
  /* se llama cada vez que se va a decir algo, con el motor que se usa realmente */
  function used(engine) {
    const st = status();
    if (engine === 'none') tell('none', 'Este dispositivo no tiene voz en español. Los textos se ven en la pantalla.');
    else if (engine === 'device' && st.why === 'missing') tell('missing', 'Aquí no están las voces grabadas. Uso la voz de este dispositivo.');
    else if (engine === 'device' && st.why === 'broken') tell('broken', 'No puedo abrir las voces grabadas. Uso la voz de este dispositivo.');
  }
  function clipsFailed(reason) {
    if (reason === 'blocked') return;                     // solo falta un toque del usuario
    clipsBroken = true; pool.clear();
  }

  /* ---------- API ---------- */
  PQ.tts = {
    clipKey, plan, play, cfg, save, status, used, clipsFailed,
    neuralReady, naturalDevice,
    usingNatural: () => !!naturalDevice(),
    deviceVoices: () => vlist.map((x) => x.v),
    deviceInfo: () => vlist.slice(),
    deviceOK,
    chosenDevice: () => (cfg.device ? vlist.map((x) => x.v).find((v) => v.name === cfg.device) || null : null),
    canSpeak: (text, voice) => !!plan(text, voice) || deviceOK(),
    clipCount: () => (PQ.AUDIO && PQ.AUDIO.n) || 0
  };
  PQ.voiceAvailable = () => neuralReady() || deviceOK();
  PQ.hasSpanishVoice = () => (!!(PQ.AUDIO && PQ.AUDIO.k)) || vlist.length > 0;

  /* ---------- ventana de ajustes de voz ---------- */
  const SAMPLE = { PIPO: '¡Hola! Soy Pipo. Así suena mi voz.' };
  const PERS = [['KITTEN', 'Niña'], ['ALTO', 'Niño'], ['TENOR', 'Robot'], ['SQUEAK', 'Animal pequeño'], ['GIANT', 'Animal grande']];
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  PQ.openVoiceSettings = function () {
    if (!PQ.ui || !PQ.ui.modal) return;
    const body = el('div', 'vset');
    const state = el('div', 'vstate'); body.appendChild(state);
    const paintState = () => {
      const neu = clipsBroken ? 'Voces grabadas: no se pueden abrir los archivos de la carpeta «audio»' : PQ.AUDIO && PQ.AUDIO.k ? 'Voces grabadas: disponibles (' + (PQ.AUDIO.n || '') + ' frases)' : 'Voces grabadas: no están (falta la carpeta «audio»)';
      const dv = vlist[0];
      const dev = deviceOK() ? (dv ? 'Voz del dispositivo: ' + dv.name + ' (' + dv.lang + ')' + (dv.spain ? '' : ' · no es de España') : 'Voz del dispositivo: la predeterminada (es-ES)') : 'Voz del dispositivo: no hay ninguna voz en español';
      state.innerHTML = '<div class="vnow"><b>Ahora se usa:</b> <span></span></div><div><b>Idioma:</b> español de España (es-ES)</div><div>' + neu + '</div><div>' + dev + '</div>';
      state.querySelector('.vnow span').textContent = status().label;
    };
    paintState();
    const row = (label, ctl) => { const r = el('div', 'vrow'); r.appendChild(el('label', '', label)); r.appendChild(ctl); body.appendChild(r); return r; };

    /* animaciones y modo tranquilo */
    const sw = (key, text, help) => {
      const b = el('button', 'vswitch'); b.type = 'button'; b.setAttribute('role', 'switch');
      const paint = () => { b.setAttribute('aria-checked', String(!!PQ.prefs[key])); b.innerHTML = '<span class="knob" aria-hidden="true"></span><span class="st"><b></b><small></small></span>'; b.querySelector('b').textContent = text; b.querySelector('small').textContent = help; };
      b.onclick = () => { PQ.prefs[key] = !PQ.prefs[key]; PQ.savePrefs(); paint(); };
      paint(); return b;
    };
    const anim = el('div', 'vsw');
    anim.appendChild(sw('calm', 'Modo tranquilo', 'Sin animaciones ni sonidos de la interfaz. Los programas funcionan igual.'));
    anim.appendChild(sw('fade', 'Fundido al cambiar de disfraz', 'Los cambios de disfraz y de fondo se ven más suaves.'));
    anim.appendChild(sw('uiSound', 'Sonidos de la interfaz', 'Un «clic» al encajar un bloque y una melodía al conseguir un reto.'));
    row('Animaciones y sonidos', anim);

    /* motor */
    const eng = el('div', 'vseg');
    const ENG = [['auto', 'Automática (recomendada)'], ['clips', 'Grabadas'], ['device', 'Solo la del dispositivo']];
    ENG.forEach(([v, t]) => {
      const b = el('button', 'btn ' + (cfg.engine === v ? 'ok' : ''), t); b.type = 'button'; b.setAttribute('aria-pressed', String(cfg.engine === v));
      b.onclick = () => { cfg.engine = v; save(); [...eng.children].forEach((c, k) => { const on = ENG[k][0] === v; c.classList.toggle('ok', on); c.setAttribute('aria-pressed', String(on)); }); paintState(); };
      eng.appendChild(b);
    });
    row('Motor de voz', eng);

    /* velocidad y volumen */
    const mkRange = (min, max, step, val, fmt, onInput) => {
      const w = el('div', 'vrange'); const r = el('input'); r.type = 'range'; r.min = min; r.max = max; r.step = step; r.value = val;
      const o = el('output', '', fmt(val));
      r.oninput = () => { o.textContent = fmt(r.value); onInput(+r.value); save(); };
      w.appendChild(r); w.appendChild(o); return w;
    };
    row('Velocidad', mkRange(0.7, 1.3, 0.05, cfg.rate, (v) => (+v < 0.95 ? 'Lenta' : +v > 1.05 ? 'Rápida' : 'Normal') + ' · ×' + (+v).toFixed(2), (v) => { cfg.rate = v; }));
    row('Volumen', mkRange(0, 1, 0.05, cfg.volume, (v) => Math.round(v * 100) + ' %', (v) => { cfg.volume = v; }));

    const sample = (voice, opt) => { PQ.stopVoice && PQ.stopVoice(); PQ.utter(SAMPLE[voice] || '¡Hola! Así sueno yo.', voice, opt); };

    /* Pipo: femenina / masculina */
    const pip = el('div', 'vseg');
    [['f', 'Femenina'], ['m', 'Masculina']].forEach(([v, t]) => {
      const b = el('button', 'btn ' + (cfg.pipo === v ? 'ok' : ''), '▶ ' + t); b.type = 'button'; b.setAttribute('aria-pressed', String(cfg.pipo === v));
      b.onclick = () => { cfg.pipo = v; save(); [...pip.children].forEach((c, i) => { const on = i === (v === 'f' ? 0 : 1); c.classList.toggle('ok', on); c.setAttribute('aria-pressed', String(on)); }); sample('PIPO'); };
      pip.appendChild(b);
    });
    row('Voz de Pipo', pip);

    /* personajes */
    const per = el('div', 'vseg wrap');
    PERS.forEach(([k, t]) => { const b = el('button', 'btn', '▶ ' + t); b.type = 'button'; b.onclick = () => sample(k); per.appendChild(b); });
    row('Voces de los personajes', per);

    /* sonidillos de personaje */
    const fxb = el('button', 'btn ' + (cfg.fx ? 'ok' : ''), cfg.fx ? 'Activados' : 'Desactivados'); fxb.type = 'button'; fxb.setAttribute('aria-pressed', String(cfg.fx));
    fxb.onclick = () => { cfg.fx = !cfg.fx; save(); fxb.textContent = cfg.fx ? 'Activados' : 'Desactivados'; fxb.classList.toggle('ok', cfg.fx); fxb.setAttribute('aria-pressed', String(cfg.fx)); if (cfg.fx) sample('SQUEAK'); };
    row('Sonidillos de personajes', fxb);

    /* voz del dispositivo */
    if (vlist.length) {
      const sel = el('select'); sel.setAttribute('aria-label', 'Voz del dispositivo');
      sel.appendChild(new Option('Automática (la mejor en español)', ''));
      vlist.forEach((x) => sel.appendChild(new Option(x.name + ' · ' + x.lang, x.name)));
      sel.value = cfg.device || '';
      sel.onchange = () => { cfg.device = sel.value; save(); };
      const w = el('div', 'vseg'); w.appendChild(sel);
      const b = el('button', 'btn', '▶ Probar'); b.type = 'button'; b.onclick = () => sample('PIPO', { engine: 'device' }); w.appendChild(b);
      row('Voz del dispositivo (respaldo)', w);
    }
    body.appendChild(el('p', 'vnote', 'Automática: si tu dispositivo tiene una voz española «natural» (Microsoft Natural, Google, Siri…) se usa para todo, porque suele sonar mejor; si no, se usan las voces grabadas. «Grabadas» fuerza las voces neuronales incluidas. Lo que escribe el alumnado en «decir en voz alta» siempre se lee con la voz del dispositivo.'));
    PQ.ui.modal({ title: 'Ajustes', size: 'lg', body, buttons: [{ label: 'Listo', cls: 'ok' }] });
  };
  const gear = document.getElementById('btnVoiceSet');
  if (gear) gear.addEventListener('click', () => PQ.openVoiceSettings());
})(typeof window !== 'undefined' ? window : globalThis);
