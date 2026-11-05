/* PequeBloques — diseñado por David OZC
 * prosody.js: capa de interpretación previa de la voz (español de España).
 *
 * El motor de voz es el del navegador (Web Speech API). Solo admite, por cada «utterance»,
 * texto plano, voz, tono (pitch 0–2), velocidad (rate) y volumen. No hay SSML fiable, ni pausas
 * ni énfasis por palabra. Por eso esta capa trabaja así:
 *   1. Analiza el texto: oraciones, tipo (afirmación, pregunta abierta o cerrada, exclamación,
 *      suspensiva), intención (saludo, felicitación, instrucción, advertencia, duda, sorpresa).
 *   2. Lo parte en grupos fónicos (por comas y por conjunciones en frases largas), separa el
 *      final de la frase y, como mucho, UNA palabra de énfasis, y asigna a cada trozo tono,
 *      velocidad y volumen distintos: descenso al final de las afirmaciones, subida en las
 *      preguntas cerradas, energía en las exclamaciones, tono sostenido en las suspensivas.
 *   3. Los trozos de una misma oración se encolan seguidos; entre oraciones se deja la pausa
 *      que corresponde a su puntuación.
 * La intensidad del contorno se adapta al personaje (el robot es casi monótono a propósito).
 * Lo que NO puede hacer (respiraciones, curvas continuas dentro de una palabra) no se simula.
 */
