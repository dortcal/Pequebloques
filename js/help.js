/* PequeBloques — diseñado por David OZC
 * help.js: Pipo, el botón «¿Me ayudas?» (pistas con voz y demostración) y la voz de las explicaciones
 */
(function (g) {
  'use strict';
  const PQ = g.PQ;
  const $ = (s) => document.querySelector(s);

  PQ.PIPO = '<svg class="mascot" viewBox="0 0 100 100" aria-hidden="true">' +
    '<ellipse cx="50" cy="92" rx="26" ry="5" fill="rgba(0,0,0,.15)"/>' +
    '<path d="M50 8 C78 8 90 32 88 58 C86 80 70 90 50 90 C30 90 14 80 12 58 C10 32 22 8 50 8Z" fill="#8B5CF6" stroke="#5B3BD0" stroke-width="4"/>' +
    '<path d="M30 20 Q20 6 12 10 Q16 22 26 28Z M70 20 Q80 6 88 10 Q84 22 74 28Z" fill="#FFBF00" stroke="#CC9900" stroke-width="3" stroke-linejoin="round"/>' +
    '<ellipse cx="50" cy="66" rx="24" ry="18" fill="#C9B6FF"/>' +
    '<circle cx="36" cy="46" r="11" fill="#fff" stroke="#3a2a80" stroke-width="3"/><circle cx="64" cy="46" r="11" fill="#fff" stroke="#3a2a80" stroke-width="3"/>' +
    '<circle cx="38" cy="48" r="5" fill="#2b1d66"/><circle cx="62" cy="48" r="5" fill="#2b1d66"/>' +
    '<circle cx="40" cy="45" r="1.8" fill="#fff"/><circle cx="64" cy="45" r="1.8" fill="#fff"/>' +
    '<path d="M38 66 Q50 78 62 66" fill="none" stroke="#3a2a80" stroke-width="4" stroke-linecap="round"/>' +
    '<circle cx="24" cy="62" r="5" fill="#FF8FB5" opacity=".7"/><circle cx="76" cy="62" r="5" fill="#FF8FB5" opacity=".7"/></svg>';

  /* ---------- voz de las explicaciones ---------- */
  const MUTE_KEY = 'pequebloques.guideMute';
  let muted = false;
  try { muted = localStorage.getItem(MUTE_KEY) === '1'; } catch (e) { /* sin almacenamiento */ }
  PQ.guideVoiceOn = () => !muted && !!g.speechSynthesis;
  PQ.setGuideMute = (m) => { muted = !!m; try { localStorage.setItem(MUTE_KEY, m ? '1' : '0'); } catch (e) { /* nada */ } if (m) { try { g.speechSynthesis.cancel(); } catch (e) { /* nada */ } } };
  /* Pipo habla siempre con la misma voz (la del «gatito»: clara y amable). */
  PQ.say = function (text, force) {
    if (!force && !PQ.guideVoiceOn()) return;
    try { g.speechSynthesis.cancel(); } catch (e) { /* nada */ }
    if (PQ.utter) PQ.utter(String(text).replace(/«|»/g, ''), 'KITTEN');
  };
  PQ.hasSpanishVoice = () => { try { return g.speechSynthesis.getVoices().some((v) => /^es/i.test(v.lang)); } catch (e) { return false; } };

  /* ---------- análisis de la situación ---------- */
  const B = () => PQ.BLOCKS;
  function used(ops) {
    const found = {};
    PQ.allTargets(PQ.S.project).forEach((t) => {
      (function walk(arr) {
        (arr || []).forEach((b) => { found[b.op] = true; if (b.in) Object.keys(b.in).forEach((k) => walk([b.in[k]])); if (b.cond) walk([b.cond]); walk(b.sub); walk(b.sub2); });
      })([].concat.apply([], t.scripts.map((s) => s.blocks)));
    });
    return ops ? ops.some((o) => found[o]) : found;
  }
  function emptyC(arr) {
    let r = null;
    (function walk(a) { (a || []).forEach((b) => { if (!r && B()[b.op].kind === 'c' && (!b.sub || !b.sub.length)) r = b; walk(b.sub); walk(b.sub2); }); })(arr);
    return r;
  }

  function hints() {
    const S = PQ.S, t = S.target, out = [];
    const sc = t.scripts;
    const kindOf = (b) => B()[b.op].kind;
    if (PQ.Tut && PQ.Tut.currentStep) {
      const st = PQ.Tut.currentStep();
      if (st) out.push({ text: st.text, op: st.hl, demo: !!st.hl });
    }
    if (PQ._challenge) out.push({ text: PQ._challenge, ui: null });
    if (!t.isStage && !t.visible) out.push({ text: 'Tu personaje está escondido. Pulsa el ojo abierto para que se vea.', ui: '#btnShow' });
    if (!sc.length) {
      out.push({ text: 'Vamos a empezar. Arrastra el bloque amarillo de la bandera hasta el espacio blanco.', op: 'event_whenflagclicked', demo: true });
    } else {
      const noHat = sc.filter((s) => kindOf(s.blocks[0]) !== 'hat' && kindOf(s.blocks[0]) !== 'rep' && kindOf(s.blocks[0]) !== 'bool');
      const hatOnly = sc.filter((s) => kindOf(s.blocks[0]) === 'hat' && s.blocks.length === 1);
      const e = sc.map((s) => emptyC(s.blocks)).find(Boolean);
      if (noHat.length && !sc.some((s) => kindOf(s.blocks[0]) === 'hat')) {
        out.push({ text: 'Tu programa necesita un bloque de inicio. Arrastra el bloque amarillo de la bandera y ponlo arriba del todo.', op: 'event_whenflagclicked', demo: true });
      }
      if (hatOnly.length) {
        const m = t.isStage ? 'looks_nextbackdrop' : 'motion_movesteps';
        out.push({ text: 'Ya tienes el inicio. Ahora engancha un bloque justo debajo. Prueba con este.', op: m, demo: true });
      }
      if (e) {
        out.push({ text: 'Este bloque naranja está vacío. Arrastra otro bloque dentro del hueco.', op: t.isStage ? 'looks_nextbackdrop' : 'looks_nextcostume', demo: true });
      }
      if (!PQ.RT.threads.length && PQ.RT.flagCount === (PQ._helpFlag0 === undefined ? PQ.RT.flagCount : PQ._helpFlag0) && !hatOnly.length) {
        out.push({ text: '¡Ya lo tienes! Pulsa la bandera verde para ver qué hace tu programa.', ui: '#btnFlag' });
      }
      if (!used(['looks_sayforsecs', 'looks_say', 'text2speech_speakAndWait'])) {
        out.push({ text: 'Puedes hacer que tu personaje hable. Arrastra este bloque morado y escribe lo que quieras.', op: 'looks_sayforsecs', demo: true });
      }
      if (!used(['control_repeat', 'control_forever'])) {
        out.push({ text: 'Para repetir algo muchas veces, usa el bloque naranja de repetir. Mete dentro otros bloques.', op: 'control_repeat', demo: true });
      }
      if (!used(['sound_play', 'sound_playuntildone']) && t.sounds.length) {
        out.push({ text: 'Añade un sonido. Arrastra este bloque rosa.', op: 'sound_play', demo: true });
      }
    }
    out.push({ text: 'Toca un bloque para ver qué hace. Para borrar uno, arrástralo de vuelta a la lista de bloques.', op: null });
    out.push({ text: 'Si algo no sale bien, pulsa la flecha de deshacer. ¡Equivocarse es parte de aprender!', ui: '#btnUndo' });
    return out;
  }

  /* ---------- demostración con mano ---------- */
  function dropPoint(op) {
    const ws = $('#ws').getBoundingClientRect(), t = PQ.S.target;
    const kind = PQ.BLOCKS[op].kind;
    const scripts = Array.from(document.querySelectorAll('#wsin .script'));
    if (!scripts.length) return { x: ws.left + 60, y: ws.top + 70 };
    if (kind === 'hat') { const last = scripts[scripts.length - 1].getBoundingClientRect(); return { x: ws.left + 60, y: Math.min(ws.bottom - 70, last.bottom + 40) }; }
    const sc = t.scripts.findIndex((s) => PQ.BLOCKS[s.blocks[0].op].kind === 'hat');
    const el = scripts[sc >= 0 ? sc : 0].getBoundingClientRect();
    return { x: el.left, y: el.bottom - 2 };
  }
  const HAND = '<svg viewBox="0 0 48 56" width="48" height="56"><path d="M16 4c3 0 5 2 5 5v14l3-1c3-1 5 1 5 3l2-1c3-1 5 1 5 3l2-1c3-1 5 1 5 4v10c0 8-5 14-14 14h-5c-6 0-9-3-12-9L5 36c-2-3 0-6 3-5l5 4V9c0-3 1-5 3-5z" fill="#fff" stroke="#5B3BD0" stroke-width="3" stroke-linejoin="round"/></svg>';
  PQ.demoDrag = function (op) {
    PQ.ed.highlight(op);
    const src = document.querySelector('#pal .block[data-op="' + op + '"]');
    if (!src) return false;
    document.querySelectorAll('.ghostblock,.ghosthand').forEach((x) => x.remove());
    const sr = src.getBoundingClientRect(), to = dropPoint(op);
    const dx = to.x - sr.left, dy = to.y - sr.top;
    const ghost = src.cloneNode(true); ghost.classList.remove('pulse'); ghost.classList.add('ghostblock');
    ghost.style.cssText += ';position:fixed;left:' + sr.left + 'px;top:' + sr.top + 'px;margin:0;z-index:3500;pointer-events:none;font-size:' + getComputedStyle(src).fontSize;
    const hand = document.createElement('div'); hand.className = 'ghosthand'; hand.innerHTML = HAND;
    hand.style.cssText += ';position:fixed;left:' + (sr.left + 12) + 'px;top:' + (sr.top + sr.height / 2 - 6) + 'px;z-index:3501;pointer-events:none';
    document.body.appendChild(ghost); document.body.appendChild(hand);
    const kf = (extra) => [
      { transform: 'translate(0,0) scale(1)', opacity: 0, offset: 0 },
      { transform: 'translate(0,0) scale(1)', opacity: 1, offset: 0.12 },
      { transform: 'translate(0,0) scale(.94)', opacity: 1, offset: 0.25 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.94)', opacity: 1, offset: 0.75 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(1)', opacity: 1, offset: 0.88 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(1)', opacity: 0, offset: 1 }
    ];
    const opts = { duration: 3200, iterations: 2, easing: 'ease-in-out' };
    const a1 = ghost.animate(kf(), opts); hand.animate(kf(), opts);
    a1.onfinish = () => { ghost.remove(); hand.remove(); };
    setTimeout(() => { ghost.remove(); hand.remove(); }, 6800);
    return true;
  };

  /* ---------- tarjeta de ayuda ---------- */
  let idx = 0, list = [], open = false, idleT = 0;
  const ICO = {
    sound: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>',
    mute: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    hand: '<svg viewBox="0 0 24 24"><path d="M6 3l12 8-5 1.6L10.5 19z"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };
  function pulseUi(sel) {
    document.querySelectorAll('.pulse-ui').forEach((x) => x.classList.remove('pulse-ui'));
    if (!sel) return;
    const el = $(sel); if (!el) return;
    el.classList.add('pulse-ui'); setTimeout(() => el.classList.remove('pulse-ui'), 5000);
  }
  function render() {
    const box = $('#guide');
    const h = list[idx];
    if (PQ.Tut && PQ.Tut.active && PQ.Tut.active()) { /* el tutorial manda: se muestra en su tarjeta */ }
    box.hidden = false; box.classList.remove('done'); box.classList.add('help');
    box.innerHTML = PQ.PIPO + '<div class="gt"><div class="gs">Pipo te ayuda · ' + (idx + 1) + '/' + list.length + '</div><p></p><div class="gb"></div></div>';
    box.querySelector('p').textContent = h.text;
    const gb = box.querySelector('.gb');
    const btn = (ic, label, cls, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn big ' + cls; b.setAttribute('aria-label', label); b.title = label; b.innerHTML = ic + '<span>' + label + '</span>'; b.addEventListener('click', fn); gb.appendChild(b); return b; };
    btn(ICO.sound, 'Escuchar', 'pri', () => PQ.say(h.text, true));
    if (h.op && PQ.BLOCKS[h.op]) btn(ICO.hand, 'Enséñame', 'yel', () => { PQ.demoDrag(h.op); });
    if (list.length > 1) btn(ICO.next, 'Otra pista', '', () => { idx = (idx + 1) % list.length; render(); });
    btn(muted ? ICO.mute : ICO.sound, muted ? 'Voz apagada' : 'Voz', 'ghost', (e) => { PQ.setGuideMute(!muted); render(); });
    btn(ICO.close, 'Cerrar', 'ghost', () => PQ.Help.close());
    if (!PQ.hasSpanishVoice()) {
      const w = document.createElement('div'); w.className = 'gw'; w.textContent = 'Este dispositivo no tiene voz en español instalada: las pistas se verán pero quizá no se oigan.'; box.querySelector('.gt').appendChild(w);
    }
    if (h.op && PQ.BLOCKS[h.op]) PQ.ed.highlight(h.op); else PQ.ed.highlight(null);
    pulseUi(h.ui || null);
    PQ.say(h.text);
  }
  PQ.Help = {
    open() {
      PQ.app.showTab('code');
      list = hints(); idx = 0; open = true;
      PQ._helpFlag0 = PQ.RT.flagCount;
      resetIdle();
      render();
    },
    close() {
      open = false;
      const box = $('#guide');
      box.classList.remove('help');
      if (PQ.Tut && PQ.Tut.rerender && PQ.Tut.active && PQ.Tut.active()) PQ.Tut.rerender(); else { box.hidden = true; box.innerHTML = ''; }
      PQ.ed.highlight(null); pulseUi(null);
      try { g.speechSynthesis.cancel(); } catch (e) { /* nada */ }
    },
    isOpen: () => open,
    hints
  };

  /* ---------- «¿te quedas atascado?»: el botón se mueve si no pasa nada ---------- */
  function resetIdle() {
    clearTimeout(idleT);
    const b = $('#btnHelp'); if (b) b.classList.remove('wiggle');
    idleT = setTimeout(() => {
      const bb = $('#btnHelp');
      if (bb && !PQ.RT.threads.length && !document.querySelector('.modal-back')) bb.classList.add('wiggle');
    }, 45000);
  }
  PQ.helpActivity = resetIdle;
  document.addEventListener('pointerdown', (e) => { if (!e.target.closest('#btnHelp')) resetIdle(); }, true);
  document.addEventListener('keydown', resetIdle, true);
  document.addEventListener('DOMContentLoaded', () => {
    const b = $('#btnHelp');
    if (b) b.addEventListener('click', () => { if (PQ.Help.isOpen()) PQ.Help.close(); else PQ.Help.open(); });
    resetIdle();
  });
})(typeof window !== 'undefined' ? window : globalThis);
