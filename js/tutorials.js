/* PequeBloques — diseñado por David OZC
 * tutorials.js: tutoriales guiados con la mascota Pipo
 */
(function (g) {
  'use strict';
  const PQ = g.PQ;
  const $ = (s) => document.querySelector(s);

  const PIPO = PQ.PIPO;

  /* ---------- ayudas para comprobar el trabajo ---------- */
  function sprite() { return PQ.S.project.sprites[0]; }
  function walk(arr, fn) {
    (arr || []).forEach((b) => { fn(b); walk(b.sub, fn); walk(b.sub2, fn); });
  }
  function flagScripts() {
    const t = sprite();
    return t ? t.scripts.filter((s) => s.blocks[0] && s.blocks[0].op === 'event_whenflagclicked') : [];
  }
  function has(op, pred) {
    let ok = false;
    flagScripts().forEach((s) => walk(s.blocks.slice(1), (b) => { if (b.op === op && (!pred || pred(b))) ok = true; }));
    return ok;
  }
  function inRepeat(op) {
    let ok = false;
    flagScripts().forEach((s) => walk(s.blocks, (b) => { if (b.op === 'control_repeat') walk(b.sub, (c) => { if (c.op === op) ok = true; }); }));
    return ok;
  }
  const ran = (st) => PQ.RT.flagCount > st.flag0;

  /* ---------- tutoriales ---------- */
  const LIST = [
    {
      id: 'primer-paso', title: 'Mi primer paso', stars: 1, bg: 'playa', sprite: 'canario',
      desc: 'Aprende a arrastrar bloques y a hacer que el canario se mueva.',
      steps: [
        { say: '¡Hola! Soy Pipo. Vamos a mover al canario. Arrastra el bloque amarillo «al hacer clic en la bandera» hasta la zona blanca.', hl: 'event_whenflagclicked', ok: () => flagScripts().length > 0 },
        { say: '¡Muy bien! Ahora arrastra «mover 10 pasos» y engánchalo debajo del bloque amarillo.', hl: 'motion_movesteps', cat: 'motion', ok: () => has('motion_movesteps') },
        { say: 'Toca el número 10 y escribe 100 para que el canario vaya más lejos.', ok: () => has('motion_movesteps', (b) => parseFloat(b.f.STEPS) >= 50) },
        { say: 'Ahora pulsa la bandera verde de arriba. ¡A ver qué pasa!', ok: (st) => ran(st) }
      ],
      end: '¡Lo has conseguido! Has creado tu primer programa. Prueba otros números.'
    },
    {
      id: 'habla-gira', title: 'Habla y gira', stars: 1, bg: 'playa', sprite: 'canario',
      desc: 'Haz que el canario diga algo y dé vueltas con un bucle.',
      steps: [
        { say: 'Empieza igual: arrastra «al hacer clic en la bandera».', hl: 'event_whenflagclicked', ok: () => flagScripts().length > 0 },
        { say: 'Engancha «decir ¡Hola! durante 2 segundos». Puedes escribir lo que quieras.', hl: 'looks_sayforsecs', cat: 'looks', ok: () => has('looks_sayforsecs') },
        { say: 'Para repetir, busca el bloque naranja «repetir 10 veces» y engánchalo debajo.', hl: 'control_repeat', cat: 'control', ok: () => has('control_repeat') },
        { say: 'Mete dentro del bucle «girar ↻ 15 grados». Arrástralo al hueco del bloque naranja.', hl: 'motion_turnright', cat: 'motion', ok: () => inRepeat('motion_turnright') },
        { say: '¡Pulsa la bandera verde y mira cómo gira!', ok: (st) => ran(st) }
      ],
      end: '¡Genial! Un bucle repite las órdenes muchas veces. Cambia el 10 y el 15 y mira qué pasa.'
    },
    {
      id: 'anima-canario', title: '¡Anima al canario!', stars: 2, bg: 'playa', sprite: 'canario',
      desc: 'Cambia de disfraz una y otra vez para que bata las alas.',
      steps: [
        { say: 'Vamos a hacer que el canario vuele. Arrastra «al hacer clic en la bandera».', hl: 'event_whenflagclicked', ok: () => flagScripts().length > 0 },
        { say: 'Engancha el bloque naranja «repetir 10 veces».', hl: 'control_repeat', cat: 'control', ok: () => has('control_repeat') },
        { say: 'Dentro del bucle pon «siguiente disfraz». ¡Así bate las alas!', hl: 'looks_nextcostume', cat: 'looks', ok: () => inRepeat('looks_nextcostume') },
        { say: 'Añade también «esperar 1 segundos» dentro del bucle, para que no vaya demasiado rápido. Pon 0.2.', hl: 'control_wait', cat: 'control', ok: () => inRepeat('control_wait') },
        { say: 'Pulsa la bandera verde para ver volar al canario.', ok: (st) => ran(st) }
      ],
      end: '¡Fantástico! Así se hacen las animaciones: cambiar de disfraz muchas veces. Añade «mover 5 pasos» dentro del bucle y volará.'
    }
  ];
  PQ.TUT = { list: LIST.map((t) => ({ id: t.id, title: t.title, desc: t.desc, stars: t.stars, bg: t.bg, sprite: t.sprite })) };

  /* ---------- motor del tutorial ---------- */
  let cur = null; // {t, i, flag0}
  function render() {
    const box = $('#guide');
    box.classList.remove('help');
    if (!cur) { box.hidden = true; box.classList.remove('done'); box.innerHTML = ''; PQ.ed.highlight(null); return; }
    const t = cur.t, done = cur.i >= t.steps.length;
    box.hidden = false; box.classList.toggle('done', done);
    box.innerHTML = PIPO + '<div class="gt"><div class="gs"></div><p></p><div class="gb"></div></div>';
    box.querySelector('.gs').textContent = done ? '¡Terminado!' : t.title + ' · ' + (cur.i + 1) + ' de ' + t.steps.length;
    const text = done ? t.end : t.steps[cur.i].say;
    box.querySelector('p').textContent = text;
    const gb = box.querySelector('.gb');
    const btn = (label, cls, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn ' + cls; b.innerHTML = label; b.addEventListener('click', fn); gb.appendChild(b); };
    btn('🔊 Escuchar', '', () => PQ.say(text, true));
    if (done) {
      btn('Más cuentos y retos', 'pri', () => { PQ.Tut.stop(); PQ.openStories('all'); });
      btn('Seguir jugando', '', () => PQ.Tut.stop());
    } else {
      btn('Salir', '', () => PQ.Tut.stop());
    }
    PQ.say(text);
    if (!done) {
      const s = t.steps[cur.i];
      if (s.cat) { const c = document.querySelector('#cats .cat[data-cat="' + s.cat + '"]'); if (c) c.click(); }
      PQ.ed.highlight(s.hl || null);
    } else PQ.ed.highlight(null);
  }
  PQ.Tut = {
    active: () => !!cur,
    rerender: () => render(),
    currentStep: () => (cur && cur.i < cur.t.steps.length ? { text: cur.t.steps[cur.i].say, hl: cur.t.steps[cur.i].hl } : null),
    start(id) {
      const t = LIST.find((x) => x.id === id); if (!t) return;
      PQ.loadProject(PQ.defaultProject(), { noAuto: true });
      PQ.app.showTab('code');
      cur = { t, i: 0, flag0: PQ.RT.flagCount };
      PQ.S.project.title = t.title; $('#title').value = t.title;
      render();
    },
    stop(silent) {
      if (!cur) return;
      cur = null; if (!silent || true) render();
      try { if (g.speechSynthesis) g.speechSynthesis.cancel(); } catch (e) { /* nada */ }
      if (PQ.Help) { PQ.Help.isOpen() && PQ.Help.close(); }
    },
    check() {
      if (!cur || cur.i >= cur.t.steps.length) return;
      let adv = false;
      while (cur.i < cur.t.steps.length && cur.t.steps[cur.i].ok(cur)) {
        cur.i++; adv = true; cur.flag0 = PQ.RT.flagCount;
      }
      if (adv) {
        render();
        if (cur.i >= cur.t.steps.length) PQ.ui.confetti();
      }
    },
    welcome(hasAuto, recover) {
      PQ.ui.toast('¡Hola! ¿Quieres un tutorial?', {
        ms: 7000,
        actions: [{ label: 'Sí, empezar', cls: 'yel', onClick: () => PQ.Tut.start('primer-paso') }].concat(
          hasAuto ? [{ label: 'Recuperar último', cls: '', onClick: recover }] : [])
      });
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