(function (g) {
  'use strict';
  const PQ = g.PQ = g.PQ || {};

  const INTERROG = /^(qu[eé]|c[oó]mo|cu[aá]ndo|d[oó]nde|adónde|adonde|cu[aá]l(es)?|qui[eé]n(es)?|cu[aá]nt[oa]s?|por qu[eé]|para qu[eé])$/i;
  const TEASER = /^(sabes|sab[ií]as|adivinas|imaginas|adivina|imagina|a que|te has dado cuenta)/i;
  const PRAISE = /(muy bien|genial|enhorabuena|felicidades|incre[ií]ble|lo has (conseguido|logrado|hecho)|buen trabajo|perfecto|excelente|fant[aá]stic|bravo|magn[ií]fic|qu[eé] buena|has acertado|lo has arreglado|misi[oó]n cumplida)/i;
  const WARN = /(cuidado|ojo\b|atenci[oó]n|peligro|no (toques|corras|te |lo toques)|ay\b|uy\b)/i;
  const INSTR = /^(toca|pulsa|mira|escucha|pon\b|elige|arrastra|busca|recuerda|cuenta|prueba|observa|f[ií]jate|primero|despu[eé]s|luego|por [uú]ltimo|ahora|haz\b|coge|usa|piensa|dime|ayuda|ordena|completa|sigue)/i;
  const DOUBT = /(no estoy (completamente |del todo |muy )?seguro|quiz[aá]s?|tal vez|puede que|a lo mejor|creo que|no s[eé] si|me parece que)/i;
  const SURPRISE = /(de verdad|en serio|de veras|realmente|vaya|uau|guau\b|oh\b|incre[ií]ble|qu[eé] sorpresa)/i;
  const GREET = /^(hola|buenos d[ií]as|buenas|bienvenid)/i;
  const CONJ = /^(pero|porque|cuando|mientras|aunque|y|e|o|que|si|para|as[ií] que|adem[aá]s|despu[eé]s|luego|entonces)$/i;
  const EMPH = [
    /^(qué|cómo|cuándo|dónde|cuál|quién|cuánto)$/,   // solo con tilde: «como» sin tilde es conjunción
    /^(primero|despu[eé]s|luego|[uú]ltimo|segundo|tercero)$/i,
    /^(\d+|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|una)$/i,
    /^(amarill[oa]s?|azul(es)?|verde[s]?|roj[oa]s?|rosa|naranja)$/i,
    /^(nunca|nada|siempre|todos?|todas?|solo|s[oó]lo|muy|much[oí]simo|im?portante|interesante|cuidado|r[aá]pido)$/i,
    /^(incre[ií]ble|genial|fant[aá]stic[oa]|perfecto|bonit[oa]|grand[ei]|enorme)$/i
  ];
  /* cuánto se nota el contorno en cada voz (1 = completo) */
  const EXPR = { KITTEN: 1.0, ALTO: 1.0, SQUEAK: 0.8, GIANT: 0.6, TENOR: 0.3, PIPO: 1.0, PIPOM: 1.0 };

  const FUNC = /^(y|e|o|u|de|del|la|el|los|las|un|una|unos|unas|a|al|en|con|por|para|que|se|lo|su|sus|mi|tu|es|son|como|si|sin|sobre|entre|hasta)$/i;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const hash = (t) => { let h = 7; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) % 9973; return h / 9973; };
  const words = (s) => s.split(/\s+/).filter(Boolean);
  const bare = (w) => w.replace(/[¿¡?!.,;:…«»"“”()]/g, '');

  /* 1. oraciones ---------------------------------------------------------------- */
  function sentences(text) {
    text = String(text).replace(/[«»]/g, '').replace(/\.{2,}/g, '…').replace(/\s+/g, ' ').trim();
    const out = []; let buf = '';
    const push = () => { if (buf.trim()) out.push(buf.trim()); buf = ''; };
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if ((c === '¿' || c === '¡') && buf.trim()) push();
      buf += c;
      if (/[.!?…]/.test(c)) {
        while (i + 1 < text.length && /[.!?…]/.test(text[i + 1])) buf += text[++i];
        if (i + 1 >= text.length || text[i + 1] === ' ' || /[¿¡]/.test(text[i + 1])) push();
      }
    }
    push();
    return out;
  }

  function classify(s) {
    const t = s.trim(); const w = words(t.replace(/^[¿¡]/, ''));
    const first = bare(w[0] || '').toLowerCase();
    const end = t.replace(/["»)\s]+$/, '').slice(-1);
    let type = 'statement', sub = '';
    if (t[0] === '¿' || end === '?') {
      type = 'question';
      const f2 = bare(w[0] || '') + ' ' + bare(w[1] || '');
      if (INTERROG.test(first) || INTERROG.test(f2.trim()) || /^(y|pero)$/i.test(first) && INTERROG.test(bare(w[1] || ''))) sub = 'open';
      else if (TEASER.test(t.replace(/^[¿¡]/, '')) && w.some((x, i) => i > 0 && INTERROG.test(bare(x)))) sub = 'teaser';
      else sub = 'closed';
    } else if (t[0] === '¡' || end === '!') type = 'exclamation';
    else if (end === '…') type = 'suspense';
    else if (end === ',' || end === ';' || end === ':') type = 'open-ended';       // trozo anterior a una pregunta o exclamación
    return { type, sub };
  }

  /* 2. grupos fónicos ---------------------------------------------------------- */
  function groups(body) {
    const parts = body.match(/[^,;:]+[,;:]?\s*/g) || [body];
    const out = [];
    parts.forEach((p) => {
      const w = words(p);
      if (w.length <= 11) { out.push(p.trim()); return; }
      let cut = -1;
      for (let i = 4; i <= w.length - 4; i++) if (CONJ.test(bare(w[i]))) { cut = i; break; }
      if (cut < 0) cut = Math.floor(w.length / 2);
      out.push(w.slice(0, cut).join(' ')); out.push(w.slice(cut).join(' '));
    });
    return out.filter(Boolean);
  }

  function emphasisIndex(w, cls) {
    if (w.length < 4) return -1;
    for (let k = 0; k < EMPH.length; k++) {
      if (k === 0 && cls.type !== 'question' && cls.type !== 'exclamation') continue;
      for (let i = 0; i < w.length; i++) if (EMPH[k].test(bare(w[i]))) return i;
    }
    return -1;
  }

  const BASE = {
    statement:  { body: [1.00, 1.00], cont: [1.03, 1.00], tail: [0.91, 0.93], one: [0.96, 0.98], vol: 0.95, pause: 0.32 },
    'open-ended': { body: [1.00, 1.00], cont: [1.03, 1.00], tail: [1.03, 0.98], one: [1.02, 0.98], vol: 0.95, pause: 0.12 },
    'question-open':   { body: [1.05, 1.00], cont: [1.05, 1.00], tail: [1.02, 0.95], one: [1.04, 0.98], vol: 0.97, pause: 0.30 },
    'question-closed': { body: [1.03, 1.00], cont: [1.04, 1.00], tail: [1.22, 0.96], one: [1.15, 0.96], vol: 0.97, pause: 0.30 },
    'question-teaser': { body: [1.04, 0.96], cont: [1.05, 0.96], tail: [1.12, 0.92], one: [1.10, 0.94], vol: 0.97, pause: 0.42 },
    exclamation: { body: [1.10, 1.06], cont: [1.10, 1.05], tail: [1.05, 1.00], one: [1.10, 1.04], vol: 1.0, pause: 0.28 },
    suspense:   { body: [0.98, 0.94], cont: [1.00, 0.94], tail: [1.00, 0.90], one: [0.99, 0.92], vol: 0.92, pause: 0.55 }
  };

  /* modificadores por intención (multiplican tono y velocidad) */
  function intent(s, cls) {
    let p = 1, r = 1, tag = [];
    const t = s.replace(/^[¿¡]/, '');
    if (GREET.test(t)) { p *= 1.05; r *= 1.02; tag.push('saludo'); }
    if (PRAISE.test(t)) { p *= 1.04; r *= 1.03; tag.push('felicitación'); }
    if (WARN.test(t)) { p *= 0.98; r *= 0.92; tag.push('advertencia'); }
    if (INSTR.test(t) && cls.type !== 'question') { r *= 0.95; tag.push('instrucción'); }
    if (DOUBT.test(t)) { p *= 1.02; r *= 0.93; tag.push('duda'); }
    if (SURPRISE.test(t)) { p *= 1.04; tag.push('sorpresa'); }
    return { p: clamp(p, 0.85, 1.1), r: clamp(r, 0.85, 1.1), tag };
  }

  function planSentence(s, key, idx) {
    const cls = classify(s);
    const kind = cls.type === 'question' ? 'question-' + cls.sub : cls.type;
    const B = BASE[kind] || BASE.statement;
    const it = intent(s, cls);
    const ex = EXPR[key] === undefined ? 1 : EXPR[key];
    const j1 = (hash(s) - 0.5) * 0.05 * ex, j2 = (hash(s + '#') - 0.5) * 0.05 * ex;
    const decl = cls.type === 'statement' ? 1 - 0.012 * Math.min(idx, 4) * ex : 1;      // las afirmaciones seguidas no repiten el mismo patrón
    const fac = (f, vol) => ({
      p: clamp(1 + (f[0] * it.p * decl - 1) * ex + j1, 0.6, 1.25),
      r: clamp(1 + (f[1] * it.r - 1) * ex + j2, 0.75, 1.3),
      v: clamp(vol === undefined ? B.vol : vol, 0.6, 1)
    });
    const emphF = (f, k) => ({ p: clamp(f.p * (1 + 0.08 * ex * (k || 1)), 0.6, 1.3), r: clamp(f.r * (1 - 0.1 * ex * (k || 1)), 0.7, 1.3), v: 1 });
    const tailV = cls.type === 'statement' ? B.vol - 0.04 : B.vol;
    const w = words(s);
    const segs = [];
    const add = (t, f) => { if (t && t.trim()) segs.push({ t: t.trim(), p: f.p, r: f.r, v: f.v }); };

    if (w.length <= 3) {                       // frases cortas: un solo trozo, contorno suave
      add(s, fac(B.one, B.vol));
    } else {
      const parts = groups(s);
      parts.forEach((ph, i) => {
        const last = i === parts.length - 1;
        const pw = words(ph);
        const role = last ? 'tail' : (i === 0 ? 'body' : 'cont');
        if (!last) {
          const e = pw.length >= 5 && i === 0 ? emphasisIndex(pw, cls) : -1;
          if (e >= 0 && e < pw.length - 1) { add(pw.slice(0, e).join(' '), fac(B[role])); add(pw[e], emphF(fac(B[role]))); add(pw.slice(e + 1).join(' '), fac(B[role])); }
          else add(ph, fac(B[role]));
          return;
        }
        /* último grupo: cuerpo + final (las dos últimas palabras, sin dejar un artículo o una conjunción colgando) */
        const eIdx = parts.length === 1 ? emphasisIndex(pw, cls) : -1;
        const rises = cls.type === 'question' && cls.sub !== 'open';
        const keepTail = (pw.length >= 5 || (rises && pw.length >= 4)) && cls.type !== 'exclamation';
        let head = pw, tail = [];
        if (keepTail) {
          head = pw.slice(0, -2); tail = pw.slice(-2);
          while (head.length > 2 && FUNC.test(bare(head[head.length - 1]))) tail.unshift(head.pop());
        }
        const bodyF = fac(parts.length === 1 ? B.body : B.cont);
        if (eIdx >= 0 && eIdx < head.length) {
          if (eIdx === 0) { add(head[0], emphF(bodyF)); add(head.slice(1).join(' '), bodyF); }
          else { add(head.slice(0, eIdx).join(' '), bodyF); add(head.slice(eIdx).join(' '), emphF(bodyF, 0.5)); }
        } else add(head.join(' '), bodyF);
        if (tail.length) add(tail.join(' '), fac(B.tail, tailV));
      });
      if (segs.length === 0) add(s, fac(B.one));
    }
    return { text: s, kind, tags: it.tag, segs, pause: B.pause };
  }

  /* API ------------------------------------------------------------------------ */
  function plan(text, key) {
    const ss = sentences(text);
    const units = ss.map((s, i) => planSentence(s, key, i));
    if (units.length) units[units.length - 1].pause = 0;
    return units;
  }
  /* sin interpretación (comportamiento anterior): un solo trozo plano */
  function flat(text) { return [{ text: String(text), kind: 'plano', tags: [], pause: 0, segs: [{ t: String(text), p: 1, r: 1, v: 1 }] }]; }

  PQ.prosody = { plan, flat, sentences, classify };
})(typeof window !== 'undefined' ? window : globalThis);
