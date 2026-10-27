/* PequeBloques — diseñado por David OZC
 * examples.js: cuentos interactivos y retos ya preparados
 */
(function (g) {
  'use strict';
  const PQ = g.PQ;

  /* ---------- pequeño lenguaje para escribir programas ---------- */
  const mk = (op, f, sub, sub2) => {
    const b = PQ.mkBlock(op, f || null, null);
    if (sub) b.sub = sub;
    if (sub2) b.sub2 = sub2;
    return b;
  };
  /* bloque cuyos argumentos pueden ser valores o reporteros encajados */
  const R = (op, args) => {
    const b = mk(op);
    Object.keys(args).forEach((k) => {
      const a = args[k];
      if (a && typeof a === 'object' && a.op) { b.in = b.in || {}; b.in[k] = a; } else b.f[k] = a;
    });
    return b;
  };
  const D = {
    flag: () => mk('event_whenflagclicked'),
    key: (k) => mk('event_whenkeypressed', { KEY_OPTION: k }),
    click: () => mk('event_whenthisspriteclicked'),
    recv: (m) => mk('event_whenbroadcastreceived', { BROADCAST_OPTION: m }),
    send: (m) => mk('event_broadcast', { BROADCAST_INPUT: m }),
    move: (n) => mk('motion_movesteps', { STEPS: n }),
    right: (n) => mk('motion_turnright', { DEGREES: n }),
    left: (n) => mk('motion_turnleft', { DEGREES: n }),
    xy: (x, y) => mk('motion_gotoxy', { X: x, Y: y }),
    dx: (n) => mk('motion_changexby', { DX: n }),
    dy: (n) => mk('motion_changeyby', { DY: n }),
    dir: (n) => mk('motion_pointindirection', { DIRECTION: n }),
    sayFor: (t, s) => mk('looks_sayforsecs', { MESSAGE: t, SECS: s }),
    say: (t) => mk('looks_say', { MESSAGE: t }),
    costume: (n) => mk('looks_switchcostumeto', { COSTUME: n }),
    next: () => mk('looks_nextcostume'),
    backdrop: (n) => { const b = PQ.BACKDROP_LIB.find((x) => x.id === n); return mk('looks_switchbackdropto', { BACKDROP: b ? b.name : n }); },
    grow: (n) => mk('looks_changesizeby', { CHANGE: n }),
    size: (n) => mk('looks_setsizeto', { SIZE: n }),
    show: () => mk('looks_show'),
    hide: () => mk('looks_hide'),
    sound: (n) => mk('sound_play', { SOUND_MENU: n }),
    soundWait: (n) => mk('sound_playuntildone', { SOUND_MENU: n }),
    wait: (n) => mk('control_wait', { DURATION: n }),
    rep: (n, sub) => mk('control_repeat', { TIMES: n }, sub),
    forever: (sub) => mk('control_forever', null, sub),
    voice: (v) => mk('text2speech_setVoice', { VOICE: v }),
    speak: (t) => mk('text2speech_speakAndWait', { WORDS: t }),
    /* hablar: el bocadillo aparece solo mientras suena la voz */
    talk: (t) => [mk('text2speech_speakAndWait', { WORDS: t })],
    /* movimiento y datos */
    glide: (s, x, y) => R('motion_glidesecstoxy', { SECS: s, X: x, Y: y }),
    goto: (x, y) => R('motion_gotoxy', { X: x, Y: y }),
    setv: (n, val) => R('data_setvariableto', { VARIABLE: n, VALUE: val }),
    chv: (n, val) => R('data_changevariableby', { VARIABLE: n, VALUE: val }),
    showv: (n) => mk('data_showvariable', { VARIABLE: n }),
    hidev: (n) => mk('data_hidevariable', { VARIABLE: n }),
    stopAll: () => mk('control_stop', { STOP_OPTION: 'all' }),
    /* condiciones y reporteros */
    iff: (c, sub) => { const b = mk('control_if', null, sub); b.cond = c; return b; },
    ifelse: (c, sub, sub2) => { const b = mk('control_if_else', null, sub, sub2); b.cond = c; return b; },
    waitUntil: (c) => { const b = mk('control_wait_until'); b.cond = c; return b; },
    v: (n) => mk('data_variable', { VARIABLE: n }),
    eq: (a, b) => R('operator_equals', { OPERAND1: a, OPERAND2: b }),
    gt: (a, b) => R('operator_gt', { OPERAND1: a, OPERAND2: b }),
    lt: (a, b) => R('operator_lt', { OPERAND1: a, OPERAND2: b }),
    and: (a, b) => { const x = mk('operator_and'); x.in = { OPERAND1: a, OPERAND2: b }; return x; },
    rnd: (a, b) => R('operator_random', { FROM: a, TO: b }),
    minus: (a, b) => R('operator_subtract', { NUM1: a, NUM2: b }),
    times: (a, b) => R('operator_multiply', { NUM1: a, NUM2: b }),
    join: (a, b) => R('operator_join', { STRING1: a, STRING2: b }),
    xpos: () => mk('motion_xposition'),
    keyp: (k) => mk('sensing_keypressed', { KEY_OPTION: k }),
    /* movimiento continuo mientras se mantiene la tecla (también con el mando en pantalla) */
    walk: (speed, gate) => {
      const one = (k, dx, dy) => { const m = S.iff(gate ? S.and(gate(), S.keyp(k)) : S.keyp(k), [dx ? S.dx(dx) : S.dy(dy)]); return m; };
      return [one('left arrow', -speed, 0), one('right arrow', speed, 0), one('up arrow', 0, speed), one('down arrow', 0, -speed)];
    },
    touch: (n) => mk('sensing_touchingobject', { TOUCHINGOBJECTMENU: n })
  };
  const script = (x, y, blocks) => ({ x, y, blocks });

  /* sprites: [{id, x, y, size, dir, hidden, sounds, scripts: []}] — backdrops: ['playa', ...] */
  function make(o) {
    const p = PQ.newProject();
    (o.backdrops || ['blanco']).forEach((b) => p.stage.costumes.push(PQ.makeBackdrop(b)));
    p.messages = o.messages && o.messages.length ? o.messages.slice() : ['mensaje1'];
    p.vars = (o.vars || []).map((v) => ({ name: v[0], value: v[1], show: !!v[2] }));
    (o.sprites || []).forEach((d) => {
      const t = PQ.makeSprite(d.id, p);
      if (d.name) t.name = d.name;
      t.x = d.x || 0; t.y = d.y || 0;
      if (d.size) t.size = d.size;
      if (d.dir !== undefined) t.direction = d.dir;
      if (d.hidden) t.visible = false;
      (d.sounds || ['Pop']).forEach((s) => t.sounds.push(PQ.makeSound(s)));
      t.scripts = (d.scripts || []).map((s) => ({ x: 0, y: 0, blocks: s }));
      PQ.layoutScripts(t.scripts);
      p.sprites.push(t);
    });
    p.stage.scripts = (o.stage || []).map((s) => ({ x: 0, y: 0, blocks: s }));
    PQ.layoutScripts(p.stage.scripts);
    return p;
  }

  const F = D.flag, S = D;

  PQ.EX = [
    /* 1 */
    {
      id: 'canario-viajero', title: 'El canario viajero', kind: 'cuento', stars: 1, bg: 'playa', sprite: 'canario',
      desc: 'Un canario vuela de la playa al Teide. ¡Cuéntalo con tus palabras!',
      challenge: 'Pulsa la bandera verde. Después cambia lo que dice el canario y haz que vuele más lejos.',
      openSprite: 'Canario',
      build() {
        return make({
          backdrops: ['playa', 'teide'], messages: ['teide'],
          sprites: [{
            id: 'canario', x: -170, y: -50, sounds: ['Pop', 'Ta-chán'],
            scripts: [
              [F(), S.backdrop('playa'), S.xy(-170, -50), S.sayFor('¡Hola! Soy un canario.', 2),
                S.sayFor('Hoy voy a volar hasta el Teide.', 2),
                S.rep(10, [S.move(10), S.next(), S.wait(0.1)]), S.send('teide')],
              [S.recv('teide'), S.backdrop('teide'), S.xy(-150, -60), S.sound('Ta-chán'),
                S.rep(8, [S.move(15), S.next(), S.wait(0.1)]), S.sayFor('¡Qué bonito se ve desde aquí!', 3)]
            ]
          }]
        });
      }
    },
    /* 2 */
    {
      id: 'lagarto-goloso', title: 'El lagarto goloso', kind: 'cuento', stars: 1, bg: 'campo', sprite: 'lagarto',
      desc: 'El lagarto tiene hambre y quiere un plátano. ¿Lo alcanzará?',
      challenge: 'Toca el plátano con el dedo o el ratón. Haz que el lagarto diga algo distinto cuando se lo coma.',
      openSprite: 'Lagarto',
      build() {
        return make({
          backdrops: ['campo'], messages: ['comer'],
          sprites: [
            {
              id: 'lagarto', x: -160, y: -70, scripts: [
                [F(), S.show(), S.xy(-160, -70), S.say('¡Tengo mucha hambre!'), S.wait(2),
                  S.say('Voy a por ese plátano…'), S.rep(12, [S.move(10), S.next(), S.wait(0.15)]), S.say('')],
                [S.recv('comer'), S.sound('Pop'), S.sayFor('¡Ñam, ñam! ¡Qué rico!', 3)]
              ]
            },
            {
              id: 'platano', x: 70, y: -60, scripts: [
                [F(), S.show(), S.xy(70, -60)],
                [S.click(), S.send('comer'), S.hide()]
              ]
            }
          ]
        });
      }
    },
    /* 3 */
    {
      id: 'aventura-mar', title: 'Aventura en el mar', kind: 'cuento', stars: 2, bg: 'mar', sprite: 'pez',
      desc: 'Un pez nada entre las olas y se encuentra con una ballena amiga.',
      challenge: 'Haz que el pez nade más rápido. Añade al cangrejo un diálogo y un sonido.',
      openSprite: 'Pez',
      build() {
        return make({
          backdrops: ['mar'], messages: ['saluda'],
          sprites: [
            {
              id: 'pez', x: -180, y: 20, scripts: [
                [F(), S.xy(-180, 20), S.say('¡Qué bien se está en el mar!'), S.wait(2), S.say(''),
                  S.rep(20, [S.move(5), S.next(), S.wait(0.1)]), S.send('saluda'), S.sayFor('¡Hola, ballena!', 2)]
              ]
            },
            {
              id: 'ballena', x: 100, y: -20, size: 120, sounds: ['Pop', 'Chapuzón'], scripts: [
                [F(), S.xy(100, -20)],
                [S.recv('saluda'), S.sound('Chapuzón'), S.next(), S.sayFor('¡Hola, pececito! ¿Quieres jugar?', 3), S.next()]
              ]
            },
            {
              id: 'cangrejo', x: -60, y: -130, scripts: [
                [F(), S.xy(-60, -130), S.rep(6, [S.dx(10), S.next(), S.wait(0.2)]), S.rep(6, [S.dx(-10), S.next(), S.wait(0.2)])]
              ]
            }
          ]
        });
      }
    },
    /* 4 */
    {
      id: 'cuenta-atras', title: 'Cuenta atrás y despegue', kind: 'reto', stars: 1, bg: 'espacio', sprite: 'cohete',
      desc: '3, 2, 1… ¡despegue! Un cohete listo para viajar a las estrellas.',
      challenge: 'Cambia la cuenta atrás para que empiece en 5. ¿Puedes hacer que el cohete se haga más pequeño al subir?',
      openSprite: 'Cohete',
      build() {
        return make({
          backdrops: ['espacio'],
          sprites: [{
            id: 'cohete', x: 0, y: -120, dir: 90, sounds: ['Pop', 'Bocina'], scripts: [
              [F(), S.xy(0, -120), S.sayFor('3', 1), S.sayFor('2', 1), S.sayFor('1', 1), S.sayFor('¡Despegue!', 1),
                S.sound('Bocina'), S.next(), S.rep(24, [S.dy(10), S.wait(0.05)]), S.hide()],
              [S.click(), S.show(), S.xy(0, -120), S.costume('Cohete 1')]
            ]
          }]
        });
      }
    },
    /* 5 */
    {
      id: 'lucia-yeray', title: 'Lucía y Yeray hablan', kind: 'cuento', stars: 2, bg: 'pueblo', sprite: 'lucia',
      desc: 'Dos amigos conversan. Cada uno espera su turno con mensajes.',
      challenge: 'Inventa una conversación nueva. Añade un tercer turno para que Lucía se despida.',
      openSprite: 'Lucía',
      build() {
        return make({
          backdrops: ['pueblo'], messages: ['turno-yeray', 'turno-lucia'],
          sprites: [
            {
              id: 'lucia', x: -110, y: -50, scripts: [
                [F(), S.sayFor('¡Hola, Yeray! ¿Vienes a la fiesta?', 3), S.send('turno-yeray')],
                [S.recv('turno-lucia'), S.sayFor('¡Genial! Nos vemos allí.', 3)]
              ]
            },
            {
              id: 'yeray', x: 110, y: -50, dir: 90, scripts: [
                [S.recv('turno-yeray'), S.sayFor('¡Claro que sí! Llevo la música.', 3), S.send('turno-lucia')]
              ]
            }
          ]
        });
      }
    },
    /* 6 */
    {
      id: 'baile-robot', title: 'El baile del robot', kind: 'reto', stars: 2, bg: 'noche', sprite: 'robot',
      desc: 'Un robot baila con giros y cambios de disfraz. ¡Invéntate tu coreografía!',
      challenge: 'Pulsa la bandera o la tecla espacio. Crea un baile nuevo con tus propios pasos.',
      openSprite: 'Robot',
      build() {
        return make({
          backdrops: ['noche'],
          sprites: [{
            id: 'robot', x: 0, y: -20, sounds: ['Pop', 'Tambor'], scripts: [
              [F(), S.rep(4, [S.right(90), S.next(), S.wait(0.3)]), S.dir(90)],
              [S.key('space'), S.sound('Tambor'), S.rep(3, [S.dx(20), S.grow(5), S.wait(0.15)]),
                S.rep(3, [S.dx(-20), S.grow(-5), S.wait(0.15)])]
            ]
          }]
        });
      }
    },
    /* 7 */
    {
      id: 'guagua-isla', title: 'La guagua por la isla', kind: 'reto', stars: 2, bg: 'pueblo', sprite: 'guagua',
      desc: 'Conduce la guagua con las flechas del teclado. ¡Pita con la barra espaciadora!',
      challenge: 'Añade las teclas para ir hacia arriba y hacia abajo. ¿Y si cambias el fondo al llegar al borde?',
      openSprite: 'Guagua',
      build() {
        return make({
          backdrops: ['pueblo'],
          sprites: [{
            id: 'guagua', x: -150, y: -70, sounds: ['Bocina'], scripts: [
              [F(), S.xy(-150, -70), S.dir(90)],
              [S.key('right arrow'), S.dx(15)],
              [S.key('left arrow'), S.dx(-15)],
              [S.key('space'), S.sound('Bocina'), S.sayFor('¡Piiiii!', 1)]
            ]
          }]
        });
      }
    },
    /* 8 */
    {
      id: 'arregla-cuento', title: '¡Arregla el cuento!', kind: 'reto', stars: 3, bg: 'campo', sprite: 'perro',
      desc: 'Hay errores escondidos en este cuento. Encuéntralos y arréglalos.',
      challenge: 'El perro quiere ir hacia la estrella (a la derecha) pero algo falla. Mira los bloques: ¿qué número está mal? ¿Y por qué habla tan deprisa?',
      openSprite: 'Perro',
      build() {
        return make({
          backdrops: ['campo'], messages: ['llegado'],
          sprites: [
            {
              id: 'perro', x: -100, y: -60, scripts: [
                [F(), S.xy(-100, -60), S.sayFor('¡Veo una estrella! ¡Voy!', 0.3),
                  S.rep(10, [S.move(-10), S.next(), S.wait(0.2)]), S.send('llegado')],
                [S.recv('llegado'), S.sayFor('¡Guau, guau! ¡Lo encontré!', 3)]
              ]
            },
            {
              id: 'estrella', x: 90, y: -60, scripts: [
                [F(), S.xy(90, -60)]
              ]
            }
          ]
        });
      }
    },

    /* ---------- cuentos con voces ---------- */
    {
      id: 'carrera', title: 'La carrera del campo', kind: 'cuento', voices: true, stars: 1, bg: 'campo', sprite: 'tortuga',
      desc: 'El lagarto presumido y la tortuga tranquila hablan con voces distintas. ¡Escúchalos!',
      challenge: 'Pulsa la bandera y escucha el cuento. Después toca a cada personaje para oírlo otra vez. ¿Puedes cambiar la voz de la tortuga en el bloque «usar voz»?',
      openSprite: 'Tortuga',
      build() {
        const L = S.talk;
        return make({
          backdrops: ['campo'], messages: ['lagarto', 'tortuga', 'carrera', 'fin'],
          sprites: [
            {
              id: 'lucia', name: 'Lucía', x: -185, y: 30, size: 75, scripts: [
                [F(), S.voice('KITTEN'), S.xy(-185, 30)].concat(L('Hoy hay una carrera en el campo.'), [S.send('lagarto')]),
                [S.recv('fin'), S.voice('KITTEN')].concat(L('Y así terminó la carrera. ¡Qué divertido!')),
                [S.click(), S.voice('KITTEN')].concat(L('Hoy hay una carrera en el campo.'))
              ]
            },
            {
              id: 'lagarto', x: -130, y: -55, size: 85, scripts: [
                [F(), S.xy(-130, -55), S.voice('SQUEAK')],
                [S.recv('lagarto'), S.voice('SQUEAK')].concat(L('¡Yo soy el más rápido de toda la isla!'), [S.send('tortuga')]),
                [S.recv('carrera'), S.rep(12, [S.dx(18), S.next(), S.wait(0.1)]), S.voice('SQUEAK')].concat(L('¡He ganado! ¡He ganado!')),
                [S.click(), S.voice('SQUEAK')].concat(L('¡Yo soy el más rápido de toda la isla!'))
              ]
            },
            {
              id: 'tortuga', x: -130, y: -125, size: 85, scripts: [
                [F(), S.xy(-130, -125), S.voice('GIANT')],
                [S.recv('tortuga'), S.voice('GIANT')].concat(L('Despacito y con buena letra. Vamos a correr.'), [S.send('carrera')]),
                [S.recv('carrera'), S.rep(12, [S.dx(5), S.next(), S.wait(0.3)]), S.voice('GIANT')].concat(L('Yo llegaré… un poquito más tarde.'), [S.send('fin')]),
                [S.click(), S.voice('GIANT')].concat(L('Despacito y con buena letra.'))
              ]
            }
          ]
        });
      }
    },
    {
      id: 'ballena-amiga', title: 'La ballena amiga', kind: 'cuento', voices: true, stars: 2, bg: 'playa', sprite: 'ballena',
      desc: 'Lucía y Yeray encuentran una ballena en la playa y hablan con ella.',
      challenge: 'Escucha la conversación. Ahora tú: añade un bloque «decir en voz alta» para que Yeray cuente algo más.',
      openSprite: 'Yeray',
      build() {
        const L = S.talk;
        return make({
          backdrops: ['playa'], messages: ['yeray', 'ballena', 'ninos', 'final'],
          sprites: [
            {
              id: 'lucia', name: 'Lucía', x: -150, y: -70, scripts: [
                [F(), S.voice('KITTEN'), S.xy(-150, -70)].concat(L('¡Mira, Yeray! ¡Una ballena!'), [S.send('yeray')]),
                [S.recv('ninos'), S.voice('KITTEN')].concat(L('¡Sí, sí, queremos jugar!'), [S.send('final')]),
                [S.click(), S.voice('KITTEN')].concat(L('¡Mira, Yeray! ¡Una ballena!'))
              ]
            },
            {
              id: 'yeray', x: -60, y: -70, scripts: [
                [F(), S.voice('SQUEAK'), S.xy(-60, -70)],
                [S.recv('yeray'), S.voice('SQUEAK')].concat(L('¡Qué grande es! ¿Será simpática?'), [S.send('ballena')]),
                [S.recv('final'), S.voice('SQUEAK'), S.rep(3, [S.dy(12), S.wait(0.1), S.dy(-12), S.wait(0.1)])].concat(L('¡Qué día más bonito!')),
                [S.click(), S.voice('SQUEAK')].concat(L('¡Qué grande es! ¿Será simpática?'))
              ]
            },
            {
              id: 'ballena', x: 120, y: 20, size: 120, sounds: ['Chapuzón'], scripts: [
                [F(), S.xy(120, 20), S.voice('GIANT')],
                [S.recv('ballena'), S.voice('GIANT'), S.sound('Chapuzón'), S.next()].concat(L('Hola, niños. Soy una ballena calderón. ¿Queréis jugar conmigo?'), [S.next(), S.send('ninos')]),
                [S.click(), S.voice('GIANT')].concat(L('Soy una ballena calderón.'))
              ]
            }
          ]
        });
      }
    },
    {
      id: 'robot-estrella', title: 'El robot y la estrella', kind: 'cuento', voices: true, stars: 2, bg: 'noche', sprite: 'robot',
      desc: 'Un robot quiere viajar al espacio. Una estrella y un cohete le ayudan.',
      challenge: 'Escucha el cuento. Toca el cohete para oír la cuenta atrás. ¿Qué voz le pondrías al robot? Cámbiala en el bloque «usar voz».',
      openSprite: 'Robot',
      build() {
        const L = S.talk;
        return make({
          backdrops: ['noche'], messages: ['estrella', 'cohete', 'subir', 'viaje'],
          sprites: [
            {
              id: 'robot', x: -150, y: -80, scripts: [
                [F(), S.voice('TENOR'), S.show(), S.xy(-150, -80)].concat(L('Soy un robot y nunca he viajado al espacio.'), [S.send('estrella')]),
                [S.recv('subir'), S.voice('TENOR')].concat(L('¡Allá voy! ¡Me subo al cohete!'), [S.glide(1, 60, -90), S.hide(), S.send('viaje')]),
                [S.click(), S.voice('TENOR')].concat(L('Soy un robot y nunca he viajado al espacio.'))
              ]
            },
            {
              id: 'estrella', x: 140, y: 100, scripts: [
                [F(), S.xy(140, 100), S.voice('KITTEN')],
                [S.recv('estrella'), S.voice('KITTEN'), S.grow(30), S.wait(0.3), S.grow(-30)].concat(L('Yo te ayudo. Voy a llamar al cohete.'), [S.send('cohete')]),
                [S.click(), S.voice('KITTEN')].concat(L('Yo te ayudo.'))
              ]
            },
            {
              id: 'cohete', x: 60, y: -90, size: 70, sounds: ['Bocina'], scripts: [
                [F(), S.show(), S.xy(60, -90), S.voice('SQUEAK')],
                [S.recv('cohete'), S.voice('SQUEAK')].concat(L('¡Sube, robot! Te estoy esperando.'), [S.send('subir')]),
                [S.recv('viaje'), S.voice('SQUEAK')].concat(L('¡Tres, dos, uno, despegue!'), [S.sound('Bocina'), S.rep(20, [S.dy(10), S.wait(0.05)]), S.hide()]),
                [S.click(), S.voice('SQUEAK')].concat(L('¡Tres, dos, uno, despegue!'))
              ]
            }
          ]
        });
      }
    },
    /* ---------- cuentos largos, con cambios de escenario ---------- */
    {
      id: 'tesoro-teide', title: 'El tesoro del Teide', kind: 'cuento', voices: true, stars: 3, bg: 'teide', sprite: 'cofre',
      desc: 'Lucía y Yeray buscan un tesoro. Cinco escenarios y tú decides quién les guía.',
      challenge: 'Pulsa la bandera y escucha. Cuando te lo pidan, toca a Yeray, elige un guía y pulsa la tecla espacio. ¿Qué voz le pondrías al perro?',
      openSprite: 'Yeray',
      build() {
        const L = S.talk;
        const paso = (n) => S.eq(S.v('paso'), n);
        return make({
          backdrops: ['pueblo', 'laurisilva', 'teide', 'cueva', 'playa'],
          messages: ['m1', 'm2', 'bosque', 'elperro', 'lamariposa', 'teide', 't2', 't3', 'cueva', 'c2', 'abrir', 'a2', 'final', 'adios'],
          vars: [['paso', 0, false]],
          stage: [
            [F(), S.backdrop('pueblo'), S.setv('paso', 0)],
            [S.recv('bosque'), S.backdrop('laurisilva')],
            [S.recv('teide'), S.backdrop('teide')],
            [S.recv('cueva'), S.backdrop('cueva')],
            [S.recv('final'), S.backdrop('playa')]
          ],
          sprites: [
            {
              id: 'lucia', name: 'Lucía', x: -120, y: -60, sounds: ['Pop'], scripts: [
                [F(), S.voice('KITTEN'), S.show(), S.xy(-120, -60)].concat(L('¡Yeray, mira! He encontrado un mapa del tesoro.'), [S.send('m1')]),
                [S.recv('m2'), S.voice('KITTEN')].concat(L('¡Vamos a buscarlo! Toca a Yeray para empezar el viaje.'), [S.setv('paso', 1)]),
                [S.recv('bosque'), S.voice('KITTEN'), S.setv('paso', 3), S.xy(-150, -70), S.wait(0.6)].concat(L('¡Qué bosque tan verde! Esto es la laurisilva.'), L('Un perro y una mariposa quieren guiarnos. ¡Toca al que prefieras!')),
                [S.recv('teide'), S.voice('KITTEN'), S.xy(-150, -80), S.wait(0.6)].concat(L('¡Cuánto hemos subido! Este es el Teide, el pico más alto de España.'), [S.send('t2')]),
                [S.recv('t3'), S.voice('KITTEN')].concat(L('Pulsa la tecla espacio para entrar en la cueva.'), [S.setv('paso', 5)]),
                [S.key('space'), S.iff(paso(5), [S.setv('paso', 6), S.send('cueva')])],
                [S.recv('cueva'), S.voice('KITTEN'), S.xy(-150, -90), S.wait(0.8)].concat(L('¡Qué oscuro! Menos mal que los cristales brillan.'), [S.send('c2')]),
                [S.recv('abrir'), S.voice('KITTEN')].concat(L('¡Hay monedas de oro y una nota!'), [S.send('a2')]),
                [S.recv('final'), S.voice('KITTEN'), S.xy(-130, -100), S.wait(0.6)].concat(L('¡Qué aventura tan bonita! Gracias por venir con nosotros.'), [S.send('adios')]),
                [S.click(), S.voice('KITTEN')].concat(L('¡Yeray, mira! He encontrado un mapa del tesoro.'))
              ]
            },
            {
              id: 'yeray', x: 80, y: -60, scripts: [
                [F(), S.voice('SQUEAK'), S.show(), S.xy(80, -60)],
                [S.recv('m1'), S.voice('SQUEAK')].concat(L('¡Un tesoro! Dice el mapa que está dentro del volcán.'), [S.send('m2')]),
                [S.click(), S.ifelse(paso(1), [S.setv('paso', 2), S.send('bosque')], [S.sound('Pop'), S.dy(15), S.wait(0.15), S.dy(-15)])],
                [S.recv('bosque'), S.xy(-60, -70)],
                [S.recv('teide'), S.xy(-70, -80)],
                [S.recv('t2'), S.voice('SQUEAK')].concat(L('¡Brrr, qué frío hace aquí arriba! Mira, ¡hay una cueva!'), [S.send('t3')]),
                [S.recv('cueva'), S.xy(-70, -90)],
                [S.recv('c2'), S.voice('SQUEAK')].concat(L('¡Un cofre! Está cerrado. ¡Toca el cofre para abrirlo!'), [S.setv('paso', 7)]),
                [S.recv('a2'), S.voice('SQUEAK')].concat(L('La nota dice: el mayor tesoro es viajar con los amigos.'), [S.send('final')]),
                [S.recv('final'), S.xy(-30, -100)],
                [S.recv('adios'), S.voice('SQUEAK'), S.rep(2, [S.dy(14), S.wait(0.1), S.dy(-14), S.wait(0.1)])].concat(L('¡Fin del cuento! ¡Hasta la próxima aventura!'))
              ]
            },
            {
              id: 'perro', x: 120, y: -70, hidden: true, sounds: ['Pop'], scripts: [
                [F(), S.hide(), S.xy(120, -70), S.voice('SQUEAK')],
                [S.recv('bosque'), S.xy(120, -70), S.show()],
                [S.click(), S.iff(paso(3), [S.setv('paso', 4), S.send('elperro')])],
                [S.recv('elperro'), S.voice('SQUEAK')].concat(L('¡Guau, guau! Yo conozco el camino. ¡Seguidme!'), [S.send('teide')]),
                [S.recv('lamariposa'), S.hide()],
                [S.recv('teide'), S.xy(40, -80)],
                [S.recv('cueva'), S.xy(40, -95)],
                [S.recv('final'), S.xy(70, -115)]
              ]
            },
            {
              id: 'mariposa', x: 150, y: 40, hidden: true, sounds: ['Pop'], scripts: [
                [F(), S.hide(), S.xy(150, 40), S.voice('KITTEN')],
                [S.recv('bosque'), S.xy(150, 40), S.show()],
                [S.click(), S.iff(paso(3), [S.setv('paso', 4), S.send('lamariposa')])],
                [S.recv('lamariposa'), S.voice('KITTEN')].concat(L('Volaré delante de vosotros. ¡Venid conmigo!'), [S.send('teide')]),
                [S.recv('elperro'), S.hide()],
                [S.recv('teide'), S.xy(40, 30)],
                [S.recv('cueva'), S.xy(-10, 20)],
                [S.recv('final'), S.xy(40, 20)],
                [F(), S.forever([S.next(), S.wait(0.25)])]
              ]
            },
            {
              id: 'cofre', x: 110, y: -90, size: 90, hidden: true, sounds: ['Ta-chán'], scripts: [
                [F(), S.hide(), S.costume('Cofre 1'), S.xy(110, -90)],
                [S.recv('cueva'), S.costume('Cofre 1'), S.xy(110, -90), S.show()],
                [S.click(), S.iff(paso(7), [S.setv('paso', 8), S.costume('Cofre 2'), S.sound('Ta-chán'), S.grow(20), S.wait(0.4), S.grow(-20), S.send('abrir')])],
                [S.recv('final'), S.hide()]
              ]
            }
          ]
        });
      }
    },
    {
      id: 'viaje-luna', title: 'Viaje a la Luna', kind: 'cuento', voices: true, stars: 3, bg: 'luna', sprite: 'cohete',
      desc: 'De la clase al espacio: enciende los motores, atrapa estrellas y lleva al robot hasta la bandera.',
      challenge: 'Escucha y juega: toca al robot, toca el cohete tres veces, atrapa tres estrellas y, en la Luna, mueve al robot con las flechas hasta la bandera.',
      openSprite: 'Cohete',
      build() {
        const L = S.talk;
        const paso = (n) => S.eq(S.v('paso'), n);
        return make({
          backdrops: ['aula', 'noche', 'espacio', 'luna'],
          messages: ['m1', 'm2', 'm3', 'noche', 'despegue', 'espacio', 'luna', 'l2', 'l3', 'final', 'f2'],
          vars: [['paso', 0, false], ['motores', 0, false], ['estrellas', 0, false]],
          stage: [
            [F(), S.backdrop('aula'), S.setv('paso', 0), S.hidev('motores'), S.hidev('estrellas')],
            [S.recv('noche'), S.backdrop('noche')],
            [S.recv('espacio'), S.backdrop('espacio')],
            [S.recv('luna'), S.backdrop('luna')]
          ],
          sprites: [
            {
              id: 'lucia', name: 'Lucía', x: -150, y: -80, sounds: ['Pop'], scripts: [
                [F(), S.voice('KITTEN'), S.show(), S.xy(-150, -80)].concat(L('Hoy, en clase, vamos a hablar de la Luna.'), [S.send('m1')]),
                [S.recv('m3'), S.voice('KITTEN')].concat(L('Entonces, ¡a la plataforma de lanzamiento! Toca al robot para ir.'), [S.setv('paso', 1)]),
                [S.recv('noche'), S.voice('KITTEN'), S.xy(-185, -100), S.wait(0.8)].concat(L('Para encender los motores, toca el cohete tres veces.'), [S.setv('paso', 3), S.setv('motores', 0), S.showv('motores')]),
                [S.recv('despegue'), S.hide()],
                [S.recv('luna'), S.voice('KITTEN'), S.wait(2.2), S.xy(-5, -112), S.show()].concat(L('¡Hemos llegado a la Luna! ¡Mira qué bonita se ve la Tierra!'), [S.send('l2')]),
                [S.recv('f2'), S.voice('KITTEN')].concat(L('Gracias por viajar con nosotros. ¡Fin del cuento!')),
                [S.click(), S.voice('KITTEN')].concat(L('Hoy vamos a hablar de la Luna.'))
              ]
            },
            {
              id: 'yeray', x: -40, y: -80, scripts: [
                [F(), S.voice('SQUEAK'), S.show(), S.xy(-40, -80)],
                [S.recv('m1'), S.voice('SQUEAK')].concat(L('¡Yo quiero ir a la Luna! ¿Y tú, robot?'), [S.send('m2')]),
                [S.recv('noche'), S.xy(-110, -100)],
                [S.recv('despegue'), S.hide()],
                [S.recv('luna'), S.wait(2.2), S.xy(65, -115), S.show()],
                [S.recv('l2'), S.voice('SQUEAK'), S.rep(3, [S.dy(30), S.wait(0.15), S.dy(-30), S.wait(0.15)])].concat(L('¡Casi no peso nada! Mira cómo salto.'), [S.send('l3')]),
                [S.click(), S.voice('SQUEAK')].concat(L('¡Yo quiero ir a la Luna!'))
              ]
            },
            {
              id: 'robot', x: 100, y: -80, sounds: ['Pop', 'Ta-chán'], scripts: [
                [F(), S.voice('TENOR'), S.show(), S.xy(100, -80)],
                [S.recv('m2'), S.voice('TENOR')].concat(L('Bip, bip. Mis baterías están cargadas. ¡Vamos!'), [S.send('m3')]),
                [S.click(), S.ifelse(paso(1), [S.setv('paso', 2), S.send('noche')], [S.sound('Pop'), S.next()])],
                [S.recv('noche'), S.xy(-35, -100)],
                [S.recv('despegue'), S.hide()],
                [S.recv('luna'), S.wait(2.2), S.xy(-75, -105), S.show()],
                [S.recv('l3'), S.voice('TENOR')].concat(L('Bip. Con las flechas puedes moverme. ¡Llévame hasta la bandera!'), [S.setv('paso', 7)]),
                [F(), S.forever(S.walk(4, () => S.gt(S.v('paso'), 6)))],
                [S.recv('final'), S.voice('TENOR'), S.sound('Ta-chán'), S.setv('paso', 8)].concat(L('¡Bip, bip! ¡Misión cumplida!'), [S.send('f2')])
              ]
            },
            {
              id: 'cohete', x: 60, y: -60, hidden: true, sounds: ['Bocina', 'Pop'], scripts: [
                [F(), S.hide(), S.xy(100, -60), S.dir(90), S.size(100), S.voice('SQUEAK')],
                [S.recv('noche'), S.xy(100, -60), S.show()],
                [S.click(), S.iff(paso(3), [
                  S.chv('motores', 1), S.sound('Pop'),
                  S.iff(S.eq(S.v('motores'), 1), S.talk('¡Uno!')),
                  S.iff(S.eq(S.v('motores'), 2), S.talk('¡Dos!')),
                  S.iff(S.eq(S.v('motores'), 3), [S.setv('paso', 4), S.hidev('motores')].concat(S.talk('¡Tres! ¡Motores encendidos!'), [S.send('despegue')]))
                ])],
                [S.recv('despegue'), S.sound('Bocina'), S.rep(16, [S.dy(14), S.wait(0.05)]), S.hide(), S.wait(0.3), S.send('espacio')],
                [S.recv('espacio'), S.xy(-170, -110), S.size(70), S.show(), S.sound('Pop'), S.glide(2, -100, -30)],
                [S.recv('luna'), S.glide(2, 150, -95), S.size(70)]
              ]
            },
            {
              id: 'estrella', x: 100, y: 80, size: 70, hidden: true, sounds: ['Magia'], scripts: [
                [F(), S.hide(), S.voice('KITTEN')],
                [S.recv('espacio'), S.wait(2.2), S.xy(100, 80), S.show(), S.voice('KITTEN')].concat(L('¡Hola, viajeros! Toca tres estrellas para llegar a la Luna.'), [S.setv('paso', 5), S.setv('estrellas', 0), S.showv('estrellas')]),
                [S.click(), S.iff(paso(5), [
                  S.chv('estrellas', 1), S.sound('Magia'), S.grow(30), S.wait(0.2), S.grow(-30),
                  S.ifelse(S.eq(S.v('estrellas'), 3), [S.setv('paso', 6), S.hidev('estrellas'), S.hide(), S.send('luna')], [S.goto(S.rnd(-170, 170), S.rnd(-10, 120))])
                ])]
              ]
            },
            {
              id: 'bandera', x: -170, y: -100, size: 80, hidden: true, sounds: ['Pop'], scripts: [
                [F(), S.hide()],
                [S.recv('luna'), S.xy(-170, -100), S.show(), S.waitUntil(S.and(S.gt(S.v('paso'), 6), S.touch('Robot'))), S.send('final')]
              ]
            }
          ]
        });
      }
    },
    /* ---------- alimentación sana: se mueve con las flechas ---------- */
    {
      id: 'mercado-sano', title: 'El mercado de la comida sana', kind: 'cuento', voices: true, stars: 3, bg: 'mercado', sprite: 'manzana',
      desc: 'Mueve a Lucía con las flechas, toca la comida para conocerla y entra en la manzana mágica para descubrir un mensaje escondido.',
      challenge: 'Usa las flechas del teclado (o el mando de la pantalla) para mover a Lucía. Toca los 5 alimentos y escucha los carteles. Cuando los hayas explorado todos, aparecerá la manzana mágica.',
      openSprite: 'Lucía',
      build() {
        const L = S.talk;
        const libre = () => S.eq(S.v('ocupado'), 0);
        /* cada alimento: espera a que Lucía lo toque, suma, avisa al cartel y desaparece */
        const comida = (id, name, x, y, msg, sano) => ({
          id, name, x, y, size: 45, sounds: ['Pop'], scripts: [
            [F(), S.show(), S.xy(x, y), S.size(45),
              S.waitUntil(S.and(S.touch('Lucía'), libre())), S.sound('Pop')]
              .concat(sano ? [S.chv('Comida sana', 1)] : [], [S.chv('Explorado', 1), S.send(msg), S.hide()]),
            [S.recv('entrar'), S.hide()]
          ]
        });
        const info = (msg, text) => [S.recv(msg), S.voice('ALTO'), S.setv('ocupado', 1), S.show()].concat(L(text), [S.hide(), S.setv('ocupado', 0)]);
        return make({
          backdrops: ['mercado', 'dentro-manzana'],
          messages: ['manzana', 'zanahoria', 'platano', 'agua', 'caramelo', 'magica', 'entrar', 'tesoro', 'mensaje', 'fin'],
          vars: [['Comida sana', 0, true], ['Explorado', 0, false], ['paso', 0, false], ['ocupado', 0, false]],
          stage: [[F(), S.backdrop('mercado')], [S.recv('entrar'), S.backdrop('dentro-manzana')]],
          sprites: [
            {
              id: 'lucia', name: 'Lucía', x: -110, y: -92, size: 55, sounds: ['Pop'], scripts: [
                [F(), S.voice('KITTEN'), S.show(), S.size(55), S.xy(-110, -92), S.setv('paso', 0), S.setv('Comida sana', 0), S.setv('Explorado', 0), S.setv('ocupado', 0)]
                  .concat(L('¡Hola! Estoy en el mercado. Muéveme con las flechas y toca toda la comida para conocerla. ¡Cuando las conozcas todas, ocurrirá algo mágico!'), [S.setv('paso', 1)]),
                [F(), S.forever(S.walk(4, () => S.gt(S.v('paso'), 0)))],
                [S.recv('entrar'), S.xy(-170, -110), S.size(55)],
                [S.recv('fin'), S.voice('KITTEN'), S.sound('Ta-chán'), S.rep(3, [S.dy(16), S.wait(0.1), S.dy(-16), S.wait(0.1)])]
                  .concat(L('¡Lo he conseguido! Ahora sé cómo comer sano.'), [S.stopAll()]),
                [S.click(), S.voice('KITTEN')].concat(L('Muéveme con las flechas.'))
              ]
            },
            comida('manzana', 'Manzana', -150, -35, 'manzana', true),
            comida('zanahoria', 'Zanahoria', -75, -150, 'zanahoria', true),
            comida('platano', 'Plátano', 0, -35, 'platano', true),
            comida('agua', 'Vaso de agua', 75, -150, 'agua', true),
            comida('caramelo', 'Caramelo', 150, -35, 'caramelo', false),
            {
              id: 'manzana', name: 'Manzana mágica', x: 0, y: 40, size: 150, hidden: true, sounds: ['Magia'], scripts: [
                [F(), S.hide(), S.xy(0, 40), S.size(150), S.waitUntil(S.and(S.eq(S.v('Explorado'), 5), libre())), S.show(), S.sound('Magia'), S.send('magica'),
                  S.waitUntil(S.and(S.touch('Lucía'), libre())), S.sound('Magia'), S.hide(), S.send('entrar')]
              ]
            },
            {
              id: 'semilla', x: 130, y: -70, size: 60, hidden: true, sounds: ['Pop'], scripts: [
                [F(), S.hide()],
                [S.recv('entrar'), S.xy(130, -70), S.show(), S.waitUntil(S.touch('Lucía')), S.sound('Pop'), S.hide(), S.send('tesoro')]
              ]
            },
            {
              id: 'pergamino', x: 0, y: 0, size: 40, hidden: true, sounds: ['Ta-chán'], scripts: [
                [F(), S.hide(), S.size(40)],
                [S.recv('tesoro'), S.xy(0, 0), S.size(40), S.show(), S.sound('Ta-chán'), S.rep(6, [S.grow(12), S.wait(0.05)]), S.send('mensaje')]
              ]
            },
            {
              id: 'cartel', x: -150, y: 85, size: 80, hidden: true, sounds: ['Pop'], scripts: [
                [F(), S.hide(), S.xy(-150, 85), S.setv('ocupado', 0)],
                info('manzana', 'La manzana tiene vitaminas y fibra. ¡Es una merienda muy sana!'),
                info('zanahoria', 'La zanahoria es crujiente y buena para la vista.'),
                info('platano', 'Los plátanos de Canarias dan energía para jugar y correr.'),
                info('agua', 'El agua es la mejor bebida. ¡Bebe agua a todas horas!'),
                info('caramelo', 'Los caramelos tienen mucho azúcar. Solo de vez en cuando, y después, ¡a lavarse los dientes!'),
                info('magica', '¡Mira! Ha aparecido una manzana mágica. ¡Tócala con Lucía para entrar!'),
                [S.recv('entrar'), S.voice('ALTO'), S.xy(0, 110), S.setv('ocupado', 1), S.show()]
                  .concat(L('Estás dentro de la manzana. Busca la semilla sonriente.'), [S.hide(), S.setv('ocupado', 0)]),
                [S.recv('mensaje'), S.voice('ALTO'), S.xy(0, 120), S.size(90), S.show()]
                  .concat(L('Has encontrado el mensaje escondido. Dice: come fruta y verdura cada día, bebe agua y muévete mucho. ¡Así creces fuerte y sano!'), [S.send('fin')])
              ]
            }
          ]
        });
      }
    },
    /* ---------- juegos de movimiento ---------- */
    {
      id: 'penalti', title: '¡Penalti!', kind: 'juego', stars: 2, bg: 'estadio', sprite: 'balon',
      desc: 'Elige hacia dónde chutar con las flechas y pulsa espacio. ¡El portero se tira al azar!',
      challenge: 'Mueve la mira con las flechas izquierda y derecha y pulsa la tecla espacio para chutar. Tienes 5 tiros. ¿Cuántos goles marcas?',
      openSprite: 'Portero',
      build() {
        const L = S.talk;
        const libre = () => S.eq(S.v('listo'), 1);
        const salto = (cond) => S.eq(S.v('salto'), cond);
        return make({
          backdrops: ['estadio'], messages: ['chuta', 'gol', 'parada', 'siguiente', 'reset', 'fin'],
          vars: [['Goles', 0, true], ['Tiros', 5, true], ['listo', 0, false], ['tiro', 0, false], ['salto', 0, false]],
          stage: [[F(), S.backdrop('estadio')]],
          sprites: [
            {
              id: 'lucia', name: 'Lucía', x: -110, y: -125, size: 65, sounds: ['Pop'], scripts: [
                [F(), S.voice('KITTEN'), S.xy(-110, -125)].concat(L('¡Penalti! Mueve la mira con las flechas y pulsa espacio para chutar.'), [S.setv('listo', 1)]),
                [S.recv('gol'), S.voice('KITTEN'), S.rep(2, [S.dy(14), S.wait(0.1), S.dy(-14), S.wait(0.1)])].concat(L('¡Goooool!')),
                [S.recv('parada'), S.voice('KITTEN')].concat(L('¡Uy! ¡Qué parada!')),
                [S.recv('fin'), S.voice('KITTEN'), R('text2speech_speakAndWait', { WORDS: S.join('Se acabó. Has marcado ', S.join(S.v('Goles'), ' goles. ¡Pulsa la bandera para jugar otra vez!')) })]
              ]
            },
            {
              id: 'portero', x: 0, y: 62, size: 70, sounds: ['Pop'], scripts: [
                [F(), S.xy(0, 62), S.dir(90), S.costume('Portero 1')],
                [S.recv('chuta'),
                  S.setv('salto', S.times(S.minus(S.rnd(1, 3), 2), 100)),
                  S.ifelse(salto(-100), [S.dir(30), S.costume('Portero 2'), S.glide(0.4, -100, 62)], [S.ifelse(salto(100), [S.dir(150), S.costume('Portero 2'), S.glide(0.4, 100, 62)], [S.costume('Portero 2'), S.glide(0.4, 0, 90)])])],
                [S.recv('reset'), S.xy(0, 62), S.dir(90), S.costume('Portero 1')]
              ]
            },
            {
              id: 'balon', x: 0, y: -110, size: 45, sounds: ['Pop', 'Ta-chán', 'Boing'], scripts: [
                [F(), S.xy(0, -110), S.costume('Balón 1'), S.setv('Goles', 0), S.setv('Tiros', 5), S.setv('listo', 0), S.setv('tiro', 0)],
                [S.key('space'), S.iff(libre(), [S.setv('listo', 0), S.send('chuta')])],
                [S.recv('chuta'), S.sound('Pop'), S.chv('Tiros', -1), S.glide(0.45, S.v('tiro'), 62), S.next(), S.wait(0.3),
                  S.ifelse(S.eq(S.v('tiro'), S.v('salto')), [S.send('parada')], [S.send('gol')])],
                [S.recv('gol'), S.chv('Goles', 1), S.sound('Ta-chán'), S.wait(1.6), S.send('siguiente')],
                [S.recv('parada'), S.sound('Boing'), S.wait(1.6), S.send('siguiente')],
                [S.recv('siguiente'), S.ifelse(S.eq(S.v('Tiros'), 0), [S.send('fin')], [S.xy(0, -110), S.costume('Balón 1'), S.send('reset'), S.setv('listo', 1)])]
              ]
            },
            {
              id: 'mira', x: 0, y: 62, size: 55, sounds: ['Pop'], scripts: [
                [F(), S.xy(0, 62), S.setv('tiro', 0)],
                [S.key('left arrow'), S.iff(S.and(libre(), S.gt(S.xpos(), -90)), [S.dx(-100), S.setv('tiro', S.xpos())])],
                [S.key('right arrow'), S.iff(S.and(libre(), S.lt(S.xpos(), 90)), [S.dx(100), S.setv('tiro', S.xpos())])],
                [S.recv('reset'), S.xy(0, 62), S.setv('tiro', 0)]
              ]
            }
          ]
        });
      }
    },
    {
      id: 'atrapa-platanos', title: 'Atrapa los plátanos', kind: 'juego', stars: 1, bg: 'campo', sprite: 'lagarto',
      desc: 'Mueve al lagarto con las flechas y come 10 plátanos. Cada vez aparece uno en un sitio nuevo.',
      challenge: 'Mueve al lagarto con las flechas y atrapa los plátanos. ¿Puedes cambiar el número de plátanos para ganar o la velocidad?',
      openSprite: 'Lagarto',
      build() {
        return make({
          backdrops: ['campo'], messages: ['fin'], vars: [['Plátanos', 0, true]],
          stage: [[F(), S.backdrop('campo')]],
          sprites: [
            {
              id: 'lagarto', x: -140, y: -110, size: 75, sounds: ['Pop'], scripts: [
                [F(), S.xy(-140, -110), S.voice('SQUEAK'), S.setv('Plátanos', 0)],
                [F(), S.forever(S.walk(5))],
                [S.recv('fin'), S.voice('SQUEAK'), S.sound('Pop')].concat(S.talk('¡Qué rico! Me he comido diez plátanos.'), [S.stopAll()]),
                [S.click(), S.voice('SQUEAK')].concat(S.talk('Muéveme con las flechas.'))
              ]
            },
            {
              id: 'platano', x: 100, y: -20, size: 60, sounds: ['Pop'], scripts: [
                [F(), S.xy(100, -20), S.forever([
                  S.iff(S.touch('Lagarto'), [S.chv('Plátanos', 1), S.sound('Pop'), S.goto(S.rnd(-170, 170), S.rnd(-120, 40)),
                    S.iff(S.eq(S.v('Plátanos'), 10), [S.send('fin')]), S.wait(0.3)])
                ])]
              ]
            }
          ]
        });
      }
    }
,
    /* ---------- más cuentos interactivos ---------- */
    {
      id: 'rescate-mar', title: 'Rescate en el mar', kind: 'cuento', voices: true, stars: 2, bg: 'mar', sprite: 'tortuga',
      desc: 'Recoge las botellas de la playa y elige quién da un paseo por el mar. ¡Cuidemos el océano!',
      challenge: 'Toca las 3 botellas de la playa. Después, en el mar, toca a la tortuga o a la ballena para que te lleve de paseo.',
      openSprite: 'Botella',
      build() {
        const L = S.talk;
        const paso = (n) => S.eq(S.v('paso'), n);
        return make({
          backdrops: ['playa', 'mar'], messages: ['m1', 'm2', 'mar', 'm3', 'm4', 'paseot', 'paseob', 'final', 'adios'],
          vars: [['paso', 0, false], ['botellas', 0, false]],
          stage: [[F(), S.backdrop('playa'), S.setv('paso', 0)], [S.recv('mar'), S.backdrop('mar')], [S.recv('final'), S.backdrop('playa')]],
          sprites: [
            {
              id: 'lucia', name: 'Lucía', x: -140, y: -100, size: 85, sounds: ['Pop'], scripts: [
                [F(), S.voice('KITTEN'), S.show(), S.xy(-140, -100), S.hidev('botellas')].concat(L('¡Qué playa tan bonita! Pero mira, hay botellas de plástico.'), [S.send('m1')]),
                [S.recv('m2'), S.voice('KITTEN')].concat(L('Toca las botellas para recogerlas. ¡Son tres!'), [S.setv('paso', 1), S.setv('botellas', 0), S.showv('botellas')]),
                [S.recv('mar'), S.voice('KITTEN'), S.xy(-170, 60)].concat(L('¡Qué limpio está el mar! Mira cuántos amigos.'), [S.send('m3')]),
                [S.recv('final'), S.voice('KITTEN'), S.xy(-110, -100), S.wait(0.6)].concat(L('¡Qué playa tan limpia! Cuidemos el mar entre todos.'), [S.send('adios')]),
                [S.click(), S.voice('KITTEN')].concat(L('¡Qué playa tan bonita!'))
              ]
            },
            {
              id: 'yeray', x: -50, y: -100, size: 85, scripts: [
                [F(), S.voice('SQUEAK'), S.show(), S.xy(-50, -100)],
                [S.recv('m1'), S.voice('SQUEAK')].concat(L('El plástico ensucia el mar y hace daño a los animales. ¡Vamos a limpiarlo!'), [S.send('m2')]),
                [S.recv('mar'), S.xy(-100, 60)],
                [S.recv('final'), S.xy(-30, -100)],
                [S.recv('adios'), S.voice('SQUEAK'), S.rep(2, [S.dy(14), S.wait(0.1), S.dy(-14), S.wait(0.1)])].concat(L('¡Fin del cuento! ¡Hasta pronto!'))
              ]
            },
            {
              id: 'botella', x: 90, y: -130, size: 60, hidden: true, sounds: ['Pop', 'Ta-chán'], scripts: [
                [F(), S.hide(), S.xy(90, -130)],
                [S.recv('m2'), S.xy(90, -130), S.show()],
                [S.click(), S.iff(paso(1), [S.chv('botellas', 1), S.sound('Pop'),
                  S.ifelse(S.eq(S.v('botellas'), 3), [S.setv('paso', 2), S.hidev('botellas'), S.hide(), S.sound('Ta-chán'), S.wait(0.6), S.send('mar')], [S.goto(S.rnd(30, 170), S.rnd(-160, -100))])])]
              ]
            },
            {
              id: 'tortuga', x: -40, y: -50, size: 90, hidden: true, sounds: ['Chapuzón'], scripts: [
                [F(), S.hide(), S.voice('GIANT'), S.xy(-40, -50)],
                [S.recv('mar'), S.xy(-40, -50), S.show()],
                [S.recv('m3'), S.voice('GIANT')].concat(L('Gracias por limpiar la playa. Ahora podemos nadar sin peligro.'), [S.send('m4')]),
                [S.click(), S.iff(paso(3), [S.setv('paso', 4), S.send('paseot')])],
                [S.recv('paseot'), S.voice('GIANT')].concat(L('¡Agarraos a mi caparazón! ¡Vamos a nadar!'), [S.rep(2, [S.glide(1, 100, -30), S.next(), S.glide(1, -40, -50), S.next()]), S.send('final')]),
                [S.recv('paseob'), S.hide()],
                [S.recv('final'), S.hide()]
              ]
            },
            {
              id: 'ballena', x: 130, y: 40, size: 110, hidden: true, sounds: ['Chapuzón'], scripts: [
                [F(), S.hide(), S.voice('GIANT'), S.xy(130, 40)],
                [S.recv('mar'), S.xy(130, 40), S.show()],
                [S.click(), S.iff(paso(3), [S.setv('paso', 4), S.send('paseob')])],
                [S.recv('paseob'), S.voice('GIANT'), S.sound('Chapuzón'), S.next()].concat(L('Soy una ballena calderón. ¡Vamos a dar un paseo!'), [S.rep(2, [S.glide(1, 0, 70), S.glide(1, 130, 40)]), S.next(), S.send('final')]),
                [S.recv('paseot'), S.hide()],
                [S.recv('final'), S.hide()]
              ]
            },
            {
              id: 'cangrejo', x: 150, y: -120, size: 70, hidden: true, sounds: ['Pop'], scripts: [
                [F(), S.hide(), S.voice('SQUEAK'), S.xy(150, -120)],
                [S.recv('mar'), S.show()],
                [S.recv('m4'), S.voice('SQUEAK')].concat(L('Toca a la tortuga o a la ballena para dar un paseo.'), [S.setv('paso', 3)]),
                [S.recv('final'), S.hide()]
              ]
            }
          ]
        });
      }
    },
    {
      id: 'huerto-lucia', title: 'El huerto de Lucía', kind: 'cuento', voices: true, stars: 2, bg: 'huerto', sprite: 'zanahoria',
      desc: 'Planta una semilla, riégala, dale sol y mira cómo crece una zanahoria. Después, ¡al mercado!',
      challenge: 'Toca la semilla, toca el vaso de agua tres veces, toca el sol y por último toca la zanahoria para cogerla.',
      openSprite: 'Zanahoria',
      build() {
        const L = S.talk;
        const paso = (n) => S.eq(S.v('paso'), n);
        return make({
          backdrops: ['huerto', 'mercado'], messages: ['m1', 'plantada', 'sol', 'crece', 'lista', 'cosecha', 'fin', 'riega'],
          vars: [['paso', 0, false], ['riego', 0, false]],
          stage: [[F(), S.backdrop('huerto'), S.setv('paso', 0)], [S.recv('cosecha'), S.backdrop('mercado')]],
          sprites: [
            {
              id: 'lucia', name: 'Lucía', x: -150, y: -20, size: 85, sounds: ['Pop'], scripts: [
                [F(), S.voice('KITTEN'), S.show(), S.xy(-150, -20), S.hidev('riego')].concat(L('¡Hola! Hoy vamos a plantar una zanahoria en el huerto.'), L('Toca la semilla para plantarla.'), [S.setv('paso', 1)]),
                [S.recv('plantada'), S.voice('KITTEN')].concat(L('¡Ya está plantada! Ahora necesita agua. Toca el vaso tres veces.'), [S.setv('paso', 3), S.setv('riego', 0), S.showv('riego')]),
                [S.recv('sol'), S.voice('KITTEN')].concat(L('¡Muy bien! Ahora necesita sol. Toca el sol.'), [S.setv('paso', 4)]),
                [S.recv('lista'), S.voice('KITTEN')].concat(L('¡Qué grande ha crecido! Toca la zanahoria para cogerla.'), [S.setv('paso', 5)]),
                [S.recv('cosecha'), S.voice('KITTEN'), S.xy(-60, -140), S.wait(0.6)].concat(L('Vamos a llevarla al mercado para compartirla.'), [S.send('fin')]),
                [S.click(), S.voice('KITTEN')].concat(L('Hoy vamos a plantar una zanahoria.'))
              ]
            },
            {
              id: 'yeray', x: 150, y: -20, size: 85, hidden: true, scripts: [
                [F(), S.hide(), S.voice('SQUEAK'), S.xy(150, -20)],
                [S.recv('cosecha'), S.xy(40, -140), S.show()],
                [S.recv('fin'), S.voice('SQUEAK'), S.rep(2, [S.dy(14), S.wait(0.1), S.dy(-14), S.wait(0.1)])].concat(L('¡Qué rica! La zanahoria es buena para la vista. ¡Fin del cuento!'))
              ]
            },
            {
              id: 'semilla', x: -90, y: -60, size: 50, sounds: ['Pop'], scripts: [
                [F(), S.show(), S.xy(-90, -60)],
                [S.click(), S.iff(paso(1), [S.setv('paso', 2), S.sound('Pop'), S.glide(0.8, 0, -86), S.hide(), S.send('plantada')])]
              ]
            },
            {
              id: 'agua', x: 150, y: 20, size: 55, hidden: true, sounds: ['Chapuzón'], scripts: [
                [F(), S.hide(), S.xy(150, 20)],
                [S.recv('plantada'), S.show()],
                [S.click(), S.iff(paso(3), [S.chv('riego', 1), S.sound('Chapuzón'), S.dy(-15), S.wait(0.2), S.dy(15), S.send('riega'),
                  S.iff(S.eq(S.v('riego'), 3), [S.setv('paso', 3.5), S.hidev('riego'), S.hide(), S.send('sol')])])]
              ]
            },
            {
              id: 'estrella', name: 'Sol', x: 170, y: 120, size: 70, hidden: true, sounds: ['Magia'], scripts: [
                [F(), S.hide(), S.xy(170, 120)],
                [S.recv('sol'), S.show()],
                [S.click(), S.iff(paso(4), [S.setv('paso', 4.5), S.sound('Magia'), S.grow(30), S.wait(0.3), S.hide(), S.send('crece')])]
              ]
            },
            {
              id: 'zanahoria', x: 0, y: -72, size: 15, hidden: true, sounds: ['Pop'], scripts: [
                [F(), S.hide(), S.size(15), S.xy(0, -72)],
                [S.recv('plantada'), S.size(15), S.xy(0, -72), S.show()],
                [S.recv('riega'), S.grow(12), S.dy(7)],
                [S.recv('crece'), S.rep(8, [S.grow(8), S.dy(3), S.wait(0.12)]), S.send('lista')],
                [S.click(), S.iff(paso(5), [S.setv('paso', 6), S.sound('Pop'), S.hide(), S.send('cosecha')])]
              ]
            }
          ]
        });
      }
    },
    /* ---------- más juegos ---------- */
    {
      id: 'frutas-si', title: 'Frutas sí, caramelos no', kind: 'juego', stars: 2, bg: 'campo', sprite: 'manzana',
      desc: 'Mueve a Lucía a izquierda y derecha: atrapa las frutas y verduras y esquiva los caramelos. ¡Consigue 20 puntos!',
      challenge: 'Usa las flechas izquierda y derecha. Cada fruta o verdura suma un punto; cada caramelo resta uno. ¡Llega a 20!',
      openSprite: 'Lucía',
      build() {
        const caer = (x0, wait, good) => [[F(), S.show(), S.setv('paso', 0), S.goto(x0, 190), S.wait(wait), S.forever([
          S.dy(-5),
          S.iff(S.touch('Lucía'), good
            ? [S.chv('Puntos', 1), S.sound('Pop'), S.goto(S.rnd(-200, 200), 190),
              S.iff(S.and(S.gt(S.v('Puntos'), 19), S.eq(S.v('paso'), 0)), [S.setv('paso', 1), S.setv('Puntos', 20), S.send('fin')])]
            : [S.iff(S.gt(S.v('Puntos'), 0), [S.chv('Puntos', -1)]), S.sound('Boing'), S.goto(S.rnd(-200, 200), 190)]),
          S.iff(S.lt(mk('motion_yposition'), -170), [S.goto(S.rnd(-200, 200), 190)])
        ])], [S.recv('fin'), S.hide()]];
        return make({
          backdrops: ['campo'], messages: ['fin'], vars: [['Puntos', 0, true], ['paso', 0, false]],
          stage: [[F(), S.backdrop('campo')]],
          sprites: [
            {
              id: 'lucia', name: 'Lucía', x: 0, y: -135, size: 75, sounds: ['Pop'], scripts: [
                [F(), S.show(), S.xy(0, -135), S.voice('KITTEN'), S.setv('Puntos', 0), S.setv('paso', 0), S.forever([
                  S.iff(S.and(S.keyp('left arrow'), S.gt(S.xpos(), -200)), [S.dx(-7)]),
                  S.iff(S.and(S.keyp('right arrow'), S.lt(S.xpos(), 200)), [S.dx(7)])])],
                [S.recv('fin'), S.voice('KITTEN'), S.hide()].concat(S.talk('¡Enhorabuena! ¡Lo has conseguido! Veinte puntos. Las frutas y las verduras nos hacen crecer fuertes.'), [S.wait(1), S.stopAll()])
              ]
            },
            {
              id: 'premio', name: 'Premio', x: 0, y: 10, size: 40, hidden: true, sounds: ['Magia', 'Ta-chán'], scripts: [
                [F(), S.hide(), S.size(40)],
                [S.recv('fin'), S.size(40), S.xy(0, 10), S.show(), S.sound('Magia'), S.rep(14, [S.grow(22), S.wait(0.03)]), S.rep(3, [S.grow(-10), S.wait(0.06), S.grow(10), S.wait(0.06)]), S.sound('Ta-chán')]
              ]
            },
            { id: 'manzana', x: -120, y: 190, size: 45, sounds: ['Pop', 'Boing'], scripts: caer(-120, 0, true) },
            { id: 'zanahoria', x: 90, y: 190, size: 45, sounds: ['Pop', 'Boing'], scripts: caer(90, 1.5, true) },
            { id: 'caramelo', x: 0, y: 190, size: 45, sounds: ['Pop', 'Boing'], scripts: caer(0, 0.8, false) }
          ]
        });
      }
    },
    {
      id: 'atrapa-pez', title: 'Atrapa al pez', kind: 'juego', stars: 1, bg: 'mar', sprite: 'pez',
      desc: 'El pez no para quieto. Toca todos los peces que puedas en 20 segundos.',
      challenge: 'Toca al pez cada vez que cambie de sitio. ¿Cuántos atrapas en 20 segundos? Prueba a cambiar la velocidad del pez.',
      openSprite: 'Pez',
      build() {
        return make({
          backdrops: ['mar'], messages: ['fin'], vars: [['Peces', 0, true], ['Tiempo', 20, true]],
          stage: [[F(), S.backdrop('mar')]],
          sprites: [
            {
              id: 'pez', x: 0, y: 0, size: 65, sounds: ['Pop'], scripts: [
                [F(), S.setv('Peces', 0), S.forever([S.goto(S.rnd(-170, 170), S.rnd(-110, 110)), S.next(), S.wait(0.7)])],
                [S.click(), S.chv('Peces', 1), S.sound('Pop'), S.goto(S.rnd(-170, 170), S.rnd(-110, 110))]
              ]
            },
            {
              id: 'cangrejo', x: 160, y: -130, size: 60, sounds: ['Ta-chán'], scripts: [
                [F(), S.voice('SQUEAK'), S.setv('Tiempo', 20), S.rep(20, [S.wait(1), S.chv('Tiempo', -1)]), S.send('fin')],
                [S.recv('fin'), S.voice('SQUEAK'), S.sound('Ta-chán'),
                  R('text2speech_speakAndWait', { WORDS: S.join('¡Se acabó el tiempo! Has atrapado ', S.join(S.v('Peces'), ' peces.')) }), S.stopAll()]
              ]
            }
          ]
        });
      }
    },
    /* ---------- laurisilva: cuento con animales, reciclaje y elecciones ---------- */
    {
      id: 'secreto-laurisilva', title: 'El secreto de la laurisilva', kind: 'cuento', voices: true, stars: 3, bg: 'laurisilva', sprite: 'paloma',
      desc: 'Excursión al bosque de laurisilva: saluda a cuatro animales, recoge una botella y elige el contenedor correcto.',
      challenge: 'Escucha y toca: primero a los cuatro animales, luego la botella y, al final, el contenedor donde va el plástico. ¡Cuidado con el equivocado!',
      openSprite: 'Paloma',
      build() {
        const L = S.talk;
        const paso = (n) => S.eq(S.v('paso'), n);
        const libre = () => S.eq(S.v('ocupado'), 0);
        const POS = { paloma: [160, 62], canario: [-5, 62], mariposa: [-110, 30], lagarto: [130, -85] };
        const animal = (id, name, voz, aparece, hecho, frase, extra) => ({
          id, name, x: POS[id][0], y: POS[id][1], hidden: true, size: id === 'lagarto' ? 80 : 90, sounds: ['Pop'], scripts: [
            [F(), S.hide(), S.voice(voz)],
            [S.recv('animales'), S.wait(aparece), S.xy(POS[id][0], POS[id][1]), S.show(), S.sound('Pop'), S.next(), S.wait(0.2), S.next()],
            [S.recv('basura'), S.hide()],
            [S.recv('tarde'), S.wait(aparece + 0.5), S.xy(POS[id][0], POS[id][1]), S.show(), S.sound('Pop')],
            [S.click(), S.iff(S.and(paso(1), libre()), [
              S.setv('ocupado', 1), S.voice(voz), S.sound('Pop'),
              S.ifelse(S.eq(S.v(hecho), 0),
                [S.setv(hecho, 1), S.chv('Animales', 1)].concat(L(frase), [
                  S.iff(S.eq(S.v('Animales'), 4), [S.setv('paso', 2), S.hidev('Animales'), S.setv('ocupado', 0), S.send('basura')]),
                  S.setv('ocupado', 0)]),
                L(frase).concat([S.setv('ocupado', 0)]))
            ])]
          ].concat(extra || [])
        });
        return make({
          backdrops: ['laurisilva', 'bosque-tarde'],
          messages: ['m1', 'm2', 'animales', 'basura', 'b2', 'conts', 'ok', 'tarde', 't2', 't3', 'fin'],
          vars: [['paso', 0, false], ['Animales', 0, false], ['ocupado', 0, false], ['hPaloma', 0, false], ['hCanario', 0, false], ['hMariposa', 0, false], ['hLagarto', 0, false]],
          stage: [
            [F(), S.backdrop('laurisilva'), S.hidev('Animales')],
            [S.recv('tarde'), S.backdrop('bosque-tarde')]
          ],
          sprites: [
            {
              id: 'lucia', name: 'Lucía', x: -170, y: -75, sounds: ['Pop'], scripts: [
                [F(), S.voice('KITTEN'), S.show(), S.xy(-170, -75), S.setv('paso', 0), S.setv('Animales', 0), S.setv('ocupado', 0),
                  S.setv('hPaloma', 0), S.setv('hCanario', 0), S.setv('hMariposa', 0), S.setv('hLagarto', 0), S.wait(0.5)]
                  .concat(L('¡Qué ilusión! Hoy visitamos el bosque de laurisilva, en la isla de Tenerife.'), [S.send('m1')]),
                [S.recv('m2'), S.voice('KITTEN')].concat(L('Shhh. Escucha con atención. ¡Aquí viven muchos animales!'), [S.send('animales')]),
                [S.recv('animales'), S.voice('KITTEN'), S.wait(2.6)].concat(L('Toca a los cuatro animales para saludarlos.'), [S.setv('paso', 1), S.setv('Animales', 0), S.showv('Animales')]),
                [S.recv('b2'), S.voice('KITTEN')].concat(L('Los animales se han asustado. Toca la botella para recogerla.'), [S.setv('paso', 3)]),
                [S.recv('conts'), S.voice('KITTEN'), S.wait(0.6)].concat(L('Una botella de plástico no se tira al suelo. ¿Dónde va? Toca el contenedor correcto.'), [S.setv('paso', 5)]),
                [S.recv('t3'), S.voice('KITTEN')].concat(L('Los árboles de la laurisilva beben el agua de la niebla. Si los cuidamos, siempre habrá agua.'), [S.send('fin')]),
                [S.recv('fin'), S.voice('KITTEN'), S.hide()].concat(L('¡Fin del cuento! Gracias por ayudar al bosque.'), [S.wait(1), S.stopAll()]),
                [S.click(), S.voice('KITTEN'), S.iff(libre(), L('¡Qué bonito es el bosque!'))]
              ]
            },
            {
              id: 'yeray', x: -70, y: -75, sounds: ['Pop'], scripts: [
                [F(), S.voice('SQUEAK'), S.show(), S.xy(-70, -75)],
                [S.recv('m1'), S.voice('SQUEAK')].concat(L('¡Qué verde está todo! Aquí hay mucha niebla, y los árboles beben el agua de las nubes.'), [S.send('m2')]),
                [S.recv('basura'), S.voice('SQUEAK'), S.wait(1.2)].concat(L('¡Oh, no! Alguien ha dejado una botella en el suelo.'), [S.send('b2')]),
                [S.recv('t2'), S.voice('SQUEAK')].concat(L('¡Yo siempre tiraré la basura en su contenedor!'), [S.send('t3')]),
                [S.click(), S.voice('SQUEAK'), S.iff(libre(), L('¡Me encanta este bosque!'))]
              ]
            },
            animal('paloma', 'Paloma', 'ALTO', 0.2, 'hPaloma', 'Arrurrú. Soy la paloma rabiche. Vivo en lo alto de los árboles del bosque.', [
              [S.recv('tarde'), S.voice('ALTO'), S.wait(3.6)].concat(L('Arrurrú. ¡Gracias por cuidar nuestro bosque!'), [S.send('t2')])
            ]),
            animal('canario', 'Canario', 'SQUEAK', 0.9, 'hCanario', '¡Pío, pío! Soy un canario. ¡Me encanta cantar entre las ramas!'),
            animal('mariposa', 'Mariposa', 'KITTEN', 1.6, 'hMariposa', 'Soy una mariposa. Vuelo de flor en flor y ayudo a que las plantas crezcan.'),
            animal('lagarto', 'Lagarto', 'TENOR', 2.2, 'hLagarto', 'Soy un lagarto canario. Me gusta tomar el sol sobre las piedras.'),
            {
              id: 'botella', x: 10, y: -110, size: 70, hidden: true, sounds: ['Pop', 'Ta-chán'], scripts: [
                [F(), S.hide()],
                [S.recv('basura'), S.xy(10, -110), S.show(), S.sound('Pop')],
                [S.click(), S.iff(paso(3), [S.setv('paso', 4), S.sound('Pop'), S.glide(0.6, -20, 0), S.send('conts')])],
                [S.recv('ok'), S.glide(1, 60, -85), S.hide()]
              ]
            },
            {
              id: 'contenedor', name: 'Contenedor amarillo', x: 60, y: -100, size: 70, hidden: true, sounds: ['Ta-chán', 'Pop'], scripts: [
                [F(), S.hide(), S.costume('Contenedor 1'), S.voice('TENOR')],
                [S.recv('conts'), S.xy(60, -100), S.show(), S.sound('Pop')],
                [S.click(), S.iff(S.and(paso(5), libre()), [
                  S.setv('paso', 6), S.setv('ocupado', 1), S.voice('TENOR'), S.sound('Ta-chán'), S.send('ok'), S.wait(1.1)]
                  .concat(L('¡Muy bien! El plástico va al contenedor amarillo.'), [S.hide(), S.setv('ocupado', 0), S.send('tarde')]))]
              ]
            },
            {
              id: 'contenedor', name: 'Contenedor azul', x: 165, y: -100, size: 70, hidden: true, sounds: ['Boing', 'Pop'], scripts: [
                [F(), S.hide(), S.costume('Contenedor 2'), S.voice('TENOR')],
                [S.recv('conts'), S.xy(165, -100), S.show(), S.sound('Pop')],
                [S.recv('tarde'), S.hide()],
                [S.click(), S.iff(S.and(paso(5), libre()), [S.setv('ocupado', 1), S.voice('TENOR'), S.sound('Boing')]
                  .concat(L('Ese es el contenedor azul. Es para el papel y el cartón. ¡Prueba con el amarillo!'), [S.setv('ocupado', 0)]))]
              ]
            },
            {
              id: 'bravo', x: 0, y: 40, size: 40, hidden: true, sounds: ['Magia'], scripts: [
                [F(), S.hide(), S.size(40)],
                [S.recv('fin'), S.size(40), S.xy(0, 50), S.show(), S.sound('Magia'), S.rep(7, [S.grow(14), S.wait(0.03)])]
              ]
            }
          ]
        });
      }
    },

    /* ---------- memoria de parejas ---------- */
    {
      id: 'memoria-canarias', title: 'Memoria de animales canarios', kind: 'juego', stars: 1, bg: 'laurisilva', sprite: 'carta',
      desc: 'Da la vuelta a dos cartas y encuentra las cuatro parejas de animales. Cada carta dice su nombre en voz alta.',
      challenge: 'Toca una carta y después otra. Si son iguales, ¡pareja! Si no, se vuelven a tapar. Encuentra las cuatro parejas.',
      openSprite: 'Casilla 1',
      build() {
        const NAMES = ['Canario', 'Lagarto', 'Tortuga', 'Mariposa'];
        const PERM = [[1, 2, 3, 4, 1, 2, 3, 4], [2, 4, 1, 3, 3, 1, 4, 2], [3, 1, 4, 2, 2, 4, 1, 3], [4, 3, 2, 1, 1, 2, 3, 4]];
        const XS = [-165, -55, 55, 165], YS = [55, -55];
        const carta = (i) => {
          const e = 'e' + (i + 1), f = 'f' + (i + 1);
          return {
            id: 'carta', name: 'Casilla ' + (i + 1), x: XS[i % 4], y: YS[Math.floor(i / 4)], size: 80, sounds: ['Pop', 'Ta-chán', 'Boing'], scripts: [
              [F(), S.voice('ALTO'), S.show(), S.size(80), S.costume('Carta 1'), S.setv(e, 0), S.wait(0.3)]
                .concat([1, 2, 3, 4].map((k) => S.iff(S.eq(S.v('barajar'), k), [S.setv(f, PERM[k - 1][i])]))),
              [S.click(), S.iff(S.and(S.eq(S.v('bloqueo'), 0), S.eq(S.v(e), 0)), [
                S.setv('bloqueo', 1), S.setv(e, 1), S.sound('Pop')]
                .concat([1, 2, 3, 4].map((k) => S.iff(S.eq(S.v(f), k), [S.costume('Carta ' + (k + 1))].concat(S.talk(NAMES[k - 1])))))
                .concat([S.ifelse(S.eq(S.v('abiertas'), 0),
                  [S.setv('abiertas', 1), S.setv('primera', S.v(f)), S.setv('bloqueo', 0)],
                  [S.ifelse(S.eq(S.v('primera'), S.v(f)),
                    [S.sound('Ta-chán'), S.chv('Parejas', 1), S.send('acierto'), S.wait(0.5), S.setv('abiertas', 0),
                      S.ifelse(S.eq(S.v('Parejas'), 4), [S.send('fin')], [S.setv('bloqueo', 0)])],
                    [S.wait(0.5), S.sound('Boing'), S.send('cerrar'), S.wait(0.4), S.setv('abiertas', 0), S.setv('bloqueo', 0)])])]))],
              [S.recv('acierto'), S.iff(S.eq(S.v(e), 1), [S.setv(e, 2), S.size(95), S.wait(0.15), S.size(80), S.wait(0.15), S.size(95), S.wait(0.15), S.size(80)])],
              [S.recv('cerrar'), S.iff(S.eq(S.v(e), 1), [S.setv(e, 0), S.costume('Carta 1')])]
            ]
          };
        };
        const vars = [['Parejas', 0, true], ['bloqueo', 1, false], ['abiertas', 0, false], ['primera', 0, false], ['barajar', 1, false]];
        for (let i = 1; i <= 8; i++) { vars.push(['e' + i, 0, false]); vars.push(['f' + i, 0, false]); }
        return make({
          backdrops: ['laurisilva'], messages: ['acierto', 'cerrar', 'fin'], vars,
          stage: [[F(), S.backdrop('laurisilva')]],
          sprites: [
            {
              id: 'lucia', name: 'Lucía', x: -195, y: -150, size: 42, sounds: ['Pop'], scripts: [
                [F(), S.voice('KITTEN'), S.show(), S.xy(-195, -150), S.setv('bloqueo', 1), S.setv('abiertas', 0), S.setv('Parejas', 0), S.setv('barajar', S.rnd(1, 4)), S.wait(0.6)]
                  .concat(S.talk('Encuentra las parejas. Toca una carta y luego otra. Si son iguales, ¡pareja!'), [S.setv('bloqueo', 0)]),
                [S.recv('acierto'), S.voice('KITTEN'), S.wait(0.2), S.iff(S.lt(S.v('Parejas'), 4), S.talk('¡Pareja!'))],
                [S.recv('fin'), S.voice('KITTEN'), S.hide()].concat(S.talk('¡Muy bien! Has encontrado las cuatro parejas.'), [S.wait(1), S.stopAll()])
              ]
            }
          ].concat([0, 1, 2, 3, 4, 5, 6, 7].map(carta)).concat([{
            id: 'bravo', x: 0, y: 50, size: 40, hidden: true, sounds: ['Magia'], scripts: [
              [F(), S.hide(), S.size(40)],
              [S.recv('fin'), S.size(40), S.xy(0, 40), S.show(), S.sound('Magia'), S.rep(7, [S.grow(14), S.wait(0.03)])]
            ]
          }])
        });
      }
    },

    /* ---------- juego de ritmo con el robot ---------- */
    {
      id: 'ritmo-robot', title: 'El baile del robot: ¡sigue el ritmo!', kind: 'juego', stars: 2, bg: 'ritmo', sprite: 'flecha',
      desc: 'Las flechas bajan al compás del tambor. Pulsa la misma flecha (o tócala) cuando llegue al círculo y haz bailar al robot.',
      challenge: 'Mira de qué color es la flecha que baja y pulsa esa flecha del teclado, del mando en pantalla o toca la propia flecha cuando esté en el círculo.',
      openSprite: 'Robot',
      build() {
        const KEYS = ['left arrow', 'up arrow', 'down arrow', 'right arrow'];
        const XS = [-80, 0, 80, 160];
        const NAMES = ['izquierda', 'arriba', 'abajo', 'derecha'];
        const yy = () => mk('motion_yposition');
        const zona = () => S.and(S.gt(yy(), -150), S.lt(yy(), -70));
        const lane = (k) => {
          const a = 'activo' + (k + 1), x = XS[k];
          const acierto = () => [S.setv(a, 0), S.hide(), S.chv('Puntos', 1), S.sound('Pop'), S.send('baila'), S.goto(x, 190)];
          return {
            id: 'flecha', name: 'Flecha ' + NAMES[k], x, y: 190, size: 55, hidden: true, sounds: ['Pop'], scripts: [
              [F(), S.hide(), S.setv(a, 0), S.costume('Flecha ' + (k + 1)), S.size(55), S.xy(x, 190), S.forever([
                S.iff(S.eq(S.v(a), 1), [
                  S.dy(-5),
                  S.iff(S.and(S.keyp(KEYS[k]), zona()), acierto()),
                  S.iff(S.lt(yy(), -165), [S.setv(a, 0), S.hide(), S.goto(x, 190)])
                ])
              ])],
              [S.recv('flecha'), S.iff(S.and(S.eq(S.v('carril'), k + 1), S.eq(S.v(a), 0)), [S.goto(x, 190), S.show(), S.setv(a, 1)])],
              [S.click(), S.iff(S.and(S.eq(S.v(a), 1), zona()), acierto())]
            ]
          };
        };
        return make({
          backdrops: ['ritmo'], messages: ['flecha', 'baila', 'fin'],
          vars: [['Puntos', 0, true], ['carril', 0, false], ['activo1', 0, false], ['activo2', 0, false], ['activo3', 0, false], ['activo4', 0, false]],
          stage: [[F(), S.backdrop('ritmo')]],
          sprites: [
            {
              id: 'robot', x: -185, y: -20, size: 80, sounds: ['Pop', 'Tambor', 'Ta-chán'], scripts: [
                [F(), S.voice('TENOR'), S.show(), S.xy(-185, -20), S.costume('Robot 1'), S.setv('Puntos', 0), S.setv('carril', 0), S.wait(0.5)]
                  .concat(S.talk('¡Hola! Soy el robot bailarín. Cuando una flecha llegue al círculo, pulsa esa misma flecha. ¡A bailar!'), [
                    S.wait(0.5),
                    S.rep(36, [S.setv('carril', S.rnd(1, 4)), S.send('flecha'), S.sound('Tambor'), S.wait(0.5)]),
                    S.wait(2.5), S.send('fin')]),
                [S.recv('baila'), S.next(), S.rep(2, [S.goto(-185, -4), S.wait(0.08), S.goto(-185, -20), S.wait(0.08)])],
                [S.recv('fin'), S.voice('TENOR'), S.costume('Robot 2'), S.sound('Ta-chán'),
                  S.ifelse(S.gt(S.v('Puntos'), 23),
                    [R('text2speech_speakAndWait', { WORDS: S.join('¡Increíble! ¡Eres un campeón del ritmo! Has acertado ', S.join(S.v('Puntos'), ' flechas.')) })],
                    [S.ifelse(S.gt(S.v('Puntos'), 11),
                      [R('text2speech_speakAndWait', { WORDS: S.join('¡Qué bien bailas! Has acertado ', S.join(S.v('Puntos'), ' flechas.')) })],
                      [R('text2speech_speakAndWait', { WORDS: S.join('¡Buen intento! Has acertado ', S.join(S.v('Puntos'), ' flechas. Pulsa la bandera y vuelve a bailar, cada vez sale mejor.')) })])]),
                  S.wait(1), S.stopAll()],
                [S.click(), S.sound('Pop'), S.next()]
              ]
            },
            lane(0), lane(1), lane(2), lane(3),
            {
              id: 'bravo', x: 160, y: 20, size: 30, hidden: true, sounds: ['Magia'], scripts: [
                [F(), S.hide(), S.size(30)],
                [S.recv('fin'), S.iff(S.gt(S.v('Puntos'), 11), [S.size(30), S.xy(110, 20), S.show(), S.sound('Magia'), S.rep(8, [S.grow(10), S.wait(0.03)])])]
              ]
            }
          ]
        });
      }
    }

  ];
})(typeof window !== 'undefined' ? window : globalThis);
