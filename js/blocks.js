/* PequeBloques — diseñado por David OZC
 * blocks.js: registro de bloques (opcodes de Scratch 3) sin DOM
 */
(function (g) {
  'use strict';
  const PQ = g.PQ = g.PQ || {};

  PQ.CATS = {
    events: { name: 'Eventos', c: '#FFBF00', b: '#CC9900' },
    motion: { name: 'Movimiento', c: '#4C97FF', b: '#3373CC' },
    looks: { name: 'Apariencia', c: '#9966FF', b: '#774DCB' },
    sound: { name: 'Sonido', c: '#CF63CF', b: '#BD42BD' },
    control: { name: 'Control', c: '#FFAB19', b: '#CF8B17' },
    sensing: { name: 'Sensores', c: '#5CB1D6', b: '#2E8EB8' },
    voice: { name: 'Voz', c: '#E8664F', b: '#C24A35' },
    operators: { name: 'Operadores', c: '#59C059', b: '#389438' },
    data: { name: 'Variables', c: '#FF8C1A', b: '#DB6E00' },
    pen: { name: 'Lápiz', c: '#0FBD8C', b: '#0B8E69' }
  };
  PQ.CAT_ORDER = ['events', 'motion', 'looks', 'sound', 'voice', 'control', 'sensing', 'operators', 'data', 'pen'];

  const B = PQ.BLOCKS = {};
  PQ.PALETTE = {};
  PQ.CAT_ORDER.forEach((c) => { PQ.PALETTE[c] = []; });

  /* Argumentos: k = tipo de exportación
     prim  -> input con valor primitivo (code = tipo primitivo sb3)
     menu  -> input con bloque sombra (shadow, field)
     field -> campo directo (fields[NAME])
     bfield-> campo de mensaje (BROADCAST_OPTION)
     bin   -> entrada de mensaje (BROADCAST_INPUT) */
  const num = (d, code) => ({ k: 'prim', t: 'num', d, code: code || 4 });
  const ang = (d) => ({ k: 'prim', t: 'num', d, code: 8 });
  const txt = (d) => ({ k: 'prim', t: 'txt', d, code: 10 });
  const bsl = () => ({ k: 'bslot', t: 'bool' });
  const col = (d) => ({ k: 'prim', t: 'color', d, code: 9 });
  const menu = (m, shadow, field, d) => ({ k: 'menu', t: 'menu', menu: m, shadow, field, d });

  function def(op, cat, kind, icon, label, args, lvl, o) {
    B[op] = Object.assign({ op, cat, kind, icon, label, args: args || {}, lvl: lvl || 1 }, o || {});
    PQ.PALETTE[cat].push(op);
  }

  /* kind: hat | stack | c | cap | bool */
  def('event_whenflagclicked', 'events', 'hat', 'flag', 'al hacer clic en %FLAG', {}, 1);
  def('event_whenkeypressed', 'events', 'hat', 'key', 'al presionar %KEY_OPTION',
    { KEY_OPTION: { k: 'field', t: 'menu', menu: 'key', d: 'space' } }, 1);
  def('event_whenstageclicked', 'events', 'hat', 'tap', 'al hacer clic en el escenario', {}, 1, { stageOnly: true });
  def('event_whenthisspriteclicked', 'events', 'hat', 'tap', 'al hacer clic en este objeto', {}, 1, { spriteOnly: true });
  def('event_whenbroadcastreceived', 'events', 'hat', 'mail', 'al recibir %BROADCAST_OPTION',
    { BROADCAST_OPTION: { k: 'bfield', t: 'menu', menu: 'msg', d: '' } }, 1);
  def('event_broadcast', 'events', 'stack', 'mail', 'enviar %BROADCAST_INPUT',
    { BROADCAST_INPUT: { k: 'bin', t: 'menu', menu: 'msg', d: '' } }, 1);
  def('event_broadcastandwait', 'events', 'stack', 'mail', 'enviar %BROADCAST_INPUT y esperar',
    { BROADCAST_INPUT: { k: 'bin', t: 'menu', menu: 'msg', d: '' } }, 2);

  def('motion_movesteps', 'motion', 'stack', 'arrow', 'mover %STEPS pasos', { STEPS: num(10) }, 1, { sprite: true });
  def('motion_turnright', 'motion', 'stack', 'turnr', 'girar ↻ %DEGREES grados', { DEGREES: num(15) }, 1, { sprite: true });
  def('motion_turnleft', 'motion', 'stack', 'turnl', 'girar ↺ %DEGREES grados', { DEGREES: num(15) }, 1, { sprite: true });
  def('motion_goto', 'motion', 'stack', 'target', 'ir a %TO',
    { TO: menu('goto', 'motion_goto_menu', 'TO', '_random_') }, 2, { sprite: true });
  def('motion_gotoxy', 'motion', 'stack', 'target', 'ir a x: %X y: %Y', { X: num(0), Y: num(0) }, 1, { sprite: true });
  def('motion_glidesecstoxy', 'motion', 'stack', 'glide', 'deslizar en %SECS segs. a x: %X y: %Y',
    { SECS: num(1), X: num(0), Y: num(0) }, 2, { sprite: true });
  def('motion_changexby', 'motion', 'stack', 'arrow', 'cambiar x por %DX', { DX: num(10) }, 1, { sprite: true });
  def('motion_setx', 'motion', 'stack', 'target', 'fijar x a %X', { X: num(0) }, 2, { sprite: true });
  def('motion_changeyby', 'motion', 'stack', 'arrowup', 'cambiar y por %DY', { DY: num(10) }, 1, { sprite: true });
  def('motion_sety', 'motion', 'stack', 'target', 'fijar y a %Y', { Y: num(0) }, 2, { sprite: true });
  def('motion_ifonedgebounce', 'motion', 'stack', 'bounce', 'rebotar si está en el borde', {}, 2, { sprite: true });
  def('motion_pointindirection', 'motion', 'stack', 'compass', 'apuntar en dirección %DIRECTION',
    { DIRECTION: ang(90) }, 2, { sprite: true });

  def('looks_sayforsecs', 'looks', 'stack', 'bubble', 'decir %MESSAGE durante %SECS segundos',
    { MESSAGE: txt('¡Hola!'), SECS: num(2) }, 1, { sprite: true });
  def('looks_say', 'looks', 'stack', 'bubble', 'decir %MESSAGE', { MESSAGE: txt('¡Hola!') }, 1, { sprite: true });
  def('looks_thinkforsecs', 'looks', 'stack', 'cloud', 'pensar %MESSAGE durante %SECS segundos',
    { MESSAGE: txt('Mmm...'), SECS: num(2) }, 2, { sprite: true });
  def('looks_think', 'looks', 'stack', 'cloud', 'pensar %MESSAGE', { MESSAGE: txt('Mmm...') }, 2, { sprite: true });
  def('looks_switchcostumeto', 'looks', 'stack', 'face', 'cambiar disfraz a %COSTUME',
    { COSTUME: menu('costume', 'looks_costume', 'COSTUME', '') }, 1, { sprite: true });
  def('looks_nextcostume', 'looks', 'stack', 'face', 'siguiente disfraz', {}, 1, { sprite: true });
  def('looks_switchbackdropto', 'looks', 'stack', 'picture', 'cambiar fondo a %BACKDROP',
    { BACKDROP: menu('backdrop', 'looks_backdrops', 'BACKDROP', '') }, 1);
  def('looks_nextbackdrop', 'looks', 'stack', 'picture', 'siguiente fondo', {}, 2);
  def('looks_changesizeby', 'looks', 'stack', 'grow', 'cambiar tamaño por %CHANGE', { CHANGE: num(10) }, 1, { sprite: true });
  def('looks_setsizeto', 'looks', 'stack', 'grow', 'fijar tamaño a %SIZE %', { SIZE: num(100) }, 2, { sprite: true });
  def('looks_show', 'looks', 'stack', 'eye', 'mostrar', {}, 1, { sprite: true });
  def('looks_hide', 'looks', 'stack', 'eyeoff', 'esconder', {}, 1, { sprite: true });

  def('sound_playuntildone', 'sound', 'stack', 'speaker', 'tocar sonido %SOUND_MENU hasta que termine',
    { SOUND_MENU: menu('sound', 'sound_sounds_menu', 'SOUND_MENU', '') }, 1);
  def('sound_play', 'sound', 'stack', 'speaker', 'iniciar sonido %SOUND_MENU',
    { SOUND_MENU: menu('sound', 'sound_sounds_menu', 'SOUND_MENU', '') }, 1);
  def('sound_stopallsounds', 'sound', 'stack', 'speakeroff', 'detener todos los sonidos', {}, 2);

  def('control_wait', 'control', 'stack', 'clock', 'esperar %DURATION segundos', { DURATION: num(1, 5) }, 1);
  def('control_repeat', 'control', 'c', 'repeat', 'repetir %TIMES veces', { TIMES: num(10, 6) }, 1);
  def('control_forever', 'control', 'c', 'forever', 'por siempre', {}, 1, { noNext: true });
  def('control_if', 'control', 'c', 'question', 'si %CONDITION entonces', {}, 2, { cond: true });
  def('control_if_else', 'control', 'c', 'question', 'si %CONDITION entonces', {}, 2, { cond: true, two: true });
  def('control_wait_until', 'control', 'stack', 'clock', 'esperar hasta que %CONDITION', {}, 2, { cond: true });
  def('control_repeat_until', 'control', 'c', 'repeat', 'repetir hasta que %CONDITION', {}, 2, { cond: true });
  def('control_stop', 'control', 'cap', 'stop', 'detener %STOP_OPTION',
    { STOP_OPTION: { k: 'field', t: 'menu', menu: 'stop', d: 'all' } }, 1);

  def('sensing_touchingobject', 'sensing', 'bool', 'hand', '¿tocando %TOUCHINGOBJECTMENU ?',
    { TOUCHINGOBJECTMENU: menu('touching', 'sensing_touchingobjectmenu', 'TOUCHINGOBJECTMENU', '_mouse_') }, 2, { sprite: true });
  def('sensing_keypressed', 'sensing', 'bool', 'key', '¿tecla %KEY_OPTION presionada?',
    { KEY_OPTION: menu('key', 'sensing_keyoptions', 'KEY_OPTION', 'space') }, 2);


  /* ---- bloques ampliados: reporteros (rep), operadores, variables, sensores, voz y lápiz ---- */
  def('event_whenbackdropswitchesto', 'events', 'hat', 'picture', 'al cambiar el fondo a %BACKDROP',
    { BACKDROP: { k: 'field', t: 'menu', menu: 'backdrop', d: '' } }, 2);
  def('motion_xposition', 'motion', 'rep', 'target', 'posición x', {}, 2, { sprite: true });
  def('motion_yposition', 'motion', 'rep', 'target', 'posición y', {}, 2, { sprite: true });
  def('motion_direction', 'motion', 'rep', 'compass', 'dirección', {}, 2, { sprite: true });
  def('looks_size', 'looks', 'rep', 'grow', 'tamaño', {}, 2, { sprite: true });
  def('looks_costumenumbername', 'looks', 'rep', 'face', 'disfraz %NUMBER_NAME',
    { NUMBER_NAME: { k: 'field', t: 'menu', menu: 'numname', d: 'number' } }, 2, { sprite: true });
  def('sound_setvolumeto', 'sound', 'stack', 'speaker', 'fijar volumen a %VOLUME %', { VOLUME: num(100) }, 2);
  def('sound_changevolumeby', 'sound', 'stack', 'speaker', 'cambiar volumen por %VOLUME', { VOLUME: num(-10) }, 2);
  def('sound_volume', 'sound', 'rep', 'speaker', 'volumen', {}, 2);

  def('text2speech_speakAndWait', 'voice', 'stack', 'speaker', 'decir en voz alta %WORDS', { WORDS: txt('¡Hola!') }, 1, { ext: 'text2speech' });
  def('text2speech_setVoice', 'voice', 'stack', 'face', 'usar voz %VOICE',
    { VOICE: menu('voices', 'text2speech_menu_voices', 'voices', 'ALTO') }, 1, { ext: 'text2speech' });

  def('sensing_mousex', 'sensing', 'rep', 'tap', 'ratón x', {}, 2);
  def('sensing_mousey', 'sensing', 'rep', 'tap', 'ratón y', {}, 2);
  def('sensing_mousedown', 'sensing', 'bool', 'tap', '¿ratón presionado?', {}, 2);
  def('sensing_timer', 'sensing', 'rep', 'clock', 'cronómetro', {}, 2);
  def('sensing_resettimer', 'sensing', 'stack', 'clock', 'reiniciar cronómetro', {}, 2);
  def('sensing_askandwait', 'sensing', 'stack', 'question', 'preguntar %QUESTION y esperar', { QUESTION: txt('¿Cómo te llamas?') }, 2);
  def('sensing_answer', 'sensing', 'rep', 'question', 'respuesta', {}, 2);

  def('operator_add', 'operators', 'rep', '', '%NUM1 + %NUM2', { NUM1: num('', 4), NUM2: num('', 4) }, 2);
  def('operator_subtract', 'operators', 'rep', '', '%NUM1 - %NUM2', { NUM1: num('', 4), NUM2: num('', 4) }, 2);
  def('operator_multiply', 'operators', 'rep', '', '%NUM1 × %NUM2', { NUM1: num('', 4), NUM2: num('', 4) }, 2);
  def('operator_divide', 'operators', 'rep', '', '%NUM1 / %NUM2', { NUM1: num('', 4), NUM2: num('', 4) }, 2);
  def('operator_random', 'operators', 'rep', 'dice', 'al azar entre %FROM y %TO', { FROM: num(1, 4), TO: num(10, 4) }, 2);
  def('operator_gt', 'operators', 'bool', '', '%OPERAND1 > %OPERAND2', { OPERAND1: txt(''), OPERAND2: txt('50') }, 2);
  def('operator_lt', 'operators', 'bool', '', '%OPERAND1 < %OPERAND2', { OPERAND1: txt(''), OPERAND2: txt('50') }, 2);
  def('operator_equals', 'operators', 'bool', '', '%OPERAND1 = %OPERAND2', { OPERAND1: txt(''), OPERAND2: txt('50') }, 2);
  def('operator_and', 'operators', 'bool', '', '%OPERAND1 y %OPERAND2', { OPERAND1: bsl(), OPERAND2: bsl() }, 2);
  def('operator_or', 'operators', 'bool', '', '%OPERAND1 o %OPERAND2', { OPERAND1: bsl(), OPERAND2: bsl() }, 2);
  def('operator_not', 'operators', 'bool', '', 'no %OPERAND', { OPERAND: bsl() }, 2);
  def('operator_join', 'operators', 'rep', '', 'unir %STRING1 %STRING2', { STRING1: txt('hola '), STRING2: txt('mundo') }, 2);
  def('operator_mod', 'operators', 'rep', '', 'resto de %NUM1 / %NUM2', { NUM1: num('', 4), NUM2: num('', 4) }, 2);
  def('operator_round', 'operators', 'rep', '', 'redondear %NUM', { NUM: num('', 4) }, 2);

  const VARF = { k: 'field', t: 'menu', menu: 'var', d: '' };
  def('data_setvariableto', 'data', 'stack', 'var', 'dar a %VARIABLE el valor %VALUE', { VARIABLE: VARF, VALUE: txt('0') }, 2);
  def('data_changevariableby', 'data', 'stack', 'var', 'sumar a %VARIABLE el valor %VALUE', { VARIABLE: VARF, VALUE: num(1, 4) }, 2);
  def('data_showvariable', 'data', 'stack', 'eye', 'mostrar variable %VARIABLE', { VARIABLE: VARF }, 2);
  def('data_hidevariable', 'data', 'stack', 'eyeoff', 'esconder variable %VARIABLE', { VARIABLE: VARF }, 2);
  def('data_variable', 'data', 'rep', '', '%VARIABLE', { VARIABLE: VARF }, 2, { noPal: true });

  def('pen_clear', 'pen', 'stack', 'pen', 'borrar todo', {}, 2, { ext: 'pen' });
  def('pen_stamp', 'pen', 'stack', 'pen', 'sellar', {}, 2, { ext: 'pen', sprite: true });
  def('pen_penDown', 'pen', 'stack', 'pen', 'bajar lápiz', {}, 2, { ext: 'pen', sprite: true });
  def('pen_penUp', 'pen', 'stack', 'pen', 'subir lápiz', {}, 2, { ext: 'pen', sprite: true });
  def('pen_setPenColorToColor', 'pen', 'stack', 'pen', 'fijar color del lápiz a %COLOR', { COLOR: col('#FF3355') }, 2, { ext: 'pen', sprite: true });
  def('pen_changePenSizeBy', 'pen', 'stack', 'pen', 'cambiar tamaño del lápiz por %SIZE', { SIZE: num(1) }, 2, { ext: 'pen', sprite: true });
  def('pen_setPenSizeTo', 'pen', 'stack', 'pen', 'fijar tamaño del lápiz a %SIZE', { SIZE: num(4) }, 2, { ext: 'pen', sprite: true });

  PQ.VOICES = [['ALTO', 'normal'], ['TENOR', 'grave'], ['SQUEAK', 'ardilla'], ['GIANT', 'gigante'], ['KITTEN', 'gatito']];
  PQ.COLORS = ['#000000', '#7a7a7a', '#ffffff', '#E64040', '#FF8A4D', '#FFD91A', '#59D98E', '#2FB37D', '#4C97FF', '#9966FF', '#FF6FA8', '#8A5A32'];
  /* ¿tiene el bloque algún hueco que admita un reportero? */
  PQ.slotNames = (op) => Object.keys(B[op].args).filter((n) => B[op].args[n].k === 'prim');

  /* ---- etiquetas ---- */
  PQ.parseLabel = function (label) {
    const out = [];
    label.split(/(%[A-Z_0-9]+)/).forEach((p) => {
      if (!p) return;
      if (p[0] === '%' && p.length > 1) out.push({ arg: p.slice(1) });
      else out.push(p);
    });
    return out;
  };

  /* ---- menús ---- */
  const KEYS = [['space', 'espacio'], ['up arrow', 'flecha ↑'], ['down arrow', 'flecha ↓'],
    ['left arrow', 'flecha ←'], ['right arrow', 'flecha →'], ['any', 'cualquiera']];
  'abcdefghijklmnopqrstuvwxyz0123456789'.split('').forEach((k) => KEYS.push([k, k]));
  PQ.KEYS = KEYS;

  PQ.menuOptions = function (m, env) {
    const t = env && env.target, p = env && env.project;
    switch (m) {
      case 'key': return KEYS.slice();
      case 'costume': return ((t && t.costumes) || []).map((c) => [c.name, c.name]);
      case 'backdrop': return ((p && p.stage.costumes) || []).map((c) => [c.name, c.name]);
      case 'sound': return ((t && t.sounds) || []).map((s) => [s.name, s.name]);
      case 'stop': return [['all', 'todo'], ['this script', 'este programa']];
      case 'touching': {
        const o = [['_mouse_', 'puntero del ratón'], ['_edge_', 'borde']];
        ((p && p.sprites) || []).forEach((s) => { if (!t || s !== t) o.push([s.name, s.name]); });
        return o;
      }
      case 'goto': {
        const o = [['_random_', 'posición aleatoria'], ['_mouse_', 'puntero del ratón']];
        ((p && p.sprites) || []).forEach((s) => { if (!t || s !== t) o.push([s.name, s.name]); });
        return o;
      }
      case 'var': return ((p && p.vars) || []).map((v) => [v.name, v.name]);
      case 'voices': return PQ.VOICES.slice();
      case 'numname': return [['number', 'número'], ['name', 'nombre']];
      case 'msg': {
        const o = ((p && p.messages) || []).map((n) => [n, n]);
        o.push(['__new__', 'Mensaje nuevo…']);
        return o;
      }
    }
    return [];
  };

  PQ.menuDefault = function (m, env) {
    const o = PQ.menuOptions(m, env).filter((x) => x[0] !== '__new__');
    if (m === 'costume') {
      const t = env.target;
      return t && t.costumes.length ? t.costumes[Math.min(t.costumes.length - 1, (t.current || 0) + (t.costumes.length > 1 ? 1 : 0)) % t.costumes.length].name : '';
    }
    return o.length ? o[0][0] : '';
  };

  /* ---- fábrica de bloques del modelo ---- */
  PQ.mkBlock = function (op, f, env) {
    const spec = B[op];
    const b = { op, f: {} };
    Object.keys(spec.args).forEach((n) => {
      const a = spec.args[n];
      let d = a.d;
      if (a.t === 'menu' && (d === '' || d === undefined)) d = env ? PQ.menuDefault(a.menu, env) : '';
      if (a.t === 'menu' && a.menu === 'msg' && env && env.project) d = (env.project.messages || [])[0] || '';
      b.f[n] = d;
    });
    if (f) Object.assign(b.f, f);
    if (spec.kind === 'c') { b.sub = []; if (spec.two) b.sub2 = []; }
    if (spec.cond) b.cond = null;
    if (op === 'data_variable' && f && f.VARIABLE !== undefined) b.f.VARIABLE = f.VARIABLE;
    return b;
  };
})(typeof window !== 'undefined' ? window : globalThis);
