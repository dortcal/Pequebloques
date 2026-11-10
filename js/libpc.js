/* PequeBloques — diseñado por David OZC
 * libpc.js: dibujos ORIGINALES para los cuentos de «Pensamiento computacional»
 * (reciclaje, energías limpias y universo). Se añaden a la biblioteca de lib.js.
 */
/* carga diferida: este módulo no se ejecuta al arrancar, sino la primera vez que hace falta (ver PQ.defer en util.js) */
PQ.defer('libpc', function (g) {
  'use strict';
  const PQ = g.PQ;
  const O = '#3a2c4f';
  const svg = (inner) => '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">' + inner + '</svg>';
  const st = (w) => `stroke="${O}" stroke-width="${w || 3}" stroke-linecap="round" stroke-linejoin="round"`;
  const sp = (id, name, costumes) => PQ.SPRITE_LIB.push({ id, name, costumes });
  const face = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s || 1})"><circle cx="-8" cy="0" r="3.2" fill="${O}"/><circle cx="8" cy="0" r="3.2" fill="${O}"/><circle cx="-7" cy="-1.2" r="1.1" fill="#fff"/><circle cx="9" cy="-1.2" r="1.1" fill="#fff"/><path d="M-6 8 q6 6 12 0" fill="none" ${st(2.4)}/></g>`;

  /* ---------- residuos para reciclar ---------- */
  const lata = svg(`
    <ellipse cx="60" cy="24" rx="26" ry="9" fill="#D7DEE6" ${st()}/>
    <path d="M34 24 V96 Q34 108 60 108 Q86 108 86 96 V24 Q86 34 60 34 Q34 34 34 24 Z" fill="#E8EDF2" ${st()}/>
    <path d="M34 48 H86 V82 H34 Z" fill="#E2554D" ${st(2.6)}/>
    <path d="M44 30 V104" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>
    ${face(62, 66, 1.05)}`);
  const brik = svg(`
    <path d="M30 30 L60 14 L90 30 V100 Q60 112 30 100 Z" fill="#fff" ${st()}/>
    <path d="M30 30 L60 44 L90 30" fill="none" ${st(2.6)}/><path d="M60 44 V108" fill="none" ${st(2.2)}/>
    <path d="M60 14 L64 4 L72 8" fill="none" stroke="#59B7FF" stroke-width="4" stroke-linecap="round"/>
    <path d="M30 56 H60 V100 Q45 104 30 100 Z" fill="#59B7FF" opacity=".75"/>
    <path d="M38 70 q8-10 14 0 q-6 8 -14 0 Z" fill="#fff"/>
    ${face(75, 74, .9)}`);
  const periodico = svg(`
    <path d="M16 20 H96 V96 H22 Q16 96 16 90 Z" fill="#fff" ${st()}/>
    <path d="M96 36 H108 V90 Q108 96 102 96 H96" fill="#E9E9F0" ${st()}/>
    <rect x="24" y="28" width="62" height="14" fill="${O}"/><path d="M26 54 H50 M26 62 H50 M26 70 H50 M26 78 H50 M58 54 H84 M58 62 H84" fill="none" stroke="#9AA3B2" stroke-width="3.4" stroke-linecap="round"/>
    <rect x="58" y="68" width="26" height="18" fill="#FFD21F"/>
    ${face(71, 77, .55)}`);
  const caja = svg(`
    <path d="M14 38 L60 22 L106 38 V90 L60 108 L14 90 Z" fill="#C98F52" ${st()}/>
    <path d="M14 38 L60 54 L106 38 M60 54 V108" fill="none" ${st(2.6)}/>
    <path d="M44 28 L84 44 L84 54 L44 38 Z" fill="#E7C28D" ${st(2.4)}/>
    ${face(36, 76, .8)}`);
  const tarro = svg(`
    <rect x="38" y="10" width="44" height="14" rx="4" fill="#C9D3DD" ${st()}/>
    <path d="M40 24 H80 Q96 30 96 52 V96 Q96 110 82 110 H38 Q24 110 24 96 V52 Q24 30 40 24 Z" fill="#9BE3B3" fill-opacity=".8" ${st()}/>
    <path d="M34 50 V92" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>
    <path d="M26 74 H94 V96 Q94 108 82 108 H38 Q26 108 26 96 Z" fill="#5CC987" opacity=".6"/>
    ${face(60, 66, 1.05)}`);
  sp('residuo', 'Residuo', [['residuo-a', lata], ['residuo-b', brik], ['residuo-c', periodico], ['residuo-d', caja], ['residuo-e', tarro]]);

  /* tercer contenedor: verde (vidrio) */
  const cont = PQ.SPRITE_LIB.find((s) => s.id === 'contenedor');
  const verde = cont.costumes[0][1]
    .replace(/#FFD21F/g, '#2FA45A').replace(/#F2A900/g, '#1B7A3D');
  const icon = '<g fill="#fff" stroke="#3a2c4f" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="53" y="48" width="14" height="9" rx="2"/><path d="M50 57 H70 Q76 66 76 76 V90 Q76 94 72 94 H48 Q44 94 44 90 V76 Q44 66 50 57 Z"/></g>';
  cont.costumes.push(['contenedor-c', verde.replace(/<g fill="#fff"[\s\S]*?<\/g>/, icon)]);

  /* ---------- energías limpias ---------- */
  const rays = (n, r1, r2, cx, cy) => Array.from({ length: n }, (_, i) => { const a = i * 2 * Math.PI / n; return `<path d="M${(cx + Math.cos(a) * r1).toFixed(1)} ${(cy + Math.sin(a) * r1).toFixed(1)} L${(cx + Math.cos(a) * r2).toFixed(1)} ${(cy + Math.sin(a) * r2).toFixed(1)}" stroke="#FFB300" stroke-width="6" stroke-linecap="round"/>`; }).join('');
  sp('sol', 'Sol', [['sol-a', svg(`${rays(10, 38, 54, 60, 60)}<circle cx="60" cy="60" r="34" fill="#FFD91A" ${st()}/>${face(60, 56, 1.3)}<circle cx="42" cy="68" r="5" fill="#FF9AA8" opacity=".7"/><circle cx="78" cy="68" r="5" fill="#FF9AA8" opacity=".7"/>`)]]);
  sp('viento', 'Viento', [['viento-a', svg(`
    <path d="M12 44 H70 Q90 44 90 30 Q90 18 78 18" fill="none" stroke="#7FB8E8" stroke-width="9" stroke-linecap="round"/>
    <path d="M12 66 H92 Q112 66 112 82 Q112 96 98 96" fill="none" stroke="#9FD0F2" stroke-width="9" stroke-linecap="round"/>
    <path d="M22 86 H62 Q76 86 76 98 Q76 108 66 108" fill="none" stroke="#7FB8E8" stroke-width="8" stroke-linecap="round"/>
    <circle cx="34" cy="56" r="3" fill="${O}"/><circle cx="48" cy="56" r="3" fill="${O}"/><path d="M36 60 q5 5 10 0" fill="none" ${st(2.2)}/>`)]]);
  const panel = (on) => svg(`
    ${on ? '<g stroke="#FFB300" stroke-width="5" stroke-linecap="round"><path d="M12 14 l12 12 M60 6 V22 M108 14 l-12 12"/></g>' : ''}
    <path d="M22 34 H98 L108 80 H12 Z" fill="${on ? '#2F7BE0' : '#4B5C86'}" ${st()}/>
    <path d="M41 34 L38 80 M60 34 V80 M79 34 L82 80 M17 57 H103" fill="none" stroke="#fff" stroke-width="2.4" opacity=".75"/>
    ${on ? '<path d="M28 42 l16-3 -3 9 Z" fill="#fff" opacity=".6"/>' : ''}
    <path d="M60 80 V104 M44 106 H76" fill="none" ${st(5)}/>`);
  sp('panel', 'Panel solar', [['panel-a', panel(false)], ['panel-b', panel(true)]]);
  const aero = (rot) => svg(`
    <path d="M56 56 L52 112 H68 L64 56 Z" fill="#F4F6FA" ${st()}/>
    <g transform="rotate(${rot} 60 52)"><path d="M60 52 L52 8 Q60 2 68 8 Z M60 52 L102 76 Q100 86 90 84 Z M60 52 L18 76 Q20 86 30 84 Z" fill="#fff" ${st()}/></g>
    <circle cx="60" cy="52" r="8" fill="#FFD21F" ${st()}/>${face(60, 52, .5)}`);
  sp('molino', 'Aerogenerador', [['molino-a', aero(0)], ['molino-b', aero(40)], ['molino-c', aero(80)]]);
  const bomb = (on) => svg(`
    ${on ? '<g stroke="#FFB300" stroke-width="5" stroke-linecap="round"><path d="M60 4 V14 M20 22 l8 8 M100 22 l-8 8 M8 58 H18 M102 58 H112"/></g>' : ''}
    <path d="M60 18 Q92 18 92 52 Q92 70 78 82 V92 H42 V82 Q28 70 28 52 Q28 18 60 18 Z" fill="${on ? '#FFE766' : '#E5E9EF'}" ${st()}/>
    <rect x="42" y="92" width="36" height="8" rx="3" fill="#B9C3CE" ${st(2.6)}/><rect x="46" y="100" width="28" height="8" rx="3" fill="#B9C3CE" ${st(2.6)}/>
    ${on ? face(60, 52, 1.2) : `<path d="M48 50 h8 M64 50 h8" ${st(3)}/><path d="M52 64 q8-5 16 0" fill="none" ${st(2.6)}/>`}`);
  sp('bombilla', 'Bombilla', [['bombilla-a', bomb(false)], ['bombilla-b', bomb(true)]]);
  const casa = (on) => svg(`
    <path d="M10 56 L60 14 L110 56 Z" fill="#D9573F" ${st()}/>
    <rect x="20" y="56" width="80" height="52" fill="#FFF1D2" ${st()}/>
    <rect x="30" y="66" width="22" height="22" fill="${on ? '#FFE766' : '#8FA2B8'}" ${st(2.6)}/><path d="M41 66 V88 M30 77 H52" ${st(2)}/>
    <rect x="68" y="72" width="22" height="36" rx="3" fill="#A86A3A" ${st(2.6)}/><circle cx="85" cy="92" r="2.2" fill="#FFD91A"/>
    ${on ? '<g stroke="#FFB300" stroke-width="3.5" stroke-linecap="round"><path d="M41 58 V54 M24 62 l-4-3 M58 62 l4-3"/></g>' : ''}`);
  sp('casa', 'Casa', [['casa-a', casa(false)], ['casa-b', casa(true)]]);
  const cable = (rota) => svg(`
    <rect x="4" y="50" width="30" height="20" rx="6" fill="#4B4458" ${st(2.6)}/><rect x="86" y="50" width="30" height="20" rx="6" fill="#4B4458" ${st(2.6)}/>
    ${rota ? '<path d="M34 60 H48 M72 60 H86" fill="none" stroke="#E2554D" stroke-width="6" stroke-linecap="round"/><path d="M50 44 L58 56 L52 62 L62 76" fill="none" stroke="#FFD21F" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'
           : '<path d="M34 60 H86" fill="none" stroke="#E2554D" stroke-width="6" stroke-linecap="round"/>'}`);
  sp('cable', 'Cable', [['cable-a', cable(false)], ['cable-b', cable(true)]]);
  sp('bateria', 'Batería', [['bateria-a', svg(`
    <rect x="14" y="30" width="86" height="62" rx="10" fill="#5ED08A" ${st()}/><rect x="100" y="48" width="12" height="26" rx="4" fill="#B9C3CE" ${st(2.6)}/>
    <path d="M52 40 L38 64 H54 L48 84 L72 56 H56 Z" fill="#FFE766" ${st(2.6)}/>`)]]);
  sp('fuente', 'Fuente de energía', [['fuente-a', panel(true)], ['fuente-b', aero(0)], ['fuente-c', PQ.SPRITE_LIB.find((x) => x.id === 'bateria').costumes[0][1]]]);
  /* números 1-4 con puntos (secuencias para quien aún no lee) */
  const num = (n, col) => svg(`<circle cx="60" cy="60" r="50" fill="${col}" ${st(4)}/><text x="60" y="76" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-size="56" text-anchor="middle" fill="#fff">${n}</text>`);
  sp('numero', 'Número', [['numero-a', num(1, '#FF6FA8')], ['numero-b', num(2, '#59B7FF')], ['numero-c', num(3, '#5ED08A')], ['numero-d', num(4, '#FFA63D')]]);

  /* ---------- universo ---------- */
  const planeta = (col, dark, extra) => svg(`<circle cx="60" cy="60" r="44" fill="${col}" ${st()}/>${extra || ''}`);
  sp('planeta', 'Planeta', [
    ['planeta-a', planeta('#4C97FF', '', `<path d="M30 46 Q50 30 74 40 Q62 52 50 48 Q40 58 30 46 Z M56 82 Q80 70 96 80 Q82 94 56 82 Z" fill="#59D98E"/>${face(60, 62, 1)}`)],
    ['planeta-b', planeta('#E8E4D0', '', `<g fill="#C9C3A8"><circle cx="42" cy="44" r="9"/><circle cx="76" cy="52" r="11"/><circle cx="56" cy="80" r="8"/></g>${face(60, 62, .9)}`)],
    ['planeta-c', planeta('#E5673D', '', `<g fill="#C24A27"><circle cx="40" cy="50" r="8"/><circle cx="76" cy="46" r="6"/><circle cx="66" cy="78" r="10"/></g>${face(60, 62, 1)}`)],
    ['planeta-d', svg(`<ellipse cx="60" cy="62" rx="56" ry="14" fill="none" stroke="#E7C87B" stroke-width="8" transform="rotate(-18 60 62)"/><circle cx="60" cy="60" r="32" fill="#F1C96B" ${st()}/><path d="M32 52 Q60 44 88 52 M30 66 Q60 58 90 66" fill="none" stroke="#D49A3A" stroke-width="4" opacity=".8"/>${face(60, 62, .9)}<path d="M8 70 Q60 86 112 54" fill="none" stroke="#E7C87B" stroke-width="8" stroke-linecap="round" transform="rotate(0)" opacity=".0"/>`)],
    ['planeta-e', planeta('#FFB300', '', `${face(60, 58, 1.3)}<circle cx="42" cy="72" r="5" fill="#FF9AA8" opacity=".7"/><circle cx="78" cy="72" r="5" fill="#FF9AA8" opacity=".7"/>`)]
  ]);
  const aster = svg(`<path d="M20 54 L36 24 L70 14 L100 36 L106 70 L82 100 L44 104 L18 82 Z" fill="#9AA3B2" ${st()}/><circle cx="46" cy="46" r="8" fill="#7C8696"/><circle cx="76" cy="64" r="10" fill="#7C8696"/><circle cx="54" cy="82" r="6" fill="#7C8696"/>${face(64, 40, .5)}`);
  const roca = svg(`<path d="M12 98 Q14 62 40 50 Q50 28 74 36 Q98 40 100 70 Q108 84 104 98 Z" fill="#8B7B6E" ${st()}/><path d="M36 76 q10-10 22 0 M64 62 q8-6 16 2" fill="none" stroke="#6B5C52" stroke-width="3.5" stroke-linecap="round"/>`);
  sp('obstaculo', 'Obstáculo', [['obstaculo-a', aster], ['obstaculo-b', roca]]);
  const estC = (c) => svg(`<path d="M60 8 L74 42 L112 46 L84 70 L92 108 L60 88 L28 108 L36 70 L8 46 L46 42 Z" fill="${c}" ${st()}/><circle cx="50" cy="58" r="4.4" fill="${O}"/><circle cx="70" cy="58" r="4.4" fill="${O}"/><path d="M52 72 q8 8 16 0" fill="none" ${st(3)}/>`);
  sp('estrellac', 'Estrella de color', [['estrellac-a', estC('#FFD91A')], ['estrellac-b', estC('#59B7FF')], ['estrellac-c', estC('#FF6FA8')], ['estrellac-d', estC('#5ED08A')]]);

  /* ---------- tarjetas y botones del programador ---------- */
  const arrow = (rot) => `<g transform="rotate(${rot} 60 60)"><path d="M60 16 L100 60 H76 V104 H44 V60 H20 Z" fill="#fff" ${st(4)}/></g>`;
  const slot = (inner, fill) => svg(`<rect x="6" y="6" width="108" height="108" rx="18" fill="${fill || '#F2F4FA'}" ${st(4)} ${fill ? '' : 'stroke-dasharray="9 7"'}/>${inner || ''}`);
  const rep = '<path d="M30 54 Q32 30 58 30 H78 M70 18 L84 30 L70 42 M90 66 Q88 90 62 90 H42 M50 78 L36 90 L50 102" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><text x="60" y="68" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-size="26" text-anchor="middle" fill="#fff">+2</text>';
  sp('ranura', 'Ranura', [
    ['ranura-a', slot('')],
    ['ranura-b', slot(arrow(270), '#FF6FA8')], ['ranura-c', slot(arrow(0), '#59B7FF')], ['ranura-d', slot(arrow(180), '#FFA63D')], ['ranura-e', slot(arrow(90), '#5ED08A')],
    ['ranura-f', slot(rep, '#9B6BFF')]
  ]);
  sp('repite', 'Repite', [['repite-a', svg(`<rect x="6" y="6" width="108" height="108" rx="18" fill="#9B6BFF" ${st(4)}/>${rep}`)]]);
  sp('boton', 'Botón', [
    ['boton-a', svg(`<rect x="6" y="14" width="108" height="92" rx="22" fill="#34C26B" ${st(4)}/><path d="M44 34 L86 60 L44 86 Z" fill="#fff" ${st(4)}/>`)],
    ['boton-b', svg(`<rect x="6" y="14" width="108" height="92" rx="22" fill="#E2554D" ${st(4)}/><path d="M42 38 L78 82 M78 38 L42 82" stroke="#fff" stroke-width="10" stroke-linecap="round"/>`)],
    ['boton-c', svg(`<rect x="6" y="14" width="108" height="92" rx="22" fill="#FFA63D" ${st(4)}/><path d="M78 40 H52 Q38 40 38 54 Q38 68 52 68 H80 M66 28 L78 40 L66 52" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`)]
  ]);
  sp('casilla', 'Casilla meta', [['casilla-a', svg(`<rect x="8" y="8" width="104" height="104" rx="16" fill="#FFE766" fill-opacity=".75" stroke="#F2A900" stroke-width="5" stroke-dasharray="10 7"/><path d="M42 24 V98" stroke="#C9D3DD" stroke-width="6" stroke-linecap="round"/><path d="M46 28 H88 L76 44 L88 60 H46 Z" fill="#FF3355" ${st(3)}/>`)]]);

  /* ====================================================================
   *  2.º DE PRIMARIA · El colegio recicla (residuos nuevos, contenedores
   *  marrón y gris, camión, planta, robot de suelo con tarjetas relativas)
   * ==================================================================== */
  const platano = svg(`
    <path d="M22 70 Q20 28 62 22 Q96 20 100 52 Q80 40 60 48 Q38 56 36 88 Z" fill="#FFE04A" ${st()}/>
    <path d="M36 88 Q40 100 56 104 Q40 84 60 66 Q84 52 100 52" fill="#F2C318" ${st()}/>
    <path d="M62 22 L66 10 L74 12" fill="none" stroke="#7A5A2B" stroke-width="5" stroke-linecap="round"/>
    <circle cx="48" cy="40" r="2.4" fill="#A9781E"/><circle cx="76" cy="38" r="2.4" fill="#A9781E"/>
    ${face(58, 58, .9)}`);
  const manzana = svg(`
    <path d="M30 18 Q60 30 90 18 Q98 40 84 56 Q70 50 60 58 Q50 50 36 56 Q22 40 30 18 Z" fill="#E2554D" ${st()}/>
    <path d="M36 56 Q50 50 60 58 Q70 50 84 56 L82 66 Q70 62 60 70 Q50 62 38 66 Z" fill="#FFF1D2" ${st()}/>
    <path d="M38 66 Q50 62 60 70 Q70 62 82 66 Q98 82 86 98 Q70 106 60 94 Q50 106 34 98 Q22 82 38 66 Z" fill="#E2554D" ${st()}/>
    <path d="M60 18 Q58 8 66 4" fill="none" stroke="#7A5A2B" stroke-width="5" stroke-linecap="round"/>
    ${face(60, 84, .8)}`);
  const lapiz = svg(`
    <path d="M14 96 L26 62 L44 70 L36 100 Z" fill="#FFD21F" ${st()}/>
    <path d="M26 62 L34 36 L52 44 L44 70 Z" fill="#FF8DB5" ${st()}/>
    <path d="M44 66 L88 48 L96 60 L50 84 Z" fill="#FFD21F" ${st()}/>
    <path d="M88 48 L108 40 L104 60 L96 60 Z" fill="#F2D2A0" ${st()}/><path d="M104 40 L108 40 L104 48 Z" fill="${O}"/>
    <path d="M30 40 L28 24 L38 26 Z M52 44 L56 28" fill="none" stroke="${O}" stroke-width="3" stroke-linecap="round"/>
    ${face(60, 74, .7)}`);
  const bolsa = svg(`
    <path d="M26 20 Q36 14 46 20 Q56 14 66 20 Q76 14 86 20 L92 100 Q60 112 28 100 Z" fill="#F29A2E" ${st()}/>
    <path d="M26 20 L92 20 M28 98 L92 98" fill="none" ${st(2.4)}/>
    <ellipse cx="60" cy="54" rx="22" ry="16" fill="#FFE766" ${st(2.6)}/>
    <path d="M40 74 q20 14 40 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>
    ${face(60, 52, .8)}`);
  const botella = svg(`
    <rect x="46" y="6" width="28" height="14" rx="4" fill="#3B82F6" ${st()}/>
    <path d="M50 20 H70 V32 Q92 42 92 62 V100 Q92 110 82 110 H38 Q28 110 28 100 V62 Q28 42 50 32 Z" fill="#BFE8FF" fill-opacity=".85" ${st()}/>
    <path d="M30 70 H90 V100 Q90 108 82 108 H38 Q30 108 30 100 Z" fill="#59B7FF" opacity=".6"/>
    <path d="M38 52 V90" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>
    ${face(62, 76, .95)}`);
  const cuaderno = svg(`
    <rect x="22" y="12" width="78" height="96" rx="8" fill="#5FA8FF" ${st()}/>
    <rect x="34" y="12" width="66" height="96" rx="6" fill="#fff" ${st()}/>
    <g fill="#8FA2B8"><circle cx="28" cy="26" r="3.4"/><circle cx="28" cy="46" r="3.4"/><circle cx="28" cy="66" r="3.4"/><circle cx="28" cy="86" r="3.4"/></g>
    <path d="M44 28 H90 M44 38 H90 M44 48 H70" fill="none" stroke="#9AA3B2" stroke-width="3" stroke-linecap="round"/>
    ${face(68, 78, .85)}`);
  sp('residuoc', 'Residuo del cole', [
    ['residuoc-a', lata], ['residuoc-b', brik], ['residuoc-c', periodico], ['residuoc-d', caja], ['residuoc-e', tarro],
    ['residuoc-f', platano], ['residuoc-g', manzana], ['residuoc-h', lapiz], ['residuoc-i', bolsa], ['residuoc-j', botella], ['residuoc-k', cuaderno]
  ]);
  /* contenedores marrón (orgánico) y gris (resto) */
  const marron = cont.costumes[0][1].replace(/#FFD21F/g, '#9C6B3C').replace(/#F2A900/g, '#6B4423');
  const iconM = '<g fill="#fff" stroke="#3a2c4f" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M60 52 Q76 52 76 70 Q76 90 60 90 Q44 90 44 70 Q44 52 60 52 Z"/><path d="M60 52 Q60 44 68 42" fill="none"/></g>';
  cont.costumes.push(['contenedor-d', marron.replace(/<g fill="#fff"[\s\S]*?<\/g>/, iconM)]);
  const gris = cont.costumes[0][1].replace(/#FFD21F/g, '#9AA3B2').replace(/#F2A900/g, '#6B7482');
  const iconG = '<g fill="#fff" stroke="#3a2c4f" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M46 56 H74 L71 92 H49 Z"/><path d="M42 56 H78 M54 50 H66"/><path d="M55 64 V84 M65 64 V84" fill="none"/></g>';
  cont.costumes.push(['contenedor-e', gris.replace(/<g fill="#fff"[\s\S]*?<\/g>/, iconG)]);
  /* reciclaje: camión, planta recicladora y lata nueva */
  const camion = svg(`
    <rect x="6" y="40" width="70" height="44" rx="8" fill="#34C26B" ${st()}/>
    <path d="M76 52 H98 L110 68 V84 H76 Z" fill="#FFD21F" ${st()}/><path d="M84 58 H96 L104 68 H84 Z" fill="#BFE8FF" ${st(2.4)}/>
    <path d="M16 54 q10-10 20 0 M26 48 l-4 -4 M26 48 l5 -3" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
    <circle cx="30" cy="88" r="12" fill="#4B4458" ${st()}/><circle cx="30" cy="88" r="4.4" fill="#C9D3DD"/>
    <circle cx="92" cy="88" r="12" fill="#4B4458" ${st()}/><circle cx="92" cy="88" r="4.4" fill="#C9D3DD"/>
    ${face(50, 70, .9)}`);
  const fabrica = svg(`
    <path d="M8 104 V58 L38 76 V58 L68 76 V40 H102 V104 Z" fill="#B9C3CE" ${st()}/>
    <rect x="76" y="14" width="14" height="28" fill="#E2554D" ${st()}/>
    <g fill="#fff" opacity=".9"><circle cx="84" cy="10" r="6"/><circle cx="96" cy="4" r="5"/></g>
    <rect x="18" y="82" width="14" height="14" fill="#FFE766" ${st(2.4)}/><rect x="46" y="82" width="14" height="14" fill="#FFE766" ${st(2.4)}/><rect x="78" y="62" width="14" height="14" fill="#FFE766" ${st(2.4)}/>
    <path d="M70 104 V90 H96 V104" fill="#5FA8FF" ${st(2.4)}/>
    <path d="M14 112 H106" stroke="${O}" stroke-width="4" stroke-linecap="round"/>`);
  const latanueva = svg(`
    <g fill="#FFD21F" ${st(2)}><path d="M20 24 l4 -10 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 Z"/><path d="M98 20 l3 -7 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 Z"/></g>
    <ellipse cx="60" cy="30" rx="26" ry="9" fill="#EDF1F5" ${st()}/>
    <path d="M34 30 V96 Q34 108 60 108 Q86 108 86 96 V30 Q86 40 60 40 Q34 40 34 30 Z" fill="#CFE9FF" ${st()}/>
    <path d="M34 54 H86 V88 H34 Z" fill="#3FB27F" ${st(2.6)}/>
    <path d="M44 36 V104" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
    ${face(62, 71, 1.05)}`);
  sp('reciclado', 'Reciclaje', [['reciclado-a', camion], ['reciclado-b', fabrica], ['reciclado-c', latanueva]]);
  /* tarjetas de dirección relativa (tipo robot de suelo) */
  const giroI = '<path d="M80 100 V62 Q80 40 58 40 H34 M50 24 L32 40 L50 56" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>';
  const giroD = '<path d="M40 100 V62 Q40 40 62 40 H86 M70 24 L88 40 L70 56" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>';
  sp('tarjetar', 'Tarjeta de dirección', [
    ['tarjetar-a', slot('')],
    ['tarjetar-b', slot(arrow(0), '#59B7FF')], ['tarjetar-c', slot(arrow(180), '#FFA63D')],
    ['tarjetar-d', slot(giroI, '#FF6FA8')], ['tarjetar-e', slot(giroD, '#5ED08A')],
    ['tarjetar-f', slot(rep, '#9B6BFF')]
  ]);
  /* robot de suelo visto desde arriba (mira hacia arriba) */
  sp('robotsuelo', 'Robot de suelo', [['robotsuelo-a', svg(`<g transform="rotate(90 60 60)">
    <rect x="14" y="30" width="12" height="34" rx="5" fill="#4B4458" ${st(2.6)}/><rect x="94" y="30" width="12" height="34" rx="5" fill="#4B4458" ${st(2.6)}/>
    <rect x="14" y="70" width="12" height="30" rx="5" fill="#4B4458" ${st(2.6)}/><rect x="94" y="70" width="12" height="30" rx="5" fill="#4B4458" ${st(2.6)}/>
    <rect x="22" y="10" width="76" height="102" rx="30" fill="#4C97FF" ${st()}/>
    <rect x="34" y="52" width="52" height="48" rx="18" fill="#8EC1FF" ${st(2.6)}/>
    <path d="M60 4 L78 24 H42 Z" fill="#FFD21F" ${st(3)}/>
    <circle cx="46" cy="34" r="8" fill="#fff" ${st(2.6)}/><circle cx="74" cy="34" r="8" fill="#fff" ${st(2.6)}/>
    <circle cx="46" cy="32" r="3.4" fill="${O}"/><circle cx="74" cy="32" r="3.4" fill="${O}"/>
    <circle cx="60" cy="76" r="9" fill="#FF6FA8" ${st(2.6)}/></g>`)]]);
  /* obstáculos del patio */
  const cono = svg(`
    <path d="M10 104 H110 V112 H10 Z" fill="#F2A900" ${st()}/>
    <path d="M60 8 L92 104 H28 Z" fill="#FF7A1A" ${st()}/>
    <path d="M50 38 H70 L74 52 H46 Z" fill="#fff" ${st(2.6)}/><path d="M41 68 H79 L83 82 H37 Z" fill="#fff" ${st(2.6)}/>`);
  const charco = svg(`
    <path d="M10 66 Q8 34 40 32 Q54 18 76 30 Q108 32 108 62 Q110 94 78 96 Q56 106 34 96 Q10 94 10 66 Z" fill="#5FB8F5" ${st()}/>
    <path d="M30 56 q10-10 20 0 M64 70 q10-10 20 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/>
    <path d="M70 46 q6-5 12 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`);
  sp('obstaculoc', 'Obstáculo del patio', [['obstaculoc-a', cono], ['obstaculoc-b', charco]]);

  /* ---------- fondos ---------- */
  const B = (id, name, inner) => {
    const s = '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">' + inner + '</svg>';
    PQ.BACKDROP_LIB.push({ id, name, svg: s.replace(/id="(\w+)"/g, 'id="' + id + '_$1"').replace(/url\(#(\w+)\)/g, 'url(#' + id + '_$1)') });
  };
  /* rejilla 5x5 de 56 px: columnas x = -230..50, filas y = 158..-122 (en coordenadas de escenario) */
  const grid = (cA, cB, lineCol) => {
    let s = '';
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) s += `<rect x="${10 + c * 56}" y="${22 + r * 56}" width="56" height="56" fill="${(r + c) % 2 ? cA : cB}"/>`;
    return s + `<rect x="10" y="22" width="280" height="280" fill="none" stroke="${lineCol}" stroke-width="5" rx="4"/>`;
  };
  const panelBg = '<rect x="300" y="14" width="172" height="244" rx="14" fill="#fff" opacity=".88"/><rect x="8" y="310" width="464" height="44" rx="12" fill="#fff" opacity=".88"/>';
  B('pc-playa', 'Playa limpia', `
    <defs><linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ADFFF"/><stop offset="1" stop-color="#E6F7FF"/></linearGradient></defs>
    <rect width="480" height="360" fill="url(#c)"/><rect y="150" width="480" height="210" fill="#F6DDA3"/>
    ${grid('#F9E7B8', '#F2D58C', '#C99A3C')}${panelBg}`);
  B('pc-isla', 'Isla de la energía', `
    <defs><linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8EDBFF"/><stop offset="1" stop-color="#E8F8FF"/></linearGradient></defs>
    <rect width="480" height="360" fill="url(#c)"/><rect y="250" width="480" height="110" fill="#3FA7E8"/>
    ${grid('#BFE8A6', '#A6DB8B', '#4C8A3A')}${panelBg}`);
  B('pc-espacio', 'Misión espacial', `
    <defs><radialGradient id="c" cx=".4" cy=".35" r="1"><stop offset="0" stop-color="#2B2A6B"/><stop offset="1" stop-color="#0B0B2A"/></radialGradient></defs>
    <rect width="480" height="360" fill="url(#c)"/>
    <g fill="#fff"><circle cx="30" cy="12" r="2"/><circle cx="150" cy="8" r="1.6"/><circle cx="300" cy="6" r="2"/><circle cx="460" cy="10" r="1.8"/><circle cx="470" cy="300" r="2"/><circle cx="20" cy="330" r="1.8"/><circle cx="250" cy="345" r="2"/></g>
    ${grid('#3B3A86', '#2E2D72', '#8B88F0')}${panelBg}`);
  B('pc-casa-energia', 'Casa con energía limpia', `
    <defs><linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FD3FF"/><stop offset="1" stop-color="#E3F6FF"/></linearGradient></defs>
    <rect width="480" height="360" fill="url(#c)"/>
    <g fill="#fff" opacity=".95"><ellipse cx="90" cy="60" rx="40" ry="16"/><ellipse cx="68" cy="50" rx="22" ry="16"/><ellipse cx="116" cy="46" rx="24" ry="18"/><ellipse cx="380" cy="86" rx="34" ry="13"/><ellipse cx="362" cy="76" rx="18" ry="13"/></g>
    <path d="M0 250 Q120 200 240 240 T480 230 V360 H0 Z" fill="#7CC77A"/><path d="M0 290 Q140 260 260 290 T480 280 V360 H0 Z" fill="#5DB766"/>
    <rect y="326" width="480" height="34" fill="#4FA95A"/>`);
  B('pc-cielo-estrellas', 'Cielo de estrellas', `
    <defs><linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B0B2A"/><stop offset="1" stop-color="#3A2C7A"/></linearGradient></defs>
    <rect width="480" height="360" fill="url(#c)"/>
    <g fill="#fff" opacity=".9"><circle cx="30" cy="30" r="1.8"/><circle cx="110" cy="80" r="1.4"/><circle cx="210" cy="24" r="1.8"/><circle cx="330" cy="60" r="1.6"/><circle cx="440" cy="30" r="1.8"/><circle cx="60" cy="150" r="1.4"/><circle cx="420" cy="140" r="1.4"/><circle cx="20" cy="250" r="1.6"/><circle cx="460" cy="250" r="1.8"/></g>
    <path d="M0 330 Q120 300 240 322 T480 316 V360 H0 Z" fill="#1B1650"/>`);
  B('pc-sistema-solar', 'Sistema solar', `
    <defs><radialGradient id="c" cx=".12" cy=".5" r="1.1"><stop offset="0" stop-color="#4A2C6E"/><stop offset="1" stop-color="#0B0B2A"/></radialGradient></defs>
    <rect width="480" height="360" fill="url(#c)"/>
    <g fill="#fff" opacity=".9"><circle cx="190" cy="30" r="1.8"/><circle cx="260" cy="320" r="1.8"/><circle cx="330" cy="70" r="1.4"/><circle cx="420" cy="300" r="1.8"/><circle cx="450" cy="40" r="1.8"/><circle cx="380" cy="190" r="1.4"/><circle cx="130" cy="340" r="1.4"/></g>
    <circle cx="-40" cy="180" r="120" fill="#FFB300"/><circle cx="-40" cy="180" r="150" fill="#FFB300" opacity=".25"/>`);
  B('pc-cole', 'Patio del cole', `
    <defs><linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8EDBFF"/><stop offset="1" stop-color="#E8F8FF"/></linearGradient></defs>
    <rect width="480" height="360" fill="url(#c)"/>
    <rect x="30" y="70" width="420" height="120" fill="#FFE7B8" stroke="#3a2c4f" stroke-width="4"/>
    <path d="M20 70 L240 20 L460 70 Z" fill="#D9573F" stroke="#3a2c4f" stroke-width="4" stroke-linejoin="round"/>
    <g fill="#BFE8FF" stroke="#3a2c4f" stroke-width="3"><rect x="56" y="92" width="44" height="40"/><rect x="130" y="92" width="44" height="40"/><rect x="306" y="92" width="44" height="40"/><rect x="380" y="92" width="44" height="40"/></g>
    <rect x="212" y="120" width="56" height="70" rx="6" fill="#A86A3A" stroke="#3a2c4f" stroke-width="3"/>
    <path d="M440 20 V70" stroke="#3a2c4f" stroke-width="4"/><path d="M440 20 H468 V38 H440" fill="#34C26B" stroke="#3a2c4f" stroke-width="3"/>
    <rect y="190" width="480" height="170" fill="#C9CFD8"/><rect y="190" width="480" height="10" fill="#9AA3B2"/>
    <path d="M0 250 H480 M0 310 H480" stroke="#fff" stroke-width="4" stroke-dasharray="26 16" opacity=".7"/>`);
  B('pc-cole-grid', 'Patio del cole con cuadrícula', `
    <defs><linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8EDBFF"/><stop offset="1" stop-color="#E8F8FF"/></linearGradient></defs>
    <rect width="480" height="360" fill="url(#c)"/><rect y="150" width="480" height="210" fill="#B9C1CC"/>
    ${grid('#D5DAE2', '#C6CCD6', '#6B7482')}${panelBg}`);
  PQ.PC_READY = true;
});
