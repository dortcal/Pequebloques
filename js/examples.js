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
    backdrop: (n) => mk('looks_switchbackdropto', { BACKDROP: n }),
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
    talk: (t) => [mk('text2speech_speakAndWait', { WORDS: t })]
  };
  const script = (x, y, blocks) => ({ x, y, blocks });

  /* sprites: [{id, x, y, size, dir, hidden, sounds, scripts: []}] — backdrops: ['playa', ...] */
  function make(o) {
    const p = PQ.newProject();
    (o.backdrops || ['blanco']).forEach((b) => p.stage.costumes.push(PQ.makeBackdrop(b)));
    p.messages = o.messages && o.messages.length ? o.messages.slice() : ['mensaje1'];
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
              [F(), S.backdrop('Playa'), S.xy(-170, -50), S.sayFor('¡Hola! Soy un canario.', 2),
                S.sayFor('Hoy voy a volar hasta el Teide.', 2),
                S.rep(10, [S.move(10), S.next(), S.wait(0.1)]), S.send('teide')],
              [S.recv('teide'), S.backdrop('Teide'), S.xy(-150, -60), S.sound('Ta-chán'),
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
              id: 'lucia', name: 'Lucía', x: -170, y: -60, size: 80, scripts: [
                [F(), S.voice('ALTO'), S.xy(-170, -60)].concat(L('Hoy hay una carrera en el campo.'), [S.send('lagarto')]),
                [S.recv('fin'), S.voice('ALTO')].concat(L('Y así terminó la carrera. ¡Qué divertido!')),
                [S.click(), S.voice('ALTO')].concat(L('Hoy hay una carrera en el campo.'))
              ]
            },
            {
              id: 'lagarto', x: -140, y: -120, size: 85, scripts: [
                [F(), S.xy(-140, -120), S.voice('SQUEAK')],
                [S.recv('lagarto'), S.voice('SQUEAK')].concat(L('¡Yo soy el más rápido de toda la isla!'), [S.send('tortuga')]),
                [S.recv('carrera'), S.rep(12, [S.dx(18), S.next(), S.wait(0.1)]), S.voice('SQUEAK')].concat(L('¡He ganado! ¡He ganado!')),
                [S.click(), S.voice('SQUEAK')].concat(L('¡Yo soy el más rápido de toda la isla!'))
              ]
            },
            {
              id: 'tortuga', x: -140, y: -40, size: 85, scripts: [
                [F(), S.xy(-140, -40), S.voice('GIANT')],
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
                [F(), S.voice('ALTO'), S.xy(-60, -70)],
                [S.recv('yeray'), S.voice('ALTO')].concat(L('¡Qué grande es! ¿Será simpática?'), [S.send('ballena')]),
                [S.recv('final'), S.voice('ALTO'), S.rep(3, [S.dy(12), S.wait(0.1), S.dy(-12), S.wait(0.1)])].concat(L('¡Qué día más bonito!')),
                [S.click(), S.voice('ALTO')].concat(L('¡Qué grande es! ¿Será simpática?'))
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
          backdrops: ['noche'], messages: ['estrella', 'cohete', 'viaje'],
          sprites: [
            {
              id: 'robot', x: -150, y: -80, scripts: [
                [F(), S.voice('TENOR'), S.xy(-150, -80)].concat(L('Soy un robot y nunca he viajado al espacio.'), [S.send('estrella')]),
                [S.recv('viaje'), S.voice('TENOR'), S.xy(-30, -80)].concat(L('¡Estoy dentro del cohete! ¡Qué emoción!')),
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
                [F(), S.xy(60, -90), S.voice('SQUEAK')],
                [S.recv('cohete'), S.voice('SQUEAK')].concat(L('¡Tres, dos, uno, despegue!'), [S.send('viaje'), S.sound('Bocina'), S.rep(20, [S.dy(10), S.wait(0.05)]), S.hide()]),
                [S.click(), S.voice('SQUEAK')].concat(L('¡Tres, dos, uno, despegue!'))
              ]
            }
          ]
        });
      }
    }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
