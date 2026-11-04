/* PequeBloques — diseñado por David OZC
 * pc.js: cuentos con voz de «Pensamiento computacional» (Infantil y Primaria)
 * Centros de interés: reciclaje, energías limpias y universo.
 * Todo se maneja tocando la pantalla y se explica con voz: no hace falta saber leer.
 */
(function (g) {
  'use strict';
  const PQ = g.PQ;
  const { mk, R, S, F, make } = PQ.EXH;
  const LUC = 'KITTEN', YER = 'ALTO', ROB = 'TENOR';
  /* decir algo con una voz concreta (el bocadillo sale mientras suena) */
  const T = (voice, text) => [S.voice(voice)].concat(S.talk(text));
  const v = S.v;
  const flat = (a) => [].concat.apply([], a);
  /* cadena «si i = 1 … 2 …» */
  const chain = (varName, n, fn) => Array.from({ length: n }, (_, i) => S.iff(S.eq(v(varName), i + 1), fn(i + 1)));
  const and3 = (a, b, c) => S.and(a, S.and(b, c));
  const bravo = (x, y, size) => ({
    id: 'bravo', x: x || 0, y: y || 40, size: size || 40, hidden: true, sounds: ['Magia'], scripts: [
      [F(), S.hide(), S.size(size || 40)],
      [S.recv('fin'), S.size(size || 40), S.xy(x || 0, y || 40), S.show(), S.sound('Magia'), S.rep(7, [S.grow(14), S.wait(0.03)])]
    ]
  });

  const EX = [];

  /* ============================================================
   *  INFANTIL 1 · Los contenedores de colores (reciclaje)
   *  Pensamiento computacional: secuencia, clasificación, patrón y depuración
   * ============================================================ */
  EX.push({
    id: 'pc-reciclaje-infantil', pc: 'infantil', title: 'Los contenedores de colores', kind: 'cuento', voices: true, stars: 1, bg: 'playa', sprite: 'contenedor',
    desc: 'Lucía limpia la playa contigo. Sigue los pasos en orden, clasifica la basura, descubre el patrón y arregla un error. Con voz, sin leer.',
    challenge: 'Escucha a Lucía y toca lo que te pida. Primero el residuo y después su contenedor.',
    openSprite: 'Lucía',
    build() {
      const BX = [-80, 30, 140], BY = -80;
      const TIPO_TXT = ['', '¡Muy bien! Los envases van al contenedor amarillo.', '¡Muy bien! El papel y el cartón van al contenedor azul.', '¡Muy bien! Los frascos de vidrio van al contenedor verde.'];
      const sortOn = () => S.or(S.or(S.eq(v('fase'), 1), S.eq(v('fase'), 2)), S.eq(v('fase'), 4));
      /* residuos: [id, nombre, costume, tipo, x ronda 2] */
      const ITEMS = [
        { k: 1, name: 'Lata', cost: 1, tipo: 1, x: -160, say: 'Una lata' },
        { k: 2, name: 'Periódico', cost: 3, tipo: 2, x: -80, say: 'Un periódico' },
        { k: 3, name: 'Tarro', cost: 5, tipo: 3, x: 0, say: 'Un tarro de cristal' },
        { k: 4, name: 'Caja', cost: 4, tipo: 2, x: 80, say: 'Una caja de cartón' },
        { k: 5, name: 'Brik', cost: 2, tipo: 1, x: 160, say: 'Un brik' }
      ];
      const select = (it, sayText) => [
        S.send('quita'), S.setv('sel', it.tipo), S.setv('selk', it.k), S.size(72), S.sound('Pop')
      ].concat(T('ALTO', sayText));
      const itemSprite = (it) => {
        const place4 = { 1: { x: BX[1], y: -5, bien: false }, 5: { x: BX[0], y: -5, bien: true }, 3: { x: BX[2], y: -5, bien: true } }[it.k];
        const clickBody = place4
          ? [S.ifelse(S.and(S.eq(v('fase'), 4), place4.bien ? S.eq(1, 1) : S.eq(1, 2)),
            T('ALTO', 'Ese está bien puesto.'),
            [S.iff(sortOn(), select(it, it.say))])]
          : [S.iff(sortOn(), select(it, it.say))];
        return {
          id: 'residuo', name: it.name, x: it.x, y: 70, size: 56, hidden: true, sounds: ['Pop', 'Boing'], scripts: [
            [F(), S.hide(), S.size(56), S.costume('Residuo ' + it.cost)],
            [S.recv('ronda2'), S.xy(it.x, 70), S.size(56), S.show()],
            place4 ? [S.recv('ronda4'), S.xy(place4.x, place4.y), S.size(50), S.show()] : [S.recv('ronda4'), S.hide()],
            [S.click(), S.iff(S.eq(v('bloqueo'), 0), clickBody)],
            [S.recv('quita'), S.size(56)],
            [S.recv('bien'), S.iff(S.eq(v('selk'), it.k), [
              S.setv('selk', 0),
              S.iff(S.eq(v('sel'), 1), [S.glide(0.5, BX[0], BY + 40)]),
              S.iff(S.eq(v('sel'), 2), [S.glide(0.5, BX[1], BY + 40)]),
              S.iff(S.eq(v('sel'), 3), [S.glide(0.5, BX[2], BY + 40)]),
              S.setv('sel', 0), S.hide(), S.chv('restan', -1)])],
            [S.recv('mal'), S.iff(S.eq(v('selk'), it.k), [
              S.setv('selk', 0), S.setv('sel', 0), S.sound('Boing'), S.rep(2, [S.dx(10), S.wait(0.05), S.dx(-10), S.wait(0.05)]), S.size(56)])]
          ]
        };
      };
      const bin = (t, nombre) => ({
        id: 'contenedor', name: 'Contenedor ' + nombre, x: BX[t - 1], y: BY, size: 72, sounds: ['Pop', 'Ta-chán', 'Boing'], scripts: [
          [F(), S.show(), S.size(72), S.costume('Contenedor ' + t)],
          [S.recv('b' + t), S.rep(2, [S.grow(14), S.wait(0.08), S.grow(-14), S.wait(0.08)])],
          [S.click(), S.iff(S.eq(v('bloqueo'), 0), [
            S.iff(sortOn(), [S.setv('bloqueo', 1),
              S.ifelse(S.eq(v('sel'), 0),
                [S.send('hint1')],
                [S.ifelse(S.eq(v('sel'), t),
                  [S.sound('Ta-chán'), S.send('bien'), S.send('eok' + t)],
                  [S.send('mal'), S.send('emal')]
                )]),
              S.wait(0.4), S.setv('bloqueo', 0)]),
            S.iff(S.eq(v('fase'), 3), [S.setv('bloqueo', 1), S.sound('Pop'),
              S.ifelse(S.eq(v('resp'), t),
                [S.sound('Ta-chán'), S.send('patron_ok'), S.send('pok'), S.setv('hecho', 1)],
                [S.send('pmal')]),
              S.wait(0.4), S.setv('bloqueo', 0)])
          ])],
          [S.recv('eok' + t)].concat(T('ALTO', TIPO_TXT[t]))
        ].concat(t === 1 ? [
          [S.recv('hint1')].concat(T('ALTO', 'Primero toca un residuo.')),
          [S.recv('emal')].concat(T('ALTO', 'Ese no es. Mira de qué es y prueba con otro contenedor.')),
          [S.recv('pok')].concat(T('ALTO', '¡Sí! Ese va ahora.')),
          [S.recv('pmal')].concat(T('ALTO', 'Casi. Mira la fila otra vez. ¿Qué viene ahora?'))
        ] : [])
      });
      /* fila del patrón: 6 posiciones */
      const PX = [-138, -83, -28, 27, 82, 137];
      const patSprite = (k) => ({
        id: 'contenedor', name: 'Patrón ' + k, x: PX[k - 1], y: 55, size: 38, hidden: true, sounds: ['Pop'], scripts: [
          [F(), S.hide(), S.size(38)],
          [S.recv('patA'), k <= 4 ? S.costume('Contenedor ' + [1, 2, 1, 2][k - 1]) : S.hide()].concat(k <= 4 ? [S.xy(PX[k - 1], 55), S.show()] : []),
          [S.recv('patB'), k <= 5 ? S.costume('Contenedor ' + [1, 2, 3, 1, 2][k - 1]) : S.hide()].concat(k <= 5 ? [S.xy(PX[k - 1], 55), S.show()] : []),
          [S.recv('patron_ok'), S.iff(S.eq(v('ultpos'), k), [S.costume('Contenedor ' + 0), S.show()])],
          [S.recv('patfin'), S.hide()]
        ]
      });
      /* arreglamos los costumes de la respuesta con cadenas */
      const patOk = (k) => [S.recv('patron_ok'), S.iff(S.eq(v('ultpos'), k), [].concat(chain('resp', 3, (n) => [S.costume('Contenedor ' + n)]), [S.xy(PX[k - 1], 55), S.show()]))];

      const sprites = [
        {
          id: 'lucia', name: 'Lucía', x: -205, y: -100, size: 52, sounds: ['Pop'], scripts: [
            [F(), S.show(), S.xy(-205, -100), S.setv('fase', 0), S.setv('sel', 0), S.setv('selk', 0), S.setv('restan', 0), S.setv('bloqueo', 1), S.setv('resp', 0), S.setv('hecho', 0), S.wait(0.6)]
              .concat(T(LUC, '¡Hola! Soy Lucía. Hoy vamos a limpiar la playa. ¡Vamos a reciclar!'),
                T(LUC, 'Reciclar es separar la basura en contenedores de colores.'),
                [S.send('b1')], T(LUC, 'El contenedor amarillo es para los envases.'),
                [S.send('b2')], T(LUC, 'El azul es para el papel y el cartón.'),
                [S.send('b3')], T(LUC, 'Y el verde es para el vidrio.'),
                [S.setv('fase', 1), S.setv('restan', 1), S.send('ronda1'), S.setv('bloqueo', 0)],
                T(LUC, 'Mira, una botella de plástico. Primero, toca la botella.'),
                [S.waitUntil(S.gt(v('sel'), 0))],
                T(LUC, 'Ahora, toca el contenedor amarillo.'),
                [S.waitUntil(S.eq(v('restan'), 0)), S.wait(2.6)],
                T(LUC, '¡Lo has hecho! Primero tocamos el residuo, después el contenedor. Pasos en orden: eso se llama secuencia.'),
                [S.setv('fase', 2), S.setv('restan', 5), S.send('ronda2')],
                T(LUC, 'Ahora hay más residuos. Toca uno y llévalo a su contenedor.'),
                [S.waitUntil(S.eq(v('restan'), 0)), S.wait(2.6)],
                T(LUC, '¡Qué bien clasificas! Clasificar es juntar las cosas que son iguales.'),
                /* patrón A */
                [S.setv('fase', 3), S.setv('hecho', 0), S.setv('resp', 1), S.setv('ultpos', 5), S.send('patA')],
                T(LUC, 'Mira esta fila de contenedores. Amarillo, azul, amarillo, azul. Se repite. ¿Cuál va ahora? Toca el contenedor.'),
                [S.waitUntil(S.eq(v('hecho'), 1)), S.wait(2)],
                T(LUC, 'Amarillo, azul, amarillo, azul, amarillo. Eso es un patrón: algo que se repite.'),
                /* patrón B */
                [S.setv('hecho', 0), S.setv('resp', 3), S.setv('ultpos', 6), S.send('patfin'), S.wait(0.3), S.send('patB')],
                T(LUC, 'Otro patrón. Amarillo, azul, verde, amarillo, azul. ¿Cuál sigue?'),
                [S.waitUntil(S.eq(v('hecho'), 1)), S.wait(2), S.send('patfin'), S.setv('fase', 4), S.setv('restan', 1)],
                [S.send('yeray_entra')],
                T(LUC, '¡Anda! Yeray se ha dado prisa y ha mezclado los residuos. Hay uno mal puesto. ¿Lo encuentras? Tócalo.'),
                [S.send('ronda4')],
                [S.waitUntil(S.eq(v('restan'), 0)), S.wait(2.6)],
                T(LUC, '¡Lo has arreglado! Cuando algo falla, buscamos el error y lo corregimos. Eso se llama depurar.'),
                T(LUC, 'Hoy has seguido pasos, clasificado, descubierto un patrón y arreglado un error. ¡Piensas como un programador!'),
                [S.send('fin'), S.wait(1.5), S.stopAll()])
          ]
        },
        {
          id: 'yeray', name: 'Yeray', x: 215, y: -100, size: 52, hidden: true, sounds: ['Pop'], scripts: [
            [F(), S.hide()],
            [S.recv('yeray_entra'), S.xy(215, -100), S.show()].concat(T(YER, '¡Uy! ¡Con las prisas lo he mezclado todo!'))
          ]
        },
        {
          id: 'botella', name: 'Botella', x: 0, y: 55, size: 62, hidden: true, sounds: ['Pop'], scripts: [
            [F(), S.hide(), S.size(62)],
            [S.recv('ronda1'), S.xy(0, 55), S.size(62), S.show()],
            [S.click(), S.iff(S.and(S.eq(v('bloqueo'), 0), S.eq(v('fase'), 1)), [S.send('quita'), S.setv('sel', 1), S.setv('selk', 9), S.size(78), S.sound('Pop')].concat(T('ALTO', 'Una botella de plástico')))],
            [S.recv('quita'), S.size(62)],
            [S.recv('bien'), S.iff(S.eq(v('selk'), 9), [S.setv('selk', 0), S.glide(0.5, BX[0], BY + 40), S.setv('sel', 0), S.hide(), S.chv('restan', -1)])],
            [S.recv('mal'), S.iff(S.eq(v('selk'), 9), [S.setv('selk', 0), S.setv('sel', 0), S.sound('Pop'), S.size(62)])]
          ]
        },
        bin(1, 'amarillo'), bin(2, 'azul'), bin(3, 'verde')
      ].concat(ITEMS.map(itemSprite)).concat([1, 2, 3, 4, 5, 6].map(patSprite)).concat([{
        id: 'ranura', name: 'Hueco', x: 82, y: 55, size: 33, hidden: true, sounds: ['Pop'], scripts: [
          [F(), S.hide(), S.size(33), S.costume('Ranura 1')],
          [S.recv('patA'), S.xy(PX[4], 55), S.show()],
          [S.recv('patB'), S.xy(PX[5], 55), S.show()],
          [S.recv('patron_ok'), S.hide()],
          [S.recv('patfin'), S.hide()]
        ]
      }, bravo(0, 55, 40)]);
      /* sustituye la respuesta del patrón por el contenedor correcto */
      sprites.forEach((s) => { const m = /^Patrón (\d)$/.exec(s.name || ''); if (m) { const k = +m[1]; s.scripts[3] = patOk(k); } });
      return make({
        backdrops: ['playa'], messages: ['ronda1', 'ronda2', 'ronda4', 'quita', 'bien', 'mal', 'b1', 'b2', 'b3', 'patA', 'patB', 'patron_ok', 'patfin', 'yeray_entra', 'eok1', 'eok2', 'eok3', 'hint1', 'emal', 'pok', 'pmal', 'fin'],
        vars: [['fase', 0, false], ['sel', 0, false], ['selk', 0, false], ['restan', 0, false], ['bloqueo', 1, false], ['resp', 0, false], ['hecho', 0, false], ['ultpos', 0, false]],
        stage: [[F(), S.backdrop('playa')]], sprites
      });
    }
  });


  /* ============================================================
   *  INFANTIL 2 · La casa de Yeray (energías limpias)
   *  Pensamiento computacional: secuencia, condicional, bucle y depuración
   * ============================================================ */
  EX.push({
    id: 'pc-energia-infantil', pc: 'infantil', title: 'La casa de Yeray y la energía limpia', kind: 'cuento', voices: true, stars: 1, bg: 'pc-casa-energia', sprite: 'panel',
    desc: 'La casa de Yeray está a oscuras. Con el sol y el viento, ayuda a encender la luz: pasos en orden, «si pasa esto, hago aquello», repetir y arreglar un fallo.',
    challenge: 'Escucha a Lucía y toca lo que te pida: el sol, el viento, el panel, el cable y la bombilla.',
    openSprite: 'Lucía',
    build() {
      const f = (n) => S.eq(v('fase'), n);
      const place = (x, y, sz) => [S.xy(x, y), S.size(sz), S.show()];
      /* un elemento de la escena con su posición en cada fase */
      const el = (o) => ({
        id: o.id, name: o.name, x: 0, y: 0, size: 60, hidden: true, sounds: ['Pop', 'Ta-chán', 'Boing', 'Magia'], scripts: [
          [F(), S.hide()].concat(o.init || []),
          [S.recv('fase1')].concat(o.f1 ? place.apply(null, o.f1) : [S.hide()]),
          [S.recv('fase2')].concat(o.f2 ? place.apply(null, o.f2) : [S.hide()]),
          [S.recv('fase3')].concat(o.f3 ? place.apply(null, o.f3) : [S.hide()]),
          [S.recv('fase4')].concat(o.f4 ? place.apply(null, o.f4) : [S.hide()]),
          [S.recv('fase5')].concat(o.f5 ? place.apply(null, o.f5) : [S.hide()])
        ].concat(o.extra || [])
      });
      /* clic en el paso k de la secuencia */
      const paso = (k, efecto) => S.iff(S.and(f(2), S.eq(v('bloqueo'), 0)), [S.setv('bloqueo', 1),
        S.ifelse(S.eq(v('paso'), k - 1),
          [S.setv('paso', k), S.send('p' + k), S.sound('Pop')].concat(efecto),
          [S.sound('Boing'), S.send('pista')]),
        S.wait(0.5), S.setv('bloqueo', 0)]);
      const luz = (o) => S.iff(S.and(f(4), S.eq(v('bloqueo'), 0)), o);
      const sprites = [
        {
          id: 'lucia', name: 'Lucía', x: -215, y: -115, size: 48, sounds: ['Pop', 'Magia', 'Ta-chán'], scripts: [
            [F(), S.show(), S.xy(-215, -115), S.setv('fase', 0), S.setv('bloqueo', 1), S.setv('paso', 0), S.setv('sol_ok', 0), S.setv('viento_ok', 0), S.setv('resp', 0), S.setv('hecho', 0), S.setv('vueltas', 0), S.setv('roto', 0), S.wait(0.6), S.send('fase1')]
              .concat(T(LUC, '¡Hola! Soy Lucía. Hoy ayudamos a Yeray.'), [S.send('yeray_hola')],
                T(LUC, 'No pasa nada, Yeray. Vamos a conseguir energía limpia. La energía limpia no ensucia el aire.'),
                T(LUC, 'Viene del sol, del viento y del agua. Toca el sol.'),
                [S.setv('fase', 1), S.setv('bloqueo', 0), S.waitUntil(S.eq(v('sol_ok'), 1)), S.wait(2.5)],
                T(LUC, 'Ahora toca el viento.'),
                [S.waitUntil(S.eq(v('viento_ok'), 1)), S.wait(2.5)],
                T(LUC, '¡Muy bien! Ya sabemos de dónde sale la energía. Ahora vamos a encender la luz.'),
                [S.setv('fase', 2), S.setv('paso', 0), S.send('fase2')],
                T(LUC, 'Hay que seguir cuatro pasos, y siempre en orden. Mira los números. Uno, el sol. Dos, el panel solar. Tres, el cable. Cuatro, la bombilla. Tócalos en orden.'),
                [S.waitUntil(S.eq(v('paso'), 4)), S.wait(1.2)],
                [S.send('luz'), S.sound('Magia')], T(YER, '¡Tengo luz! ¡Gracias!'),
                T(LUC, 'Has seguido una secuencia de cuatro pasos. Si cambias el orden, no funciona.'),
                /* condicional */
                [S.setv('fase', 3), S.send('fase3'), S.setv('hecho', 0)],
                T(LUC, 'Ahora hay que decidir. Si hace sol, usamos el panel solar. Si hay viento, usamos el aerogenerador. Eso se llama condicional: si pasa esto, hago aquello.'),
                [S.setv('resp', 1), S.setv('hecho', 0), S.send('ronda_sol')],
                T(LUC, 'Hoy hace sol. ¿Qué usamos? Tócalo.'),
                [S.waitUntil(S.eq(v('hecho'), 1)), S.wait(2.4), S.setv('resp', 2), S.setv('hecho', 0), S.send('ronda_viento')],
                T(LUC, 'Ahora sopla mucho viento. ¿Qué usamos?'),
                [S.waitUntil(S.eq(v('hecho'), 1)), S.wait(2.4)],
                /* bucle */
                [S.setv('fase', 5), S.setv('vueltas', 0), S.send('fase5')],
                T(LUC, 'Vamos a repetir una acción. Toca tres veces el aerogenerador y cuenta conmigo.'),
                [S.waitUntil(S.eq(v('vueltas'), 3)), S.wait(2)],
                T(LUC, 'Repetir algo varias veces se llama bucle.'),
                /* depurar */
                [S.setv('fase', 4), S.setv('hecho', 0), S.setv('roto', 1), S.send('fase4'), S.send('oscuro'), S.wait(0.8)],
                T(YER, '¡Oh, no! Se ha vuelto a apagar la luz.'),
                T(LUC, 'Algo está roto. Mira bien. ¿Qué es lo que falla? Tócalo.'),
                [S.setv('bloqueo', 0), S.waitUntil(S.eq(v('hecho'), 1)), S.wait(1.5)],
                T(LUC, 'Has encontrado el fallo y lo has arreglado. Eso se llama depurar.'),
                T(LUC, 'Hoy has seguido pasos en orden, decidido con un si, repetido con un bucle y arreglado un fallo. ¡Piensas como un programador!'),
                [S.send('fin'), S.wait(1.5), S.stopAll()]),
            [S.recv('pista')].concat(T(LUC, 'Todavía no. Mira los números y busca el siguiente.'))
          ]
        },
        {
          id: 'yeray', name: 'Yeray', x: -165, y: -115, size: 48, hidden: true, sounds: ['Pop'], scripts: [
            [F(), S.hide()],
            [S.recv('yeray_hola'), S.show()].concat(T(YER, '¡Hola! Mi casa está a oscuras. No tengo luz.'))
          ]
        },
        el({ id: 'casa', name: 'Casa', init: [S.costume('Casa 1')], f1: [0, -50, 95], f2: [160, -70, 105], f4: [160, -70, 105], f5: [150, -70, 100],
          extra: [[S.recv('luz'), S.costume('Casa 2')], [S.recv('oscuro'), S.costume('Casa 1')], [S.recv('p4'), S.wait(0.3)]] }),
        el({ id: 'sol', name: 'Sol', f1: [-150, 95, 55], f2: [-190, 100, 52], f4: [-190, 100, 52],
          extra: [
            [S.recv('ronda_sol'), S.xy(0, 92), S.size(70), S.show()],
            [S.recv('ronda_viento'), S.hide()],
            [S.click(), S.iff(S.and(f(1), S.eq(v('sol_ok'), 0)), [S.setv('sol_ok', 1), S.sound('Pop'), S.send('sol_on'), S.rep(3, [S.grow(12), S.wait(0.08), S.grow(-12), S.wait(0.08)])].concat(T(YER, 'El sol da luz y calor. Los paneles solares la recogen y hacen electricidad.'))),
              paso(1, [S.rep(3, [S.grow(12), S.wait(0.08), S.grow(-12), S.wait(0.08)])]),
              luz(T(YER, 'El sol funciona bien.'))]
          ] }),
        el({ id: 'viento', name: 'Viento', f1: [150, 95, 50],
          extra: [
            [S.recv('ronda_viento'), S.xy(0, 92), S.size(80), S.show()],
            [S.recv('ronda_sol'), S.hide()],
            [S.click(), S.iff(S.and(f(1), S.eq(v('viento_ok'), 0)), [S.setv('viento_ok', 1), S.sound('Pop'), S.send('gira')].concat(T(YER, 'El viento mueve el aerogenerador y también hace electricidad.')))]
          ] }),
        el({ id: 'panel', name: 'Panel solar', init: [S.costume('Panel solar 1')], f1: [-150, -60, 80], f2: [-130, -10, 75], f3: [-100, -60, 85], f4: [-130, -10, 75],
          extra: [
            [S.recv('sol_on'), S.costume('Panel solar 2')],
            [S.recv('fase3'), S.costume('Panel solar 1')],
            [S.recv('fase4'), S.costume('Panel solar 2')],
            [S.recv('p2'), S.costume('Panel solar 2')],
            [S.click(), S.iff(f(3), [S.iff(S.eq(v('bloqueo'), 0), [S.setv('bloqueo', 1), S.sound('Pop'),
              S.ifelse(S.eq(v('resp'), 1), [S.setv('hecho', 1), S.costume('Panel solar 2'), S.sound('Ta-chán'), S.send('okpanel')], [S.sound('Boing'), S.send('nopanel')]),
              S.wait(0.5), S.setv('bloqueo', 0)])]),
              paso(2, [S.costume('Panel solar 2'), S.rep(3, [S.grow(10), S.wait(0.08), S.grow(-10), S.wait(0.08)])]),
              luz(T(YER, 'El panel solar funciona bien.'))],
            [S.recv('okpanel')].concat(T(YER, '¡Sí! Con sol, el panel solar.')),
            [S.recv('nopanel')].concat(T(YER, 'Mmm. Con viento no. ¿Cuál mueve el viento?'))
          ] }),
        el({ id: 'molino', name: 'Aerogenerador', init: [S.costume('Aerogenerador 1')], f1: [150, -60, 100], f3: [100, -60, 85], f5: [0, -40, 120],
          extra: [
            [S.recv('gira'), S.rep(18, [S.next(), S.wait(0.07)])],
            [S.click(), S.iff(f(3), [S.iff(S.eq(v('bloqueo'), 0), [S.setv('bloqueo', 1), S.sound('Pop'),
              S.ifelse(S.eq(v('resp'), 2), [S.setv('hecho', 1), S.sound('Ta-chán'), S.rep(12, [S.next(), S.wait(0.06)]), S.send('okmolino')], [S.sound('Boing'), S.send('nomolino')]),
              S.wait(0.5), S.setv('bloqueo', 0)])]),
              S.iff(S.and(f(5), S.eq(v('bloqueo'), 0)), [S.setv('bloqueo', 1), S.chv('vueltas', 1), S.sound('Pop'), S.rep(10, [S.next(), S.wait(0.05)]),
                S.iff(S.eq(v('vueltas'), 1), T(YER, 'Uno')), S.iff(S.eq(v('vueltas'), 2), T(YER, 'Dos')), S.iff(S.eq(v('vueltas'), 3), T(YER, 'Tres')),
                S.setv('bloqueo', 0)])],
            [S.recv('okmolino')].concat(T(YER, '¡Sí! Con viento, el aerogenerador.')),
            [S.recv('nomolino')].concat(T(YER, 'Mmm. Con sol no. ¿Cuál recoge el sol?'))
          ] }),
        el({ id: 'cable', name: 'Cable', init: [S.costume('Cable 1')], f2: [-10, -95, 58], f4: [-10, -95, 58],
          extra: [
            [S.recv('fase2'), S.costume('Cable 1')],
            [S.recv('fase4'), S.costume('Cable 2')],
            [S.click(), paso(3, [S.rep(3, [S.grow(10), S.wait(0.08), S.grow(-10), S.wait(0.08)])]),
              luz([S.setv('bloqueo', 1),
                S.ifelse(S.eq(v('roto'), 1), [S.setv('roto', 0), S.costume('Cable 1'), S.sound('Ta-chán'), S.send('luz'), S.setv('hecho', 1)].concat(T(YER, '¡Eso era! El cable estaba roto. ¡Ya vuelve la luz!')),
                  T(YER, 'El cable ya está bien.')),
                S.setv('bloqueo', 0)])]
          ] }),
        el({ id: 'bombilla', name: 'Bombilla', init: [S.costume('Bombilla 1')], f2: [60, 12, 52], f4: [60, 12, 52],
          extra: [
            [S.recv('fase2'), S.costume('Bombilla 1')],
            [S.recv('fase4'), S.costume('Bombilla 1')],
            [S.recv('luz'), S.costume('Bombilla 2')],
            [S.recv('oscuro'), S.costume('Bombilla 1')],
            [S.click(), paso(4, [S.rep(3, [S.grow(10), S.wait(0.08), S.grow(-10), S.wait(0.08)])]),
              luz(T(YER, 'La bombilla no está rota. Mira el camino de la energía.'))]
          ] })
      ];
      /* los números 1-4 de la secuencia */
      const NP = [[-150, 135], [-85, 22], [32, -58], [108, 40]];
      NP.forEach((p, i) => sprites.push({
        id: 'numero', name: 'Número ' + (i + 1), x: p[0], y: p[1], size: 24, hidden: true, sounds: ['Pop'], scripts: [
          [F(), S.hide(), S.size(24), S.costume('Número ' + (i + 1))],
          [S.recv('fase2'), S.xy(p[0], p[1]), S.show()],
          [S.recv('p' + (i + 1)), S.hide()],
          [S.recv('fase3'), S.hide()]
        ]
      }));
      sprites.push(bravo(0, 50, 40));
      return make({
        backdrops: ['pc-casa-energia'],
        messages: ['fase1', 'fase2', 'fase3', 'fase4', 'fase5', 'p1', 'p2', 'p3', 'p4', 'pista', 'luz', 'oscuro', 'sol_on', 'gira', 'ronda_sol', 'ronda_viento', 'okpanel', 'nopanel', 'okmolino', 'nomolino', 'yeray_hola', 'fin'],
        vars: [['fase', 0, false], ['bloqueo', 1, false], ['paso', 0, false], ['sol_ok', 0, false], ['viento_ok', 0, false], ['resp', 0, false], ['hecho', 0, false], ['vueltas', 0, false], ['roto', 0, false]],
        stage: [[F(), S.backdrop('pc-casa-energia')]], sprites
      });
    }
  });

  /* ============================================================
   *  INFANTIL 3 · Lucía y Yeray miran las estrellas (universo)
   *  Pensamiento computacional: patrones, ordenar, cuenta atrás, seguir instrucciones
   * ============================================================ */
  EX.push({
    id: 'pc-universo-infantil', pc: 'infantil', title: 'Las estrellas de Lucía y Yeray', kind: 'cuento', voices: true, stars: 1, bg: 'pc-cielo-estrellas', sprite: 'estrellac',
    desc: 'Una noche de estrellas en Canarias: completa patrones de estrellas, ordena de pequeño a grande, haz la cuenta atrás y guía el cohete con flechas.',
    challenge: 'Escucha a Lucía y toca lo que te pida: estrellas, planetas, el cohete y las flechas.',
    openSprite: 'Lucía',
    build() {
      const PX = [-138, -83, -28, 27, 82, 137];
      const f = (n) => S.eq(v('fase'), n);
      const sprites = [];
      /* ----- patrones de estrellas ----- */
      const PAT = { A: [1, 2, 1, 2, 1], B: [1, 2, 2, 1, 2], C: [1, 3, 4, 1, 3] };
      const RESP = { A: 2, B: 2, C: 4 };
      for (let k = 1; k <= 6; k++) {
        const body = [[S.recv('patfin'), S.hide()], [F(), S.hide(), S.size(38)]];
        ['A', 'B', 'C'].forEach((r) => {
          const len = r === 'C' ? 5 : 5;
          if (k <= len) body.push([S.recv('pat' + r), S.costume('Estrella de color ' + PAT[r][k - 1]), S.xy(PX[k - 1], 62), S.size(40), S.show()]);
          else body.push([S.recv('pat' + r), S.hide()]);
        });
        body.push([S.recv('patok'), S.iff(S.eq(v('ultpos'), k), [].concat(chain('resp', 4, (n) => [S.costume('Estrella de color ' + n)]), [S.xy(PX[k - 1], 62), S.show()]))]);
        sprites.push({ id: 'estrellac', name: 'Estrella ' + k, x: PX[k - 1], y: 62, size: 40, hidden: true, sounds: ['Pop'], scripts: body });
      }
      sprites.push({
        id: 'ranura', name: 'Hueco', x: 82, y: 62, size: 36, hidden: true, sounds: ['Pop'], scripts: [
          [F(), S.hide(), S.size(36), S.costume('Ranura 1')],
          [S.recv('patA'), S.xy(PX[5], 62), S.show()], [S.recv('patB'), S.xy(PX[5], 62), S.show()], [S.recv('patC'), S.xy(PX[5], 62), S.show()],
          [S.recv('patok'), S.hide()], [S.recv('patfin'), S.hide()]
        ]
      });
      /* opciones de color (abajo) */
      const COLN = ['amarilla', 'azul', 'rosa', 'verde'];
      [1, 2, 3, 4].forEach((c) => sprites.push({
        id: 'estrellac', name: 'Opción ' + COLN[c - 1], x: -135 + (c - 1) * 90, y: -70, size: 55, hidden: true, sounds: ['Pop', 'Ta-chán', 'Boing'], scripts: [
          [F(), S.hide(), S.size(55), S.costume('Estrella de color ' + c)],
          [S.recv('opciones'), S.show()], [S.recv('patfin'), S.hide()],
          [S.click(), S.iff(S.and(f(1), S.eq(v('bloqueo'), 0)), [S.setv('bloqueo', 1), S.sound('Pop'), S.rep(2, [S.grow(12), S.wait(0.06), S.grow(-12), S.wait(0.06)]),
            S.ifelse(S.eq(v('resp'), c), [S.sound('Ta-chán'), S.send('patok'), S.send('pok'), S.setv('hecho', 1)], [S.sound('Boing'), S.send('pmal')]),
            S.wait(0.4), S.setv('bloqueo', 0)])]
        ]
      }));
      /* ----- planetas para ordenar ----- */
      const PL = [
        { name: 'Luna', cost: 2, size: 26, x: 130, y: 20, ord: 1 },
        { name: 'Tierra', cost: 1, size: 52, x: -130, y: 10, ord: 2 },
        { name: 'Sol grande', cost: 5, size: 92, x: 0, y: 0, ord: 3 }
      ];
      PL.forEach((pl) => sprites.push({
        id: 'planeta', name: pl.name, x: pl.x, y: pl.y, size: pl.size, hidden: true, sounds: ['Pop', 'Boing', 'Ta-chán'], scripts: [
          [F(), S.hide(), S.costume('Planeta ' + pl.cost), S.size(pl.size)],
          [S.recv('orden'), S.xy(pl.x, pl.y), S.size(pl.size), S.show()],
          [S.recv('ordenfin'), S.hide()],
          [S.click(), S.iff(S.and(f(2), S.eq(v('bloqueo'), 0)), [S.setv('bloqueo', 1),
            S.ifelse(S.eq(v('orden_n'), pl.ord - 1),
              [S.chv('orden_n', 1), S.sound('Ta-chán'), S.rep(3, [S.grow(8), S.wait(0.06), S.grow(-8), S.wait(0.06)]), S.send('o' + pl.ord)],
              [S.sound('Boing'), S.send('opista')]),
            S.wait(0.5), S.setv('bloqueo', 0)])]
        ].concat([[S.recv('o' + pl.ord)].concat(T(YER, ['Una pequeña: la Luna.', 'Ahora la Tierra, nuestro planeta.', 'Y la más grande: el Sol, que es una estrella.'][pl.ord - 1]))])
      }));
      /* ----- cohete, cuenta atrás y flechas ----- */
      const MV = { 1: [-45, 0], 2: [0, 45], 3: [0, -45], 4: [45, 0] };
      sprites.push({
        id: 'cohete', name: 'Cohete', x: -100, y: -60, size: 75, hidden: true, sounds: ['Pop', 'Ta-chán', 'Magia'], scripts: [
          [F(), S.hide(), S.costume('Cohete 1')],
          [S.recv('cohete1'), S.xy(0, -70), S.size(80), S.dir(90), S.costume('Cohete 1'), S.show()],
          [S.click(), S.iff(S.and(f(3), S.eq(v('bloqueo'), 0)), [S.setv('bloqueo', 1), S.chv('cuenta', -1), S.sound('Pop'), S.rep(2, [S.grow(10), S.wait(0.06), S.grow(-10), S.wait(0.06)]),
            S.iff(S.eq(v('cuenta'), 2), T(YER, 'Tres')), S.iff(S.eq(v('cuenta'), 1), T(YER, 'Dos')), S.iff(S.eq(v('cuenta'), 0), T(YER, 'Uno')),
            S.iff(S.eq(v('cuenta'), 0), [S.send('despega')]),
            S.setv('bloqueo', 0)])],
          [S.recv('despega'), S.costume('Cohete 2'), S.sound('Magia'), S.rep(14, [S.dy(14), S.grow(-2), S.wait(0.04)]), S.hide(), S.setv('hecho', 1)],
          [S.recv('cohete2'), S.xy(-120, -50), S.size(60), S.dir(90), S.costume('Cohete 2'), S.show()]
        ].concat([1, 2, 3, 4].map((c) => [S.recv('g' + c), S.sound('Pop'), S.rep(7, [S.dx(MV[c][0] / 7), S.dy(MV[c][1] / 7), S.wait(0.03)])]))
      });
      const ARR = [[1, 'izquierda'], [2, 'arriba'], [3, 'abajo'], [4, 'derecha']];
      ARR.forEach((a, i) => sprites.push({
        id: 'flecha', name: 'Flecha ' + a[1], x: -105 + i * 70, y: -130, size: 44, hidden: true, sounds: ['Pop', 'Boing'], scripts: [
          [F(), S.hide(), S.size(44), S.costume('Flecha ' + a[0])],
          [S.recv('flechas'), S.show()], [S.recv('flechasfin'), S.hide()],
          [S.click(), S.iff(S.and(f(4), S.eq(v('bloqueo'), 0)), [S.setv('bloqueo', 1), S.setv('okf', 0)]
            .concat([1, 2, 3, 4, 5].map((k) => S.iff(S.and(S.eq(v('pos'), k - 1), S.eq(v('q' + k), a[0])), [S.setv('okf', 1)])))
            .concat([S.ifelse(S.eq(v('okf'), 1),
              [S.chv('pos', 1), S.send('g' + a[0]), S.send('marca'), S.wait(0.5), S.iff(S.eq(v('pos'), v('largo')), [S.setv('hecho', 1)])],
              [S.sound('Boing'), S.send('fpista'), S.wait(0.3)]), S.setv('bloqueo', 0)]))]
        ]
      }));
      /* tarjetas del programa que hay que copiar (5 como máximo) */
      for (let k = 1; k <= 5; k++) sprites.push({
        id: 'ranura', name: 'Tarjeta ' + k, x: -110 + (k - 1) * 55, y: 135, size: 36, hidden: true, sounds: ['Pop'], scripts: [
          [F(), S.hide(), S.size(36), S.costume('Ranura 1')],
          [S.recv('programa')].concat([].concat(
            [S.ifelse(S.gt(v('largo'), k - 1), [S.show()].concat(chain('q' + k, 4, (n) => [S.costume('Ranura ' + (n + 1))])), [S.hide()])])),
          [S.recv('marca'), S.iff(S.eq(v('pos'), k), [S.size(26)])],
          [S.recv('programafin'), S.hide(), S.size(36)]
        ]
      });
      /* destino del cohete */
      sprites.push({
        id: 'planeta', name: 'Destino', x: 0, y: 0, size: 44, hidden: true, sounds: ['Pop'], scripts: [
          [F(), S.hide()],
          [S.recv('destino1'), S.costume('Planeta 2'), S.xy(-30, 40), S.size(44), S.show()],
          [S.recv('destino2'), S.costume('Planeta 3'), S.xy(-30, 85), S.size(48), S.show()],
          [S.recv('destinofin'), S.hide()]
        ]
      });
      /* personajes */
      sprites.push({
        id: 'lucia', name: 'Lucía', x: -205, y: -110, size: 48, sounds: ['Pop'], scripts: [
          [F(), S.show(), S.xy(-205, -110), S.setv('fase', 0), S.setv('bloqueo', 1), S.setv('hecho', 0), S.setv('resp', 0), S.setv('orden_n', 0), S.setv('cuenta', 3), S.setv('pos', 0), S.setv('largo', 0), S.wait(0.6)]
            .concat(T(LUC, '¡Hola! ¡Mira qué noche tan bonita! En Canarias se ven muchísimas estrellas.'),
              [S.send('yeray_hola')],
              T(LUC, 'Hay telescopios en el Teide y en La Palma para mirar el cielo. Hoy vamos a jugar con las estrellas.'),
              /* patrones */
              [S.setv('fase', 1), S.setv('hecho', 0), S.setv('resp', RESP.A), S.setv('ultpos', 6), S.send('patA'), S.send('opciones'), S.setv('bloqueo', 0)],
              T(LUC, 'Mira esta fila de estrellas. Amarilla, azul, amarilla, azul, amarilla. Se repite. ¿De qué color es la siguiente? Toca la estrella.'),
              [S.waitUntil(S.eq(v('hecho'), 1)), S.wait(2.2)],
              T(LUC, 'Esto es un patrón: algo que se repite una y otra vez.'),
              [S.setv('hecho', 0), S.setv('resp', RESP.B), S.send('patfin'), S.wait(0.3), S.send('patB'), S.send('opciones')],
              T(LUC, 'Otro patrón. ¿Qué estrella sigue?'),
              [S.waitUntil(S.eq(v('hecho'), 1)), S.wait(2.2)],
              [S.setv('hecho', 0), S.setv('resp', RESP.C), S.send('patfin'), S.wait(0.3), S.send('patC'), S.send('opciones')],
              T(LUC, 'Este es más difícil. Amarilla, rosa, verde, amarilla, rosa. ¿Cuál sigue?'),
              [S.waitUntil(S.eq(v('hecho'), 1)), S.wait(2.2), S.send('patfin')],
              /* ordenar */
              [S.setv('fase', 2), S.setv('orden_n', 0), S.send('orden')],
              T(LUC, 'Ahora vamos a ordenar. Toca primero el más pequeño, después el mediano y al final el más grande.'),
              [S.waitUntil(S.eq(v('orden_n'), 3)), S.wait(3)],
              T(LUC, 'Los has ordenado de menor a mayor. Para dar instrucciones también hay que ordenar bien las cosas.'),
              [S.send('ordenfin')],
              /* cuenta atrás */
              [S.setv('fase', 3), S.setv('cuenta', 3), S.setv('hecho', 0), S.send('cohete1')],
              T(LUC, '¡Un cohete! Para despegar hacemos una cuenta atrás: tres, dos, uno. Toca el cohete tres veces, cada vez que cuente.'),
              [S.waitUntil(S.eq(v('hecho'), 1)), S.wait(0.5)],
              T(YER, '¡Despegamos!'),
              T(LUC, 'Contar hacia atrás y repetir es un bucle. ¡Y ahora el cohete tiene que llegar a un planeta!'),
              /* seguir flechas: ronda 1 y 2 */
              [S.setv('fase', 4), S.setv('hecho', 0), S.setv('pos', 0), S.setv('largo', 4), S.setv('q1', 4), S.setv('q2', 4), S.setv('q3', 2), S.setv('q4', 2), S.send('cohete2'), S.send('destino1'), S.send('programa'), S.send('flechas'), S.setv('bloqueo', 0)],
              T(LUC, 'Mira las tarjetas de arriba. Dicen el camino: derecha, derecha, arriba, arriba. Toca las flechas de abajo en el mismo orden para que el cohete llegue a la Luna.'),
              [S.waitUntil(S.eq(v('hecho'), 1)), S.wait(1)],
              T(LUC, '¡Hemos llegado a la Luna! Seguir instrucciones en orden es programar.'),
              [S.send('programafin'), S.send('destinofin'), S.setv('hecho', 0), S.setv('pos', 0), S.setv('largo', 5), S.setv('q1', 2), S.setv('q2', 4), S.setv('q3', 2), S.setv('q4', 4), S.setv('q5', 2), S.send('cohete2'), S.send('destino2'), S.send('programa')],
              T(LUC, 'Ahora el camino es una escalera: arriba, derecha, arriba, derecha, arriba. ¡Tú puedes!'),
              [S.waitUntil(S.eq(v('hecho'), 1)), S.wait(1)],
              T(LUC, '¡Marte, el planeta rojo! Hoy has completado patrones, ordenado, repetido con un bucle y seguido instrucciones. ¡Piensas como un programador!'),
              [S.send('fin'), S.wait(1.5), S.stopAll()]),
          [S.recv('fpista')].concat(T(LUC, 'Esa no. Mira la tarjeta que toca ahora.')),
          [S.recv('pmal')].concat(T(LUC, 'Casi. Mira la fila y piensa qué viene ahora.')),
          [S.recv('opista')].concat(T(LUC, 'Mira el tamaño: busca el siguiente más pequeño.'))
        ]
      });
      sprites.push({
        id: 'yeray', name: 'Yeray', x: -160, y: -110, size: 48, hidden: true, sounds: ['Pop'], scripts: [
          [F(), S.hide()],
          [S.recv('yeray_hola'), S.show()].concat(T(YER, '¡Hola! ¡Yo quiero ser astronauta!'))
        ]
      });
      sprites.push(bravo(0, 40, 40));
      return make({
        backdrops: ['pc-cielo-estrellas'],
        messages: ['patA', 'patB', 'patC', 'patfin', 'patok', 'pok', 'pmal', 'opciones', 'orden', 'ordenfin', 'opista', 'o1', 'o2', 'o3', 'cohete1', 'cohete2', 'despega', 'g1', 'g2', 'g3', 'g4', 'flechas', 'flechasfin', 'fpista', 'marca', 'programa', 'programafin', 'destino1', 'destino2', 'destinofin', 'yeray_hola', 'fin'],
        vars: [['fase', 0, false], ['bloqueo', 1, false], ['hecho', 0, false], ['resp', 0, false], ['ultpos', 0, false], ['orden_n', 0, false], ['cuenta', 3, false], ['pos', 0, false], ['largo', 0, false], ['okf', 0, false], ['q1', 0, false], ['q2', 0, false], ['q3', 0, false], ['q4', 0, false], ['q5', 0, false]],
        stage: [[F(), S.backdrop('pc-cielo-estrellas')]], sprites
      });
    }
  });


  /* ============================================================
   *  FÁBRICA DEL «PROGRAMADOR DE TARJETAS» (Primaria)
   *  El alumnado toca flechas para armar un programa; el robot lo ejecuta en la cuadrícula.
   *  Tarjetas: 1 ←, 2 ↑, 3 ↓, 4 →, 5 repetir (hace el último movimiento 2 veces más).
   * ============================================================ */
  const cx = (c) => -202 + 56 * c, cy = (r) => 130 - 56 * r;
  const VOZ = { L: LUC, Y: YER, R: ROB };
  const say = (list) => flat(list.map((t) => T(VOZ[t[0]], t.slice(2))));
  const NSLOT = 10;
  function programmer(cfg) {
    const nL = cfg.levels.length;
    const maxObst = Math.max.apply(null, cfg.levels.map((l) => l.obst.length));
    const maxItems = Math.max.apply(null, cfg.levels.map((l) => l.items.length));
    const lvl = (k) => S.eq(v('nivel'), k);
    const sprites = [];
    /* --- robot --- */
    const mv = [].concat(
      [[1, S.dx, -14], [4, S.dx, 14], [2, S.dy, 14], [3, S.dy, -14]].map((m) => S.iff(S.eq(v('c'), m[0]), [S.rep(4, [m[1](m[2]), S.wait(0.05)])])),
      Array.from({ length: maxObst }, (_, i) => S.iff(S.touch(cfg.obst.name + ' ' + (i + 1)), [S.setv('fallo', 1)])),
      [S.iff(S.or(S.or(S.lt(S.xpos(), -215), S.gt(S.xpos(), 35)), S.or(S.gt(S.yy(), 145), S.lt(S.yy(), -110))), [S.setv('fallo', 2)])],
      [S.ifelse(S.eq(v('fallo'), 0), [S.send('coge'), S.wait(0.2)], [S.sound('Boing'), S.iff(S.eq(v('fallo'), 1), [S.send('choque')])])]);
    const goStart = cfg.levels.map((l, k) => S.iff(lvl(k + 1), [S.xy(cx(l.start[0]), cy(l.start[1]))]));
    sprites.push({
      id: cfg.robot.id, name: 'Robot', x: cx(0), y: cy(4), size: 38, hidden: true, sounds: ['Pop', 'Boing', 'Ta-chán'], scripts: [
        [F(), S.hide(), S.size(38), S.costume(cfg.robot.cost)],
        [S.recv('lay'), S.show()].concat(goStart),
        [S.recv('ir'), S.setv('modo', 1), S.setv('fallo', 0), S.setv('i', 0), S.setv('items', 0), S.setv('ult', 0), S.send('lay'), S.wait(0.4), S.sound('Pop'),
          S.rep(NSLOT, [S.iff(S.and(S.eq(v('fallo'), 0), S.lt(v('i'), v('n'))), [S.chv('i', 1), S.send('paso')]
            .concat(chain('i', NSLOT, (k) => [S.setv('c', v('p' + k))]),
              [S.ifelse(S.eq(v('c'), 5), [S.setv('c', v('ult')), S.rep(2, [S.iff(S.eq(v('fallo'), 0), mv)])], mv.concat([S.setv('ult', v('c'))]))]))]),
          S.send('refresca'), S.wait(0.3),
          S.ifelse(S.eq(v('fallo'), 0),
            [S.ifelse(S.touch('Meta'),
              [S.ifelse(S.eq(v('items'), v('tot')), [S.setv('hecho', 1), S.sound('Ta-chán'), S.rep(3, [S.grow(15), S.wait(0.08), S.grow(-15), S.wait(0.08)])],
                [S.send('faltan'), S.wait(1.4), S.send('lay'), S.setv('modo', 0)])],
              [S.send('corto'), S.wait(1.4), S.send('lay'), S.setv('modo', 0)])],
            [S.iff(S.eq(v('fallo'), 2), [S.send('salida')]), S.wait(1.4), S.send('lay'), S.setv('modo', 0)])]
      ]
    });
    /* --- objetos, obstáculos y meta --- */
    const pool = (name, spr, costFn, key, n, size) => Array.from({ length: n }, (_, i) => ({
      id: spr, name: name + ' ' + (i + 1), x: 0, y: 0, size, hidden: true, sounds: ['Pop'], scripts: [
        [F(), S.hide(), S.size(size)].concat(costFn ? [S.costume(costFn(i))] : []),
        [S.recv('lay'), S.hide()].concat(cfg.levels.map((l, k) => l[key][i] ? S.iff(lvl(k + 1), [S.xy(cx(l[key][i][0]), cy(l[key][i][1])), S.show()]) : S.iff(lvl(k + 1), [S.hide()])))
      ].concat(key === 'items' ? [[S.recv('coge'), S.iff(S.touch('Robot'), [S.hide(), S.chv('items', 1), S.sound('Pop')])]] : [])
    }));
    pool(cfg.item.name, cfg.item.id, (i) => cfg.item.cost(i), 'items', maxItems, 36).forEach((d) => sprites.push(d));
    pool(cfg.obst.name, cfg.obst.id, () => cfg.obst.cost, 'obst', maxObst, 38).forEach((d) => sprites.push(d));
    sprites.push({
      id: 'casilla', name: 'Meta', x: 0, y: 0, size: 48, hidden: true, sounds: ['Pop'], scripts: [
        [F(), S.hide(), S.size(48)],
        [S.recv('lay'), S.hide()].concat(cfg.levels.map((l, k) => S.iff(lvl(k + 1), [S.xy(cx(l.goal[0]), cy(l.goal[1])), S.show()])))
      ]
    });
    /* --- tarjetas en la barra inferior --- */
    for (let k = 1; k <= NSLOT; k++) sprites.push({
      id: 'ranura', name: 'Hueco ' + k, x: -207 + 46 * (k - 1), y: -152, size: 34, hidden: true, sounds: ['Pop'], scripts: [
        [F(), S.hide(), S.size(34)],
        [S.recv('refresca'), S.size(34), S.ifelse(S.gt(v('max'), k - 1),
          [S.show(), S.ifelse(S.gt(v('n'), k - 1), chain('p' + k, 5, (c) => [S.costume('Ranura ' + (c + 1))]).slice(0, 0).concat([1, 2, 3, 4, 5].map((c) => S.iff(S.eq(v('p' + k), c), [S.costume('Ranura ' + (c + 1))]))), [S.costume('Ranura 1')])],
          [S.hide()])],
        [S.recv('paso'), S.iff(S.eq(v('i'), k), [S.size(44)]), S.iff(S.gt(v('i'), k), [S.size(34)])]
      ]
    });
    /* --- botones de tarjetas y de control --- */
    const BTN = [[1, 'Flecha izquierda', 100, 96], [2, 'Flecha arriba', 146, 140], [3, 'Flecha abajo', 146, 52], [4, 'Flecha derecha', 192, 96]];
    BTN.forEach((b) => sprites.push({
      id: 'flecha', name: b[1], x: b[2], y: b[3], size: 46, sounds: ['Pop', 'Boing'], scripts: [
        [F(), S.show(), S.size(46), S.costume('Flecha ' + b[0])],
        [S.click(), S.iff(S.eq(v('modo'), 0), [S.ifelse(S.lt(v('n'), v('max')),
          [S.chv('n', 1)].concat(chain('n', NSLOT, (k) => [S.setv('p' + k, b[0])]), [S.send('refresca'), S.sound('Pop'), S.rep(2, [S.grow(10), S.wait(0.04), S.grow(-10), S.wait(0.04)])]),
          [S.sound('Boing'), S.send('lleno')])])]
      ]
    }));
    sprites.push({
      id: 'repite', name: 'Repetir', x: 146, y: 96, size: 46, sounds: ['Pop', 'Boing'], scripts: [
        [F(), S.show(), S.size(46)],
        [S.click(), S.iff(S.eq(v('modo'), 0), [S.ifelse(S.lt(v('n'), v('max')),
          [S.chv('n', 1)].concat(chain('n', NSLOT, (k) => [S.setv('p' + k, 5)]), [S.send('refresca'), S.sound('Pop'), S.rep(2, [S.grow(10), S.wait(0.04), S.grow(-10), S.wait(0.04)])]),
          [S.sound('Boing'), S.send('lleno')])])]
      ]
    });
    sprites.push({
      id: 'boton', name: 'Botón Ir', x: 100, y: 2, size: 46, sounds: ['Pop'], scripts: [
        [F(), S.show(), S.size(46), S.costume('Botón 1')],
        [S.click(), S.iff(S.eq(v('modo'), 0), [S.ifelse(S.gt(v('n'), 0), [S.send('ir')], [S.send('vacio')])])]
      ]
    });
    sprites.push({
      id: 'boton', name: 'Botón Quitar', x: 146, y: 2, size: 46, sounds: ['Pop'], scripts: [
        [F(), S.show(), S.size(46), S.costume('Botón 3')],
        [S.click(), S.iff(S.and(S.eq(v('modo'), 0), S.gt(v('n'), 0)), [S.chv('n', -1), S.send('refresca'), S.sound('Pop')])]
      ]
    });
    sprites.push({
      id: 'boton', name: 'Botón Borrar', x: 192, y: 2, size: 46, sounds: ['Pop'], scripts: [
        [F(), S.show(), S.size(46), S.costume('Botón 2')],
        [S.click(), S.iff(S.eq(v('modo'), 0), [S.setv('n', 0), S.send('refresca'), S.sound('Pop')])]
      ]
    });
    /* --- narradores --- */
    const levelBlocks = flat(cfg.levels.map((l, k) => {
      const setup = [S.setv('nivel', k + 1), S.setv('hecho', 0), S.setv('modo', 0), S.setv('max', l.cap), S.setv('tot', l.items.length), S.setv('n', l.preset ? l.preset.length : 0)]
        .concat((l.preset || []).map((c, j) => S.setv('p' + (j + 1), c)), [S.send('lay'), S.send('refresca')]);
      return [].concat(
        k === 0 ? [] : [S.setv('modo', 1)],
        setup, say(l.intro), [S.waitUntil(S.eq(v('hecho'), 1)), S.wait(1.2), S.send('bien')], say(l.win), [S.wait(0.5)]);
    }));
    sprites.push({
      id: 'lucia', name: 'Lucía', x: 108, y: -105, size: 34, sounds: ['Pop'], scripts: [
        [F(), S.show(), S.setv('nivel', 1), S.setv('modo', 1), S.setv('n', 0), S.setv('hecho', 0), S.setv('max', 10), S.setv('fallo', 0), S.setv('items', 0), S.setv('tot', 0), S.send('lay'), S.send('refresca'), S.wait(0.6)]
          .concat(say(cfg.intro), levelBlocks, say(cfg.outro), [S.send('fin'), S.wait(1.5), S.stopAll()]),
        [S.recv('choque')].concat(say([['L', '', cfg.texts.choque]])),
        [S.recv('salida')].concat(say([['L', '', cfg.texts.salida]])),
        [S.recv('corto')].concat(say([['L', '', cfg.texts.corto]])),
        [S.recv('faltan')].concat(say([['L', '', cfg.texts.faltan]])),
        [S.recv('lleno')].concat(say([['L', '', cfg.texts.lleno]])),
        [S.recv('vacio')].concat(say([['L', '', cfg.texts.vacio]]))
      ]
    });
    sprites.push({
      id: 'yeray', name: 'Yeray', x: 168, y: -105, size: 34, sounds: ['Pop'], scripts: [[F(), S.show()]]
    });
    sprites.push(bravo(-80, 30, 40));
    const vars = ['nivel', 'modo', 'n', 'max', 'tot', 'items', 'hecho', 'fallo', 'i', 'c', 'ult'].concat(Array.from({ length: NSLOT }, (_, k) => 'p' + (k + 1))).map((nm) => [nm, nm === 'modo' ? 1 : 0, false]);
    return {
      id: cfg.id, pc: 'primaria', title: cfg.title, kind: 'cuento', voices: true, stars: 2, bg: cfg.bg, sprite: cfg.thumb, desc: cfg.desc, challenge: cfg.challenge, openSprite: 'Lucía',
      build() {
        return make({ backdrops: [cfg.bgId], messages: ['lay', 'refresca', 'ir', 'paso', 'coge', 'choque', 'salida', 'corto', 'faltan', 'lleno', 'vacio', 'bien', 'fin'], vars, stage: [[F(), S.backdrop(cfg.bgId)]], sprites });
      }
    };
  }

  EX.push(programmer({
    id: 'pc-reciclaje-primaria', title: 'Misión limpiaplayas: programa al robot', bg: 'playa', bgId: 'pc-playa', thumb: 'robot',
    desc: 'Un robot limpia una playa de Tenerife. Programa su camino con tarjetas de flechas, arregla un programa con errores y úsalo con la tarjeta de repetir. Con voz, sin leer.',
    challenge: 'Toca las flechas para armar el programa y pulsa el botón verde para que el robot lo ejecute.',
    robot: { id: 'robot', cost: 'Robot 1' }, item: { id: 'residuo', name: 'Residuo', cost: (i) => 'Residuo ' + (i + 1) }, obst: { id: 'obstaculo', name: 'Roca', cost: 'Obstáculo 2' },
    texts: {
      choque: '¡Ay! El robot ha chocado con una roca. Pulsa el botón rojo para borrar y busca otro camino.',
      salida: 'El robot se ha salido del mapa. Quita las últimas tarjetas con el botón naranja.',
      corto: 'El robot no ha llegado a la meta. Mira tus tarjetas y busca qué falla.',
      faltan: 'El robot ha llegado a la meta, pero ha dejado basura en la playa. Tiene que pasar por todos los residuos.',
      lleno: 'No caben más tarjetas. ¿Se puede conseguir lo mismo con menos?',
      vacio: 'Primero pon alguna tarjeta. Toca las flechas de arriba.'
    },
    intro: [
      ['L', '', '¡Hola! Soy Lucía y él es Yeray. Hoy estamos en una playa de Tenerife y tenemos un problema. Hay basura en la arena.'],
      ['Y', '', 'Los residuos hacen daño a las tortugas, a los peces y a las aves. Hay que limpiar la playa.'],
      ['L', '', 'Hemos traído un robot limpiaplayas. Pero el robot no piensa: solo hace exactamente lo que le digamos, paso a paso.'],
      ['R', '', 'Hola. Soy el robot. Yo solo obedezco tarjetas.'],
      ['L', '', 'Una lista de instrucciones en orden se llama algoritmo. Programar es escribir un algoritmo para que una máquina lo ejecute.'],
      ['L', '', 'Mira las flechas de la derecha. Cada flecha es una tarjeta. Toca una y aparecerá abajo, en el programa. El robot las hará en orden, de izquierda a derecha.']
    ],
    levels: [
      {
        start: [0, 4], goal: [4, 4], items: [[2, 4]], obst: [[2, 1]], cap: 10, preset: null,
        intro: [['L', '', 'Primera misión. El robot está abajo, a la izquierda. Tiene que recoger la lata y llegar a la bandera amarilla. Cada flecha mueve al robot una casilla.'],
          ['Y', '', 'Cuenta las casillas con los dedos y toca las flechas necesarias. Cuando termines, pulsa el botón verde.']],
        win: [['R', '', '¡Misión cumplida! He recogido la lata.'], ['L', '', 'Has creado un programa que funciona. Has dividido el camino en pasos pequeños y los has puesto en orden. ¡Eso es descomponer!']]
      },
      {
        start: [0, 4], goal: [4, 2], items: [[2, 2]], obst: [[3, 4]], cap: 10, preset: [4, 4, 2, 2, 2, 2],
        intro: [['L', '', 'Segunda misión. Un compañero ha escrito el programa, pero tiene un error. Los errores en un programa se llaman bugs, y arreglarlos se llama depurar.'],
          ['Y', '', 'Pulsa el botón verde y observa con atención qué hace el robot. Tiene que recoger el residuo y parar en la bandera.'],
          ['L', '', 'Después, con el botón naranja quita las tarjetas que sobran y pon las correctas.']],
        win: [['R', '', '¡Arreglado!'], ['L', '', 'Has probado, has encontrado el error y lo has corregido. Los programadores lo hacen todos los días.']]
      },
      {
        start: [0, 4], goal: [4, 0], items: [[4, 4], [4, 2]], obst: [[2, 2]], cap: 6, preset: null,
        intro: [['L', '', 'Última misión. La playa es más grande y solo tenemos seis huecos para tarjetas. El robot tiene que recoger dos residuos y llegar arriba.'],
          ['Y', '', 'Fíjate en la tarjeta morada. Es la de repetir. Hace otra vez el último movimiento, dos veces más.'],
          ['L', '', 'Por ejemplo: flecha a la derecha y tarjeta de repetir, y el robot avanza tres casillas con solo dos tarjetas. Repetir en programación se llama bucle. ¡Pruébalo!']],
        win: [['R', '', '¡Playa limpia!'], ['L', '', 'Has resuelto el reto con menos tarjetas gracias al bucle. Un programa corto es más fácil de leer y de arreglar.']]
      }
    ],
    outro: [
      ['L', '', 'Hoy has aprendido que un algoritmo es una lista de pasos en orden, que se prueban y se depuran, y que los bucles ahorran trabajo.'],
      ['Y', '', 'Y la playa está limpia. Recuerda: lo que tiramos al suelo acaba en el mar. Los residuos van a su contenedor.'],
      ['L', '', '¡Buen trabajo, programadora y programador!']
    ]
  }));


  EX.push(programmer({
    id: 'pc-universo-primaria', title: 'Misión Marte: programa al rover', bg: 'espacio', bgId: 'pc-espacio', thumb: 'robot',
    desc: 'Un rover explora Marte para buscar hielo de agua. Divide el viaje en tramos, esquiva asteroides y ahorra tarjetas con un bucle. Con voz, sin leer.',
    challenge: 'Toca las flechas para armar el programa y pulsa el botón verde para que el rover lo ejecute.',
    robot: { id: 'robot', cost: 'Robot 1' }, item: { id: 'estrellac', name: 'Hielo', cost: () => 'Estrella de color 2' }, obst: { id: 'obstaculo', name: 'Asteroide', cost: 'Obstáculo 1' },
    texts: {
      choque: '¡Cuidado! El rover ha chocado con un asteroide. Pulsa el botón rojo y busca un camino que lo esquive.',
      salida: 'El rover se ha salido del mapa. Quita las últimas tarjetas con el botón naranja.',
      corto: 'El rover no ha llegado a la bandera. Revisa las tarjetas, paso a paso.',
      faltan: 'El rover ha llegado, pero le falta recoger muestras de hielo. Tiene que pasar por todos los cristales azules.',
      lleno: 'No caben más tarjetas. Piensa: ¿puedes usar la tarjeta de repetir?',
      vacio: 'Primero pon alguna tarjeta. Toca las flechas de arriba.'
    },
    intro: [
      ['L', '', '¡Bienvenidos al centro de control! Soy Lucía. Desde las islas Canarias, en el Teide y en La Palma, hay telescopios que observan el universo.'],
      ['Y', '', 'Yo soy Yeray, y hoy dirigimos una misión a Marte, el planeta rojo. Hemos enviado un rover, un robot explorador.'],
      ['L', '', 'Marte está a muchísimos millones de kilómetros. Las instrucciones tardan minutos en llegar, así que el rover no se puede manejar con un mando. Hay que enviarle el programa entero antes.'],
      ['R', '', 'Rover listo. Esperando el programa.'],
      ['L', '', 'Cada flecha mueve al rover una casilla. El rover hará las tarjetas de izquierda a derecha. Si el programa tiene un error, no podremos tocarlo hasta la siguiente prueba, así que hay que pensarlo bien antes de enviarlo.']
    ],
    levels: [
      {
        start: [0, 4], goal: [4, 2], items: [[4, 4]], obst: [], cap: 10, preset: null,
        intro: [['L', '', 'Primera misión: recoger hielo. En Marte hay agua congelada, y los científicos la buscan. El rover tiene que pasar por el cristal azul y después llegar a la bandera.'],
          ['Y', '', 'Para un viaje largo, un truco de los ingenieros es dividirlo en tramos. Primer tramo: llegar hasta el cristal. Segundo tramo: ir hasta la bandera. Programa un tramo cada vez y luego los unes.']],
        win: [['R', '', 'Muestra de hielo recogida.'], ['L', '', 'Has dividido un problema grande en dos problemas pequeños. Eso se llama descomponer y lo usan los ingenieros de las misiones espaciales.']]
      },
      {
        start: [0, 4], goal: [4, 0], items: [[2, 2]], obst: [[1, 4], [1, 3]], cap: 10, preset: null,
        intro: [['L', '', 'Segunda misión: un campo de asteroides. Los asteroides son rocas que flotan por el espacio. El rover no puede tocarlos.'],
          ['Y', '', 'Primero piensa el camino con el dedo sobre la pantalla. Después escribe el programa. Si el rover choca, pulsa borrar y prueba otro camino. Probar y corregir es parte de programar.']],
        win: [['R', '', 'Camino despejado. Asteroides esquivados.'], ['L', '', 'Has comprobado que tu programa evita los obstáculos. Eso es probar y depurar.']]
      },
      {
        start: [0, 4], goal: [4, 0], items: [[4, 4], [4, 1]], obst: [[2, 2]], cap: 6, preset: null,
        intro: [['L', '', 'Última misión. Enviar cada tarjeta cuesta energía, así que el programa solo puede tener seis tarjetas. El rover debe recoger dos cristales de hielo y llegar a la bandera.'],
          ['Y', '', 'Te ayudará la tarjeta morada: repite el último movimiento dos veces más. Recuerda, es un bucle. ¡A ver cuántos pasos consigues con solo seis tarjetas!']],
        win: [['R', '', 'Misión completada.'], ['L', '', 'Con un bucle has hecho que un programa corto haga mucho trabajo. Ahorrar tarjetas es ahorrar energía.']]
      }
    ],
    outro: [
      ['L', '', 'Has dirigido una misión a Marte. Has dividido el problema, esquivado obstáculos, probado y corregido, y usado un bucle para ahorrar tarjetas.'],
      ['Y', '', 'Quizá algún día alguien de Canarias dirija una misión de verdad. ¡Podrías ser tú!'],
      ['L', '', '¡Misión cumplida, equipo!']
    ]
  }));


  /* ============================================================
   *  PRIMARIA 2 · La isla de la energía limpia
   *  Pensamiento computacional: condicionales («si… entonces…»), variables, depuración y bucle de días
   * ============================================================ */
  EX.push({
    id: 'pc-energia-primaria', pc: 'primaria', title: 'La isla de la energía limpia', kind: 'cuento', voices: true, stars: 2, bg: 'pc-casa-energia', sprite: 'fuente',
    desc: 'Una isla quiere luz sin contaminar. Escribe reglas «si hace sol… si sopla el viento… si es de noche…» y comprueba una semana de tiempo. Arregla las reglas que fallan. Con voz, sin leer.',
    challenge: 'Toca las fuentes de energía para elegir qué usar con cada tiempo y pulsa el botón verde para probar los días.',
    openSprite: 'Lucía',
    build() {
      const SEQ = { 1: [1, 2, 1, 2], 2: [1, 3, 2, 3, 1, 2], 3: [2, 1, 3, 1, 2] };
      const TXT_OK = ['', 'Hace sol y el panel solar produce electricidad. ¡Hay luz!', 'Sopla el viento y el aerogenerador gira. ¡Hay luz!', 'Es de noche, pero la batería guarda la energía del día. ¡Hay luz!'];
      const TXT_MAL = ['', 'Hace sol, pero esa fuente no sirve ahora. La casa se queda a oscuras.', 'Sopla el viento, pero esa fuente no sirve ahora. La casa se queda a oscuras.', 'Es de noche y esa fuente no funciona sin sol. La casa se queda a oscuras.'];
      const RULE = ['', 'rs', 'rv', 'rn'];
      const f = (n) => S.eq(v('fase'), n);
      const sprites = [];
      const ROWY = [0, 85, 15, -55];
      const ICON = { 1: { id: 'sol', cost: 'Sol 1', size: 44 }, 2: { id: 'viento', cost: 'Viento 1', size: 44 }, 3: { id: 'planeta', cost: 'Planeta 2', size: 40 } };
      for (let k = 1; k <= 3; k++) {
        const vis = S.gt(v('fase'), k === 3 ? 1 : 0);
        sprites.push({
          id: ICON[k].id, name: 'Tiempo ' + k, x: -190, y: ROWY[k], size: ICON[k].size, hidden: true, sounds: ['Pop'], scripts: [
            [F(), S.hide(), S.costume(ICON[k].cost), S.size(ICON[k].size)],
            [S.recv('filas'), S.ifelse(vis, [S.show()], [S.hide()])]
          ]
        });
        sprites.push({
          id: 'flecha', name: 'Entonces ' + k, x: -128, y: ROWY[k], size: 30, hidden: true, sounds: ['Pop'], scripts: [
            [F(), S.hide(), S.costume('Flecha 4'), S.size(30)],
            [S.recv('filas'), S.ifelse(vis, [S.show()], [S.hide()])]
          ]
        });
        sprites.push({
          id: 'fuente', name: 'Fuente ' + k, x: -60, y: ROWY[k], size: 50, hidden: true, sounds: ['Pop', 'Boing'], scripts: [
            [F(), S.hide(), S.size(50), S.costume('Fuente de energía 1')],
            [S.recv('filas')].concat([S.ifelse(vis, [S.show()], [S.hide()])], chain(RULE[k], 3, (j) => [S.costume('Fuente de energía ' + j)])),
            [S.click(), S.iff(S.and(S.eq(v('modo'), 0), vis), [S.ifelse(S.eq(v(RULE[k]), 3), [S.setv(RULE[k], 1)], [S.chv(RULE[k], 1)]), S.sound('Pop'),
              S.rep(2, [S.grow(10), S.wait(0.04), S.grow(-10), S.wait(0.04)])].concat(chain(RULE[k], 3, (j) => [S.costume('Fuente de energía ' + j)])))]
          ]
        });
        sprites.push({
          id: ICON[k].id, name: 'Hoy ' + k, x: 150, y: 70, size: 70, hidden: true, sounds: ['Pop'], scripts: [
            [F(), S.hide(), S.costume(ICON[k].cost), S.size(70)],
            [S.recv('clima' + k), S.show()], [S.recv('clima0'), S.hide()]
          ]
        });
      }
      /* casa */
      const dias = (fase) => {
        const seq = SEQ[fase], n = seq.length;
        const dia = [S.setv('dia', 0), S.setv('fallos', 0), S.setv('energia', 0)];
        const un = [S.chv('dia', 1), S.send('clima0')]
          .concat(chain('dia', n, (k) => [S.setv('w', seq[k - 1])]),
            [S.iff(S.eq(v('w'), 1), [S.send('clima1')]), S.iff(S.eq(v('w'), 2), [S.send('clima2')]), S.iff(S.eq(v('w'), 3), [S.send('clima3')]), S.wait(0.4),
            S.iff(S.eq(v('w'), 1), [S.setv('r', v('rs'))]), S.iff(S.eq(v('w'), 2), [S.setv('r', v('rv'))]), S.iff(S.eq(v('w'), 3), [S.setv('r', v('rn'))]),
            S.ifelse(S.eq(v('r'), v('w')),
              [S.costume('Casa 2'), S.chv('energia', 1), S.sound('Ta-chán')].concat([1, 2, 3].map((w) => S.iff(S.eq(v('w'), w), T(YER, TXT_OK[w])))),
              [S.costume('Casa 1'), S.chv('fallos', 1), S.sound('Boing')].concat([1, 2, 3].map((w) => S.iff(S.eq(v('w'), w), T(ROB, TXT_MAL[w]))))),
            S.wait(0.4), S.costume('Casa 1')]);
        return dia.concat([S.rep(n, un), S.send('clima0'), S.wait(0.3),
          S.ifelse(S.eq(v('fallos'), 0), [S.setv('hecho', 1)], [S.send('fallan'), S.setv('modo', 0)])]);
      };
      sprites.push({
        id: 'casa', name: 'Casa', x: 150, y: -45, size: 100, sounds: ['Pop', 'Boing', 'Ta-chán'], scripts: [
          [F(), S.show(), S.costume('Casa 1'), S.size(100)],
          [S.recv('probar'), S.setv('modo', 1)].concat([1, 2, 3].map((fs) => S.iff(f(fs), dias(fs))))
        ]
      });
      sprites.push({
        id: 'boton', name: 'Botón Probar', x: 150, y: 140, size: 50, sounds: ['Pop'], scripts: [
          [F(), S.show(), S.costume('Botón 1'), S.size(50)],
          [S.click(), S.iff(S.and(S.eq(v('modo'), 0), S.gt(v('fase'), 0)), [S.sound('Pop'), S.send('probar')])]
        ]
      });
      /* narración */
      const P = (list) => say(list);
      const ruleSet = (a, b, c) => [S.setv('rs', a), S.setv('rv', b), S.setv('rn', c), S.send('filas')];
      sprites.push({
        id: 'lucia', name: 'Lucía', x: -215, y: -118, size: 44, sounds: ['Pop'], scripts: [
          [F(), S.show(), S.setv('fase', 0), S.setv('modo', 1), S.setv('hecho', 0), S.setv('dia', 0), S.setv('energia', 0), S.setv('fallos', 0)].concat(ruleSet(3, 3, 1),
            [S.send('clima0'), S.wait(0.6)],
            P([
              ['L', '', '¡Hola! Soy Lucía, y él es Yeray. Estamos en una isla del Atlántico, como las islas Canarias. Aquí hay un problema.'],
              ['Y', '', 'Toda la electricidad de la isla se hacía quemando gasóleo. Eso contamina el aire y calienta el planeta. Queremos usar energías limpias.'],
              ['L', '', 'Las energías limpias vienen de la naturaleza y no se acaban. El sol, el viento y el agua son energías renovables.'],
              ['Y', '', 'Pero hay un problema: el tiempo cambia. Unos días hace sol, otros sopla el viento y por la noche no hay sol.'],
              ['L', '', 'Necesitamos un programa que decida qué fuente usar según el tiempo. En programación eso se llama un condicional. Se dice así: si pasa esto, entonces hago aquello.'],
              ['R', '', 'Soy el ordenador de la isla. Esperando reglas.']
            ]),
            [S.setv('fase', 1), S.setv('modo', 0), S.send('filas')],
            P([
              ['L', '', 'Mira la pantalla. Hay dos reglas. La primera dice: si hace sol, entonces uso esta fuente. La segunda dice: si sopla el viento, entonces uso esta otra.'],
              ['Y', '', 'Toca cada fuente para cambiarla. Hay un panel solar, un aerogenerador y una batería. Cuando creas que está bien, pulsa el botón verde para comprobar los días.']
            ]),
            [S.waitUntil(S.eq(v('hecho'), 1)), S.wait(1.5)],
            P([
              ['L', '', '¡Funciona! Con sol, el panel solar. Con viento, el aerogenerador. Has escrito dos condicionales.'],
              ['Y', '', 'Y fíjate: el programa repite lo mismo cada día, mirando el tiempo que hace. Repetir es un bucle.']
            ]),
            [S.setv('fase', 2), S.setv('hecho', 0), S.setv('modo', 0)], ruleSet(3, 3, 1),
            P([
              ['L', '', 'Ahora llega la noche. Sin sol no funcionan los paneles, y puede que tampoco haya viento. Aparece una tercera regla: si es de noche, entonces usa esta fuente.'],
              ['Y', '', 'Una batería guarda la energía que sobra durante el día para usarla de noche. Es como una mochila de electricidad.'],
              ['L', '', 'Elige las tres fuentes y prueba una semana de tiempo.']
            ]),
            [S.waitUntil(S.eq(v('hecho'), 1)), S.wait(1.5)],
            P([
              ['L', '', '¡Muy bien! Has pensado en todas las situaciones que pueden darse. Los buenos programas siempre tienen una regla para cada caso.']
            ]),
            [S.setv('fase', 3), S.setv('hecho', 0), S.setv('modo', 0)], ruleSet(2, 1, 3),
            P([
              ['L', '', 'Última misión. Un técnico ha escrito unas reglas, pero tiene algún error. Pulsa el botón verde y mira con atención en qué días se apaga la luz.'],
              ['Y', '', 'Después busca qué regla falla y cámbiala. Se llama depurar: probar, encontrar el fallo y corregirlo.']
            ]),
            [S.waitUntil(S.eq(v('hecho'), 1)), S.wait(1.5)],
            P([
              ['L', '', 'Has arreglado el programa. Ahora la isla tiene luz toda la semana sin quemar nada.'],
              ['Y', '', 'Hoy has usado condicionales, un bucle para repetir los días, y has depurado un programa. Así funcionan las casas inteligentes y las redes eléctricas de verdad.'],
              ['L', '', 'En Canarias ya hay parques eólicos y miles de paneles solares. ¡Tú también piensas como un programador!']
            ]),
            [S.send('fin'), S.wait(1.5), S.stopAll()]),
          [S.recv('fallan')].concat(P([['L', '', 'Se ha apagado la luz algún día. Piensa: ¿qué tiempo hacía ese día y qué fuente habías elegido? Cámbiala y prueba otra vez.']]))
        ]
      });
      sprites.push({ id: 'yeray', name: 'Yeray', x: -165, y: -118, size: 44, sounds: ['Pop'], scripts: [[F(), S.show()]] });
      sprites.push(bravo(0, 30, 40));
      return make({
        backdrops: ['pc-casa-energia'],
        messages: ['filas', 'probar', 'clima0', 'clima1', 'clima2', 'clima3', 'fallan', 'fin'],
        vars: [['fase', 0, false], ['modo', 1, false], ['hecho', 0, false], ['dia', 0, false], ['w', 0, false], ['r', 0, false], ['rs', 3, false], ['rv', 3, false], ['rn', 1, false], ['energia', 0, true], ['fallos', 0, false]],
        stage: [[F(), S.backdrop('pc-casa-energia')]], sprites
      });
    }
  });

  /* ---------- registro ---------- */
  EX.forEach((e) => PQ.EX.push(e));

  /* ---------- voces coherentes en TODOS los cuentos y juegos ----------
   * niña = KITTEN, niño = ALTO, robot = TENOR, animal pequeño = SQUEAK, animal grande = GIANT.
   * Se corrige por nombre de personaje al construir cada ejemplo (los cuentos de «pensamiento
   * computacional» ya usan estas voces y se dejan tal cual). */
  const walkB = (list, fn) => (list || []).forEach((b) => { fn(b); walkB(b.sub, fn); walkB(b.sub2, fn); });
  const ROLE = (name) => {
    if (/^Casilla/.test(name)) return 'SQUEAK';                      // tarjetas del juego de los animales
    if (/^(Luc[ií]a|Yeray|Robot|Rover|Canario|Cangrejo|Lagarto|Mariposa|Paloma|Perro|Pez|Ballena|Tortuga)\b/.test(name)) return PQ.defaultVoice({ name });
    return null;
  };
  PQ.EX.forEach((e) => {
    if (e.pc) return;
    const build = e.build;
    e.build = function () {
      const pr = build.apply(this, arguments);
      pr.sprites.forEach((sp) => {
        const role = ROLE(sp.name || '');
        if (!role) return;
        (sp.scripts || []).forEach((sc) => walkB(sc.blocks, (b) => { if (b.op === 'text2speech_setVoice' && !(/^Casilla/.test(sp.name) && b.f.VOICE === 'GIANT')) b.f.VOICE = role; }));
        sp._voice = role;
      });
      return pr;
    };
  });;
})(typeof window !== 'undefined' ? window : globalThis);
