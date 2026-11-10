/* PequeBloques — diseñado por David OZC
 * tutorials.js: tutoriales guiados con la mascota Pipo
 */
/* carga diferida: este módulo no se ejecuta al arrancar, sino la primera vez que hace falta (ver PQ.defer en util.js) */
PQ.defer('tutorials', function (g) {
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
  const acted = (st) => PQ.RT.runCount > st.run0;

  /* búsquedas generales (cualquier personaje, cualquier programa, bloques encajados) */
  function eachBlock(b, fn) {
    if (!b) return;
    fn(b);
    (b.sub || []).forEach((x) => eachBlock(x, fn));
    (b.sub2 || []).forEach((x) => eachBlock(x, fn));
    eachBlock(b.cond, fn);
    if (b.in) Object.keys(b.in).forEach((k) => eachBlock(b.in[k], fn));
  }
  const spr = (n) => PQ.S.project.sprites[n || 0];
  const HAT = { flag: 'event_whenflagclicked', click: 'event_whenthisspriteclicked', key: 'event_whenkeypressed', recv: 'event_whenbroadcastreceived' };
  /* programas de un personaje que empiezan por el sombrero dado */
  function hats(t, hat, pred) {
    return t ? t.scripts.filter((s) => s.blocks[0] && s.blocks[0].op === HAT[hat] && (!pred || pred(s.blocks[0]))) : [];
  }
  /* ¿hay un bloque «op» dentro de un programa con ese sombrero? */
  function inHat(t, hat, op, pred, hpred) {
    let ok = false;
    hats(t, hat, hpred).forEach((s) => s.blocks.slice(1).forEach((b) => eachBlock(b, (x) => { if (x.op === op && (!pred || pred(x))) ok = true; })));
    return ok;
  }
  /* ¿hay un bloque «op» dentro de un bloque en C («cop») de un programa con ese sombrero? */
  function inC(t, hat, cop, op, pred) {
    let ok = false;
    hats(t, hat).forEach((s) => s.blocks.slice(1).forEach((b) => eachBlock(b, (c) => {
      if (c.op === cop) { (c.sub || []).concat(c.sub2 || []).forEach((y) => eachBlock(y, (x) => { if (x.op === op && (!pred || pred(x))) ok = true; })); }
    })));
    return ok;
  }
  const num = (v) => parseFloat(String(v).replace(',', '.'));
  const varNames = () => (PQ.S.project.vars || []).map((v) => v.name);
  const anyVarAtLeast = (n) => (PQ.S.project.vars || []).some((v) => num(v.value) >= n);

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
      id: 'anima-canario', title: '¡Anima al canario!', stars: 1, bg: 'playa', sprite: 'canario',
      desc: 'Cambia de disfraz una y otra vez para que bata las alas.',
      steps: [
        { say: 'Vamos a hacer que el canario vuele. Arrastra «al hacer clic en la bandera».', hl: 'event_whenflagclicked', ok: () => flagScripts().length > 0 },
        { say: 'Engancha el bloque naranja «repetir 10 veces».', hl: 'control_repeat', cat: 'control', ok: () => has('control_repeat') },
        { say: 'Dentro del bucle pon «siguiente disfraz». ¡Así bate las alas!', hl: 'looks_nextcostume', cat: 'looks', ok: () => inRepeat('looks_nextcostume') },
        { say: 'Añade también «esperar 1 segundos» dentro del bucle, para que no vaya demasiado rápido. Pon 0.2.', hl: 'control_wait', cat: 'control', ok: () => inRepeat('control_wait') },
        { say: 'Pulsa la bandera verde para ver volar al canario.', ok: (st) => ran(st) }
      ],
      end: '¡Fantástico! Así se hacen las animaciones: cambiar de disfraz muchas veces. Añade «mover 5 pasos» dentro del bucle y volará.'
    },

    /* ======================= NIVEL 1 (más) ======================= */
    {
      id: 'suena-y-baila', title: 'Suena y baila', stars: 1, bg: 'playa', sprite: 'canario',
      desc: 'Pon un sonido y haz bailar al canario con un bucle.',
      steps: [
        { say: 'Vamos a hacer una fiesta. Arrastra «al hacer clic en la bandera».', hl: 'event_whenflagclicked', ok: () => hats(spr(), 'flag').length > 0 },
        { say: 'Los bloques rosas son los sonidos. Arrastra «iniciar sonido Pop» y engánchalo debajo.', hl: 'sound_play', cat: 'sound', ok: () => inHat(spr(), 'flag', 'sound_play') || inHat(spr(), 'flag', 'sound_playuntildone') },
        { say: 'Ahora el bucle naranja «repetir 10 veces». Engánchalo debajo del sonido.', hl: 'control_repeat', cat: 'control', ok: () => inHat(spr(), 'flag', 'control_repeat') },
        { say: 'Dentro del bucle pon «girar ↺ 15 grados». Para bailar, escribe 30.', hl: 'motion_turnleft', cat: 'motion', ok: () => inC(spr(), 'flag', 'control_repeat', 'motion_turnleft') },
        { say: 'Añade también «siguiente disfraz» dentro del bucle, para que bata las alas mientras gira.', hl: 'looks_nextcostume', cat: 'looks', ok: () => inC(spr(), 'flag', 'control_repeat', 'looks_nextcostume') },
        { say: '¡Pulsa la bandera verde y a bailar!', ok: (st) => ran(st) }
      ],
      end: '¡Qué fiesta! Has juntado sonido, bucle, giro y disfraz. Prueba otro sonido: toca la palabra Pop del bloque.'
    },
    {
      id: 'toca-y-salta', title: 'Toca y salta', stars: 1, bg: 'playa', sprite: 'canario',
      desc: 'Haz que el canario salte cada vez que lo tocas.',
      steps: [
        { say: 'Esta vez no usaremos la bandera. Busca «al hacer clic en este objeto» y arrástralo a la zona blanca.', hl: 'event_whenthisspriteclicked', cat: 'events', ok: () => hats(spr(), 'click').length > 0 },
        { say: 'Para saltar, engancha «cambiar y por 10». Toca el 10 y escribe 40.', hl: 'motion_changeyby', cat: 'motion', ok: () => inHat(spr(), 'click', 'motion_changeyby', (b) => num(b.f.DY) >= 20) },
        { say: 'Engancha «esperar 1 segundos» y escribe 0.3, para que se quede un momento arriba.', hl: 'control_wait', cat: 'control', ok: () => inHat(spr(), 'click', 'control_wait') },
        { say: 'Para bajar, otro «cambiar y por», pero escribe -40 (con el signo menos).', hl: 'motion_changeyby', cat: 'motion', ok: () => inHat(spr(), 'click', 'motion_changeyby', (b) => num(b.f.DY) <= -20) },
        { say: '¡Toca al canario en el escenario y míralo saltar!', ok: (st) => acted(st) }
      ],
      end: '¡Salta! Los bloques amarillos de eventos deciden cuándo empieza tu programa: con la bandera o al tocar. Prueba el salto más alto.'
    },
    {
      id: 'dos-amigos', title: 'Dos amigos', stars: 1, bg: 'playa', sprite: 'tortuga',
      desc: 'Añade otro personaje y haz que cada uno diga algo.',
      steps: [
        { say: 'Un proyecto puede tener muchos personajes. Toca el botón «＋» de los personajes y elige a un amigo.', ui: '#btnAddSprite', ok: () => PQ.S.project.sprites.length >= 2 },
        { say: 'Tu amigo ya está elegido. Arrastra «al hacer clic en la bandera» para él.', hl: 'event_whenflagclicked', cat: 'events', ok: () => PQ.S.project.sprites.slice(1).some((t) => hats(t, 'flag').length > 0) },
        { say: 'Engancha «decir ¡Hola! durante 2 segundos». Puedes cambiar lo que dice.', hl: 'looks_sayforsecs', cat: 'looks', ok: () => PQ.S.project.sprites.slice(1).some((t) => inHat(t, 'flag', 'looks_sayforsecs')) },
        { say: 'Ahora vamos con el canario. Tócalo en la lista de personajes, abajo a la derecha.', ui: '#spritelist .stile', ok: () => PQ.S.target === spr(0) },
        { say: 'Al canario también: «al hacer clic en la bandera» y «decir ¡Hola! durante 2 segundos».', hl: 'looks_sayforsecs', cat: 'looks', ok: () => inHat(spr(0), 'flag', 'looks_sayforsecs') },
        { say: '¡Pulsa la bandera verde! Cada personaje tiene sus propios bloques.', ok: (st) => ran(st) }
      ],
      end: '¡Ya tienes dos personajes! Cada uno hace lo que le programas. Cambia los textos para que charlen.'
    },

    /* ======================= NIVEL 2 ======================= */
    {
      id: 'muevelo-tu', title: '¡Muévelo tú!', stars: 2, bg: 'playa', sprite: 'canario',
      desc: 'Mueve al canario con las flechas del teclado o de la pantalla.',
      steps: [
        { say: 'Vamos a manejar al canario. Arrastra «al presionar espacio» y toca la palabra «espacio» para elegir «flecha →».', hl: 'event_whenkeypressed', cat: 'events', ok: () => hats(spr(), 'key', (h) => h.f.KEY_OPTION === 'right arrow').length > 0 },
        { say: 'Engancha «cambiar x por 10» debajo. Así se mueve a la derecha.', hl: 'motion_changexby', cat: 'motion', ok: () => inHat(spr(), 'key', 'motion_changexby', (b) => num(b.f.DX) > 0, (h) => h.f.KEY_OPTION === 'right arrow') },
        { say: 'Otro bloque «al presionar» y elige «flecha ←».', hl: 'event_whenkeypressed', cat: 'events', ok: () => hats(spr(), 'key', (h) => h.f.KEY_OPTION === 'left arrow').length > 0 },
        { say: 'Debajo, «cambiar x por» con un número negativo: escribe -10.', hl: 'motion_changexby', cat: 'motion', ok: () => inHat(spr(), 'key', 'motion_changexby', (b) => num(b.f.DX) < 0, (h) => h.f.KEY_OPTION === 'left arrow') },
        { say: '¡A jugar! Pulsa las flechas del teclado o los botones con flechas que han salido en pantalla.', ok: (st) => acted(st) }
      ],
      end: '¡Ya lo manejas tú! Los programas pueden esperar a que pulses una tecla. Prueba con «cambiar y por» para ir arriba y abajo.'
    },
    {
      id: 'rebota', title: 'Rebota sin parar', stars: 2, level: 2, bg: 'mar', sprite: 'pez',
      desc: 'Usa «por siempre» para que el personaje no pare de moverse.',
      steps: [
        { say: 'Vamos a repetir para siempre. Empieza con «al hacer clic en la bandera».', hl: 'event_whenflagclicked', ok: () => hats(spr(), 'flag').length > 0 },
        { say: '«Por siempre» es un bucle que no termina. Engánchalo debajo.', hl: 'control_forever', cat: 'control', ok: () => inHat(spr(), 'flag', 'control_forever') },
        { say: 'Dentro de «por siempre» mete «mover 10 pasos». Prueba con 5.', hl: 'motion_movesteps', cat: 'motion', ok: () => inC(spr(), 'flag', 'control_forever', 'motion_movesteps') },
        { say: 'Para que no se escape, mete también «rebotar si está en el borde».', hl: 'motion_ifonedgebounce', cat: 'motion', ok: () => inC(spr(), 'flag', 'control_forever', 'motion_ifonedgebounce') },
        { say: 'Añade «siguiente disfraz» dentro del bucle y se moverá como si nadara.', hl: 'looks_nextcostume', cat: 'looks', ok: () => inC(spr(), 'flag', 'control_forever', 'looks_nextcostume') },
        { say: 'Pulsa la bandera verde. Para pararlo, usa el botón rojo de arriba.', ok: (st) => ran(st) }
      ],
      end: '¡Rebota! «Por siempre» no se acaba solo: hay que parar con el botón rojo. Cambia los pasos para ir más rápido o más despacio.',
      setup: (p) => { p.stage.costumes.length = 0; p.stage.costumes.push(PQ.makeBackdrop('mar')); p.sprites.length = 0; const s = PQ.makeSprite('pez', p); s.x = -80; s.y = 0; PQ.addDefaultSound(s); p.sprites.push(s); }
    },
    {
      id: 'mensajes', title: 'Un mensaje entre amigos', stars: 2, bg: 'playa', sprite: 'tortuga',
      desc: 'Un personaje avisa y el otro responde con mensajes.',
      steps: [
        { say: 'Aquí hay un canario y una tortuga. El canario va a avisar a la tortuga. Empieza con «al hacer clic en la bandera».', hl: 'event_whenflagclicked', ok: () => hats(spr(0), 'flag').length > 0 },
        { say: 'Engancha «decir ¡Hola! durante 2 segundos».', hl: 'looks_sayforsecs', cat: 'looks', ok: () => inHat(spr(0), 'flag', 'looks_sayforsecs') },
        { say: 'Ahora el bloque amarillo «enviar mensaje1». Es como un aviso para los demás.', hl: 'event_broadcast', cat: 'events', ok: () => inHat(spr(0), 'flag', 'event_broadcast') },
        { say: 'Toca la tortuga en la lista de personajes para programarla.', ui: '#spritelist .stile:nth-child(2)', ok: () => PQ.S.target === spr(1) },
        { say: 'Arrastra «al recibir mensaje1». La tortuga hará algo cuando llegue el aviso.', hl: 'event_whenbroadcastreceived', cat: 'events', ok: () => hats(spr(1), 'recv').length > 0 },
        { say: 'Engancha «decir ¡Hola! durante 2 segundos» y escribe ¡Hola, canario!', hl: 'looks_sayforsecs', cat: 'looks', ok: () => inHat(spr(1), 'recv', 'looks_sayforsecs') },
        { say: '¡Pulsa la bandera verde! Primero habla el canario y después responde la tortuga.', ok: (st) => ran(st) }
      ],
      end: '¡Se han hablado! Los mensajes sirven para que los personajes se coordinen. En Scratch se llaman igual.',
      setup: (p) => { const s = PQ.makeSprite('tortuga', p); s.x = 90; s.y = -50; PQ.addDefaultSound(s); p.sprites.push(s); }
    },

    /* ======================= NIVEL 3 ======================= */
    {
      id: 'variables', title: 'Cuenta puntos', stars: 3, bg: 'playa', sprite: 'canario', level: 2,
      desc: 'Crea una variable y suma un punto cada vez que tocas al canario.',
      steps: [
        { say: 'Una variable es una cajita con un número. Ve al grupo naranja «Variables» y pulsa «Crear variable». Llámala puntos.', cat: 'data', ui: '.mkvar', ok: () => varNames().length > 0 },
        { say: 'Para empezar de cero: «al hacer clic en la bandera».', hl: 'event_whenflagclicked', cat: 'events', ok: () => hats(spr(), 'flag').length > 0 },
        { say: 'Engancha «dar a puntos el valor 0». Así siempre empiezas con 0 puntos.', hl: 'data_setvariableto', cat: 'data', ok: () => inHat(spr(), 'flag', 'data_setvariableto') },
        { say: 'Ahora, «al hacer clic en este objeto».', hl: 'event_whenthisspriteclicked', cat: 'events', ok: () => hats(spr(), 'click').length > 0 },
        { say: 'Engancha «sumar a puntos el valor 1». Cada toque suma uno.', hl: 'data_changevariableby', cat: 'data', ok: () => inHat(spr(), 'click', 'data_changevariableby') },
        { say: 'Pulsa la bandera y toca al canario varias veces. ¡Mira cómo sube el marcador!', ok: () => anyVarAtLeast(2) }
      ],
      end: '¡Ya sabes usar variables! Guardan números que cambian, como los puntos de un juego. Pruébalo con «sumar 5».'
    },
    {
      id: 'decide-con-si', title: 'Decide con «si»', stars: 3, bg: 'playa', sprite: 'canario', level: 2,
      desc: 'Haz que el canario decida qué hacer según lo que ocurre.',
      steps: [
        { say: 'Vamos a hacer un programa que decide. Empieza con «al hacer clic en la bandera».', hl: 'event_whenflagclicked', cat: 'events', ok: () => hats(spr(), 'flag').length > 0 },
        { say: 'Engancha el bucle «por siempre».', hl: 'control_forever', cat: 'control', ok: () => inHat(spr(), 'flag', 'control_forever') },
        { say: 'Dentro, «mover 10 pasos». Escribe 3 para que vaya despacio.', hl: 'motion_movesteps', cat: 'motion', ok: () => inC(spr(), 'flag', 'control_forever', 'motion_movesteps') },
        { say: 'Y también «rebotar si está en el borde», dentro del bucle.', hl: 'motion_ifonedgebounce', cat: 'motion', ok: () => inC(spr(), 'flag', 'control_forever', 'motion_ifonedgebounce') },
        { say: 'Ahora lo importante: «si … entonces». Va dentro de «por siempre», debajo de los otros.', hl: 'control_if', cat: 'control', ok: () => inC(spr(), 'flag', 'control_forever', 'control_if') },
        { say: 'En el hueco del «si» encaja la pregunta azul «¿tocando puntero del ratón?».', hl: 'sensing_touchingobject', cat: 'sensing', ok: () => inC(spr(), 'flag', 'control_forever', 'control_if', (b) => b.cond && b.cond.op === 'sensing_touchingobject') },
        { say: 'Dentro del «si» pon «decir ¡Hola! durante 2 segundos» y escribe ¡Me tocas!', hl: 'looks_sayforsecs', cat: 'looks', ok: () => inC(spr(), 'flag', 'control_if', 'looks_sayforsecs') },
        { say: 'Pulsa la bandera. Pasa el puntero (o el dedo) por encima del canario y verás qué hace.', ok: (st) => ran(st) }
      ],
      end: '¡Ya sabes decidir! «Si» solo hace algo cuando se cumple la pregunta. Es la base de los juegos.'
    },
    {
      id: 'atrapa', title: 'Atrapa al canario', stars: 3, bg: 'playa', sprite: 'canario', level: 2,
      desc: 'Un mini juego: toca al canario, suma puntos y salta a otro sitio al azar.',
      steps: [
        { say: 'Vamos a hacer un juego. Crea una variable llamada puntos: en el grupo naranja «Variables» pulsa «Crear variable».', cat: 'data', ui: '.mkvar', ok: () => varNames().length > 0 },
        { say: '«Al hacer clic en la bandera» y debajo «dar a puntos el valor 0».', hl: 'data_setvariableto', cat: 'data', ok: () => inHat(spr(), 'flag', 'data_setvariableto') },
        { say: 'Ahora «al hacer clic en este objeto». Aquí va lo que ocurre al atrapar al canario.', hl: 'event_whenthisspriteclicked', cat: 'events', ok: () => hats(spr(), 'click').length > 0 },
        { say: 'Engancha «sumar a puntos el valor 1».', hl: 'data_changevariableby', cat: 'data', ok: () => inHat(spr(), 'click', 'data_changevariableby') },
        { say: 'Engancha «ir a x: 0 y: 0». Hará que el canario se mueva.', hl: 'motion_gotoxy', cat: 'motion', ok: () => inHat(spr(), 'click', 'motion_gotoxy') },
        { say: 'Arrastra el reportero verde «al azar entre 1 y 10» y suéltalo encima del número de x.', hl: 'operator_random', cat: 'operators', ok: () => inHat(spr(), 'click', 'motion_gotoxy', (b) => b.in && b.in.X && b.in.X.op === 'operator_random') },
        { say: 'Cambia el 1 por -150 y el 10 por 150. Así salta a cualquier lugar.', ok: () => inHat(spr(), 'click', 'operator_random', (b) => num(b.f.FROM) <= -100 && num(b.f.TO) >= 100) },
        { say: '¡A jugar! Pulsa la bandera y atrapa al canario tres veces.', ok: () => anyVarAtLeast(3) }
      ],
      end: '¡Has hecho un juego! Usaste variables, eventos, movimiento y azar. Dile a un amigo que lo pruebe y añade un sonido.'
    }

  ];
  PQ.TUT = { list: LIST.slice().sort((a, b) => a.stars - b.stars).map((t) => ({ id: t.id, title: t.title, desc: t.desc, stars: t.stars, bg: t.bg, sprite: t.sprite })) };

  /* ---------- motor del tutorial ---------- */
  let cur = null; // {t, i, flag0}
  function render() {
    const box = $('#guide');
    document.querySelectorAll('.pulse-ui').forEach((e) => e.classList.remove('pulse-ui'));
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
      btn('Más cuentos y retos', 'pri', () => { PQ.Tut.stop(); PQ.openStories('cuento'); });
      btn('Seguir jugando', '', () => PQ.Tut.stop());
    } else {
      btn('Salir', '', () => PQ.Tut.stop());
    }
    PQ.say(text);
    if (!done) {
      const s = t.steps[cur.i];
      if (s.cat) { const c = document.querySelector('#cats .cat[data-cat="' + s.cat + '"]'); if (c) c.click(); }
      PQ.ed.highlight(s.hl || null);
      if (s.ui) document.querySelectorAll(s.ui).forEach((e) => e.classList.add('pulse-ui'));
    } else PQ.ed.highlight(null);
  }
  PQ.Tut = {
    active: () => !!cur,
    rerender: () => render(),
    currentStep: () => (cur && cur.i < cur.t.steps.length ? { text: cur.t.steps[cur.i].say, hl: cur.t.steps[cur.i].hl } : null),
    start(id) {
      const t = LIST.find((x) => x.id === id); if (!t) return;
      const proj = PQ.defaultProject(); if (t.setup) t.setup(proj);
      PQ.loadProject(proj, { noAuto: true });
      if (t.level && PQ.setLevel) PQ.setLevel(t.level);
      PQ.app.showTab('code');
      cur = { t, i: 0, flag0: PQ.RT.flagCount, run0: PQ.RT.runCount };
      PQ.S.project.title = t.title; $('#title').value = t.title;
      render();
    },
    stop(silent) {
      if (!cur) return;
      cur = null; if (!silent || true) render();
      try { if (PQ.stopVoice) PQ.stopVoice(); else if (g.speechSynthesis) g.speechSynthesis.cancel(); } catch (e) { /* nada */ }
      if (PQ.Help) { PQ.Help.isOpen() && PQ.Help.close(); }
    },
    check() {
      if (!cur || cur.i >= cur.t.steps.length) return;
      let adv = false;
      while (cur.i < cur.t.steps.length && cur.t.steps[cur.i].ok(cur)) {
        cur.i++; adv = true; cur.flag0 = PQ.RT.flagCount; cur.run0 = PQ.RT.runCount;
      }
      if (adv) {
        render();
        if (cur.i >= cur.t.steps.length) PQ.ui.celebrate();
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
  setInterval(() => { if (cur) PQ.Tut.check(); }, 700);
});
