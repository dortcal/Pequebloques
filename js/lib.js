/* PequeBloques — diseñado por David OZC
 * lib.js: biblioteca ORIGINAL de personajes, fondos y sonidos (SVG y audio sintetizado)
 * Todos los dibujos son creaciones propias; con aire canario.
 */
(function (g) {
  'use strict';
  const PQ = g.PQ = g.PQ || {};

  const O = '#3a2c4f';   // contorno
  const svg = (inner) => '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">' + inner + '</svg>';
  const st = (w) => `stroke="${O}" stroke-width="${w || 3}" stroke-linecap="round" stroke-linejoin="round"`;

  /* ====================== PERSONAJES ====================== */
  const SPRITES = [];
  function sp(id, name, costumes) { SPRITES.push({ id, name, costumes }); }

  // 1. Canario
  const canario = (up) => svg(`
    <path d="M22 66 L4 54 L8 78 Z" fill="#FFB300" ${st()}/>
    <ellipse cx="56" cy="68" rx="34" ry="29" fill="#FFD91A" ${st()}/>
    <circle cx="84" cy="42" r="21" fill="#FFD91A" ${st()}/>
    <path d="M102 38 L118 44 L102 50 Z" fill="#FF8A1F" ${st(2.5)}/>
    <circle cx="90" cy="37" r="5" fill="#fff" ${st(2)}/><circle cx="91.5" cy="37.5" r="2.6" fill="${O}"/>
    <path d="M70 26 q-3-8 2-12 M78 22 q0-9 7-11" fill="none" ${st(3)}/>
    ${up ? `<path d="M40 62 Q30 24 64 30 Q70 52 44 66 Z" fill="#FFB300" ${st()}/>`
         : `<path d="M40 64 Q54 92 80 70 Q64 58 40 64 Z" fill="#FFB300" ${st()}/>`}
    <path d="M50 96 v10 M62 96 v10 M44 106 h12 M56 106 h12" fill="none" stroke="#FF8A1F" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="82" cy="52" r="4" fill="#FF9AA8" opacity=".7"/>`);
  sp('canario', 'Canario', [['canario-a', canario(false)], ['canario-b', canario(true)]]);

  // 2. Lagarto gigante
  const lagarto = (f) => svg(`
    <path d="M30 70 Q8 74 6 96 Q5 106 16 100 Q22 86 38 82 Z" fill="#6BBF4E" ${st()}/>
    <ellipse cx="62" cy="68" rx="34" ry="19" fill="#7ACB57" ${st()}/>
    <path d="M40 60 q6-4 12 0 M58 56 q6-4 12 0 M76 60 q6-4 12 0" fill="none" stroke="#4E9A38" stroke-width="3" stroke-linecap="round"/>
    <path d="M88 64 Q112 56 114 70 Q112 82 90 80 Z" fill="#7ACB57" ${st()}/>
    <circle cx="98" cy="62" r="5.5" fill="#fff" ${st(2)}/><circle cx="99.5" cy="62" r="2.6" fill="${O}"/>
    <path d="M104 74 q5 2 8 0" fill="none" ${st(2.2)}/>
    ${f ? `<path d="M44 82 l-10 16 M78 82 l12 14 M52 84 l8 14 M70 84 l-6 14" fill="none" ${st(6)}/>`
        : `<path d="M44 82 l-4 18 M78 82 l4 18 M54 84 l-8 14 M70 84 l8 14" fill="none" ${st(6)}/>`}
    <path d="M44 82 l-4 18 M78 82 l4 18" fill="none" opacity="0"/>`);
  sp('lagarto', 'Lagarto', [['lagarto-a', lagarto(false)], ['lagarto-b', lagarto(true)]]);

  // 3. Pez
  const pez = (t) => svg(`
    <path d="${t ? 'M30 60 L6 36 L10 60 L6 86 Z' : 'M30 60 L8 44 Q16 60 8 76 Z'}" fill="#FF7A3D" ${st()}/>
    <ellipse cx="62" cy="60" rx="38" ry="28" fill="#FFA24D" ${st()}/>
    <path d="M52 34 Q62 16 78 34 Z" fill="#FF7A3D" ${st()}/>
    <path d="M46 40 q-6 20 0 40 M62 34 q-6 26 0 52" fill="none" stroke="#FF7A3D" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="86" cy="52" r="8" fill="#fff" ${st(2.5)}/><circle cx="88" cy="52" r="3.8" fill="${O}"/>
    <path d="M92 72 q6 2 10-2" fill="none" ${st(2.5)}/>
    <circle cx="106" cy="38" r="3" fill="#BFE9FF" stroke="#6FB7E6" stroke-width="1.5"/><circle cx="112" cy="26" r="2" fill="#BFE9FF" stroke="#6FB7E6" stroke-width="1.2"/>`);
  sp('pez', 'Pez', [['pez-a', pez(false)], ['pez-b', pez(true)]]);

  // 4. Tortuga (marina)
  const tortuga = (a) => svg(`
    <path d="${a ? 'M28 74 L10 96 L30 90 Z' : 'M28 74 L8 82 L26 94 Z'}" fill="#7ED6A0" ${st()}/>
    <path d="M80 84 l14 14 -20 -2 Z" fill="#7ED6A0" ${st()}/>
    <circle cx="100" cy="62" r="17" fill="#8FE0AD" ${st()}/>
    <circle cx="104" cy="58" r="4.4" fill="#fff" ${st(2)}/><circle cx="105.4" cy="58.4" r="2.1" fill="${O}"/>
    <path d="M102 70 q5 3 10 0" fill="none" ${st(2.2)}/>
    <path d="M20 78 Q22 28 62 26 Q102 28 100 78 Z" fill="#3FAE74" ${st()}/>
    <path d="M44 78 L40 52 L62 40 L84 52 L80 78 M40 52 L22 60 M84 52 L98 60 M62 40 V28" fill="none" stroke="#2A8A57" stroke-width="3" stroke-linejoin="round"/>
    <path d="M32 78 h66 v6 q-33 10 -66 0 Z" fill="#F5D88F" ${st()}/>`);
  sp('tortuga', 'Tortuga', [['tortuga-a', tortuga(false)], ['tortuga-b', tortuga(true)]]);

  // 5. Cangrejo
  const cangrejo = (u) => svg(`
    <path d="M30 70 l-14 14 M34 78 l-12 18 M90 70 l14 14 M86 78 l12 18" fill="none" ${st(5)}/>
    <path d="${u ? 'M30 58 L12 28 Q24 20 34 30 L28 40 L40 44 Z' : 'M30 60 L8 50 Q8 36 22 38 L26 48 L38 46 Z'}" fill="#FF5B4D" ${st()}/>
    <path d="${u ? 'M90 58 L108 28 Q96 20 86 30 L92 40 L80 44 Z' : 'M90 60 L112 50 Q112 36 98 38 L94 48 L82 46 Z'}" fill="#FF5B4D" ${st()}/>
    <ellipse cx="60" cy="72" rx="36" ry="24" fill="#FF6E5E" ${st()}/>
    <path d="M48 52 v-10 M72 52 v-10" fill="none" ${st(3)}/>
    <circle cx="48" cy="38" r="7" fill="#fff" ${st(2.5)}/><circle cx="48" cy="38" r="3" fill="${O}"/>
    <circle cx="72" cy="38" r="7" fill="#fff" ${st(2.5)}/><circle cx="72" cy="38" r="3" fill="${O}"/>
    <path d="M50 80 q10 8 20 0" fill="none" ${st(3)}/>`);
  sp('cangrejo', 'Cangrejo', [['cangrejo-a', cangrejo(false)], ['cangrejo-b', cangrejo(true)]]);

  // 6. Robot
  const robot = (b) => svg(`
    <path d="M60 14 v14" fill="none" ${st()}/><circle cx="60" cy="12" r="6" fill="#FF5B7F" ${st(2.5)}/>
    <rect x="24" y="28" width="72" height="50" rx="14" fill="#9FB6C9" ${st()}/>
    <rect x="34" y="38" width="52" height="28" rx="9" fill="#2B3A55" ${st(2.5)}/>
    ${b ? `<path d="M42 52 h14 M66 52 h14" fill="none" stroke="#7DF0FF" stroke-width="5" stroke-linecap="round"/>`
        : `<circle cx="49" cy="52" r="7" fill="#7DF0FF"/><circle cx="71" cy="52" r="7" fill="#7DF0FF"/>`}
    <rect x="32" y="82" width="56" height="26" rx="8" fill="#B9CCDB" ${st()}/>
    <circle cx="48" cy="95" r="5" fill="#FFD21F" ${st(2)}/><circle cx="72" cy="95" r="5" fill="#59D98E" ${st(2)}/>
    <path d="${b ? 'M32 90 L12 74 M88 90 L108 74' : 'M32 90 L14 102 M88 90 L106 102'}" fill="none" ${st(6)}/>
    <path d="M44 108 v6 M76 108 v6" fill="none" ${st(6)}/>
    <rect x="16" y="46" width="8" height="14" rx="3" fill="#7B93A8" ${st(2.5)}/><rect x="96" y="46" width="8" height="14" rx="3" fill="#7B93A8" ${st(2.5)}/>`);
  sp('robot', 'Robot', [['robot-a', robot(false)], ['robot-b', robot(true)]]);

  // 7. Cohete
  const cohete = (f) => svg(`
    <path d="${f ? 'M46 88 Q60 126 74 88 Z' : 'M50 88 Q60 110 70 88 Z'}" fill="#FF9F1C" ${st()}/>
    <path d="${f ? 'M52 88 Q60 108 68 88 Z' : 'M54 88 Q60 100 66 88 Z'}" fill="#FFE066"/>
    <path d="M38 80 L18 98 L22 70 Q30 56 40 62 Z" fill="#FF5B7F" ${st()}/>
    <path d="M82 80 L102 98 L98 70 Q90 56 80 62 Z" fill="#FF5B7F" ${st()}/>
    <path d="M60 6 Q92 30 84 88 L36 88 Q28 30 60 6 Z" fill="#F4F7FB" ${st()}/>
    <path d="M60 6 Q76 18 82 38 L38 38 Q44 18 60 6 Z" fill="#FF5B7F" ${st()}/>
    <circle cx="60" cy="58" r="12" fill="#7DD3FF" ${st()}/><circle cx="56" cy="54" r="3.5" fill="#fff" opacity=".85"/>
    <rect x="42" y="82" width="36" height="9" rx="4" fill="#9FB6C9" ${st(2.5)}/>`);
  sp('cohete', 'Cohete', [['cohete-a', cohete(false)], ['cohete-b', cohete(true)]]);

  // 8. Estrella
  sp('estrella', 'Estrella', [['estrella-a', svg(`
    <path d="M60 8 L74 42 L112 46 L84 70 L92 108 L60 88 L28 108 L36 70 L8 46 L46 42 Z" fill="#FFD91A" ${st()}/>
    <circle cx="50" cy="60" r="5" fill="${O}"/><circle cx="70" cy="60" r="5" fill="${O}"/>
    <circle cx="51.5" cy="58.5" r="1.6" fill="#fff"/><circle cx="71.5" cy="58.5" r="1.6" fill="#fff"/>
    <path d="M51 74 q9 9 18 0" fill="none" ${st(3)}/><circle cx="42" cy="70" r="4" fill="#FF9AA8" opacity=".7"/><circle cx="78" cy="70" r="4" fill="#FF9AA8" opacity=".7"/>`)],
  ['estrella-b', svg(`
    <path d="M60 8 L74 42 L112 46 L84 70 L92 108 L60 88 L28 108 L36 70 L8 46 L46 42 Z" fill="#FFE97A" ${st()}/>
    <path d="M44 60 q6-6 12 0 M64 60 q6-6 12 0" fill="none" ${st(3.5)}/>
    <path d="M50 72 q10 12 20 0 Z" fill="#FF7A7A" ${st(2.5)}/>`)]]);

  // 9. Plátano
  sp('platano', 'Plátano', [['platano-a', svg(`
    <path d="M30 20 Q24 10 34 8 Q40 14 38 22 Q96 28 106 84 Q108 100 94 100 Q92 62 50 46 Q34 40 30 20 Z" fill="#FFD91A" ${st()}/>
    <path d="M38 22 Q82 34 96 78" fill="none" stroke="#E8B800" stroke-width="3" stroke-linecap="round"/>
    <path d="M94 100 q6-2 10-8" fill="none" stroke="#6B4A2B" stroke-width="5" stroke-linecap="round"/>
    <circle cx="68" cy="58" r="3.6" fill="${O}"/><circle cx="84" cy="66" r="3.6" fill="${O}"/>
    <path d="M70 70 q8 7 16 0" fill="none" ${st(2.6)}/>`)]]);

  // 10. Flor
  const flor = (s) => svg(`
    <path d="M60 64 V112" fill="none" stroke="#3FAE74" stroke-width="7" stroke-linecap="round"/>
    <path d="M60 94 Q36 90 32 72 Q52 72 60 94 Z M60 100 Q84 96 90 78 Q68 78 60 100 Z" fill="#59D98E" ${st(2.5)}/>
    <g transform="translate(60 40) scale(${s})" fill="#FF6FA8" ${st(2.5)}>
      <ellipse cx="0" cy="-22" rx="11" ry="16"/><ellipse cx="0" cy="22" rx="11" ry="16"/>
      <ellipse cx="-22" cy="0" rx="16" ry="11"/><ellipse cx="22" cy="0" rx="16" ry="11"/>
      <ellipse cx="-15" cy="-15" rx="11" ry="15" transform="rotate(-45 -15 -15)"/><ellipse cx="15" cy="-15" rx="11" ry="15" transform="rotate(45 15 -15)"/>
      <ellipse cx="-15" cy="15" rx="11" ry="15" transform="rotate(45 -15 15)"/><ellipse cx="15" cy="15" rx="11" ry="15" transform="rotate(-45 15 15)"/>
    </g>
    <circle cx="60" cy="40" r="${11 * s}" fill="#FFD91A" ${st(2.5)}/>`);
  sp('flor', 'Flor', [['flor-a', flor(0.8)], ['flor-b', flor(0.95)]]);

  // 11. Niña (Lucía)
  const nina = (up) => svg(`
    <path d="M34 46 Q22 44 24 64 Q26 74 34 70 Z M86 46 Q98 44 96 64 Q94 74 86 70 Z" fill="#5B3A29" ${st(2.5)}/>
    <path d="${up ? 'M36 82 L16 56' : 'M36 82 L18 96'}" fill="none" stroke="#F2C7A1" stroke-width="9" stroke-linecap="round"/>
    <path d="${up ? 'M84 82 L104 56' : 'M84 82 L102 96'}" fill="none" stroke="#F2C7A1" stroke-width="9" stroke-linecap="round"/>
    <path d="M38 78 Q60 70 82 78 L92 112 L28 112 Z" fill="#FF6FA8" ${st()}/>
    <path d="M48 112 v6 M72 112 v6" fill="none" ${st(5)}/>
    <circle cx="60" cy="42" r="26" fill="#F8D5B4" ${st()}/>
    <path d="M34 40 Q36 14 60 14 Q86 14 86 40 Q76 24 60 28 Q44 24 34 40 Z" fill="#5B3A29" ${st(2.5)}/>
    <circle cx="51" cy="46" r="3.6" fill="${O}"/><circle cx="69" cy="46" r="3.6" fill="${O}"/>
    <path d="M52 56 q8 8 16 0" fill="none" ${st(3)}/><circle cx="44" cy="54" r="4" fill="#FF9AA8" opacity=".7"/><circle cx="76" cy="54" r="4" fill="#FF9AA8" opacity=".7"/>`);
  sp('lucia', 'Lucía', [['lucia-a', nina(false)], ['lucia-b', nina(true)]]);

  // 12. Niño (Yeray)
  const nino = (up) => svg(`
    <path d="${up ? 'M36 82 L16 56' : 'M36 82 L18 96'}" fill="none" stroke="#E9B98F" stroke-width="9" stroke-linecap="round"/>
    <path d="${up ? 'M84 82 L104 56' : 'M84 82 L102 96'}" fill="none" stroke="#E9B98F" stroke-width="9" stroke-linecap="round"/>
    <path d="M38 78 Q60 70 82 78 L88 108 L32 108 Z" fill="#4C97FF" ${st()}/>
    <path d="M42 108 v10 M78 108 v10" fill="none" stroke="#3a2c4f" stroke-width="7" stroke-linecap="round"/>
    <circle cx="60" cy="42" r="26" fill="#F0C9A2" ${st()}/>
    <path d="M34 40 Q32 12 62 12 Q90 12 86 40 Q80 24 60 26 Q44 24 34 40 Z" fill="#2E2A3C" ${st(2.5)}/>
    <circle cx="51" cy="46" r="3.6" fill="${O}"/><circle cx="69" cy="46" r="3.6" fill="${O}"/>
    <path d="M51 55 q9 9 18 0" fill="none" ${st(3)}/>`);
  sp('yeray', 'Yeray', [['yeray-a', nino(false)], ['yeray-b', nino(true)]]);

  // 13. Perro
  const perro = (w) => svg(`
    <path d="${w ? 'M22 66 Q6 52 12 36' : 'M22 66 Q6 62 6 46'}" fill="none" stroke="#B9783E" stroke-width="9" stroke-linecap="round"/>
    <ellipse cx="54" cy="74" rx="34" ry="22" fill="#D99A5B" ${st()}/>
    <path d="M32 90 v16 M46 94 v14 M66 94 v14 M80 90 v16" fill="none" ${st(7)}/>
    <circle cx="86" cy="48" r="24" fill="#D99A5B" ${st()}/>
    <path d="M68 36 Q58 26 56 48 Q62 60 72 54 Z" fill="#B9783E" ${st(2.5)}/>
    <ellipse cx="102" cy="56" rx="11" ry="9" fill="#F3D9B5" ${st(2.5)}/><ellipse cx="108" cy="52" rx="4.6" ry="3.6" fill="${O}"/>
    <circle cx="88" cy="42" r="4.4" fill="#fff" ${st(2)}/><circle cx="89.5" cy="42.5" r="2.2" fill="${O}"/>
    <path d="M100 64 q4 5 9 1" fill="none" ${st(2.2)}/>`);
  sp('perro', 'Perro', [['perro-a', perro(false)], ['perro-b', perro(true)]]);

  // 14. Mariposa
  const mari = (o) => svg(`
    <path d="${o ? 'M60 56 Q22 8 10 40 Q8 66 60 62 Z' : 'M60 56 Q40 22 30 44 Q28 62 60 62 Z'}" fill="#FF8AC1" ${st()}/>
    <path d="${o ? 'M60 56 Q98 8 110 40 Q112 66 60 62 Z' : 'M60 56 Q80 22 90 44 Q92 62 60 62 Z'}" fill="#FF8AC1" ${st()}/>
    <path d="${o ? 'M60 62 Q20 70 30 100 Q52 106 60 66 Z' : 'M60 62 Q40 72 44 92 Q56 98 60 66 Z'}" fill="#9966FF" ${st()}/>
    <path d="${o ? 'M60 62 Q100 70 90 100 Q68 106 60 66 Z' : 'M60 62 Q80 72 76 92 Q64 98 60 66 Z'}" fill="#9966FF" ${st()}/>
    <circle cx="${o ? 26 : 38}" cy="${o ? 38 : 46}" r="6" fill="#FFE066" ${st(2)}/><circle cx="${o ? 94 : 82}" cy="${o ? 38 : 46}" r="6" fill="#FFE066" ${st(2)}/>
    <ellipse cx="60" cy="62" rx="6" ry="26" fill="${O}"/>
    <path d="M56 38 Q50 22 42 20 M64 38 Q70 22 78 20" fill="none" ${st(2.5)}/>`);
  sp('mariposa', 'Mariposa', [['mariposa-a', mari(false)], ['mariposa-b', mari(true)]]);

  // 15. Guagua (autobús canario)
  sp('guagua', 'Guagua', [['guagua-a', svg(`
    <rect x="6" y="28" width="108" height="62" rx="14" fill="#2FB37D" ${st()}/>
    <rect x="6" y="64" width="108" height="14" fill="#F4F7FB" ${st(2.5)}/>
    <rect x="14" y="38" width="22" height="24" rx="5" fill="#BFE9FF" ${st(2.5)}/><rect x="42" y="38" width="22" height="24" rx="5" fill="#BFE9FF" ${st(2.5)}/>
    <rect x="70" y="38" width="22" height="24" rx="5" fill="#BFE9FF" ${st(2.5)}/><rect x="96" y="38" width="14" height="30" rx="4" fill="#BFE9FF" ${st(2.5)}/>
    <circle cx="32" cy="92" r="13" fill="#2E2A3C" ${st()}/><circle cx="32" cy="92" r="5" fill="#C9D3DD"/>
    <circle cx="86" cy="92" r="13" fill="#2E2A3C" ${st()}/><circle cx="86" cy="92" r="5" fill="#C9D3DD"/>
    <rect x="104" y="80" width="8" height="6" rx="2" fill="#FFD91A" ${st(2)}/>`)]]);

  // 16. Ballena (calderón)
  const ballena = (t) => svg(`
    <path d="${t ? 'M92 70 Q112 40 114 18 Q96 22 88 40 Q92 24 76 16 Q74 44 84 64 Z' : 'M92 74 Q112 82 116 100 Q98 100 88 86 Q92 100 76 106 Q74 90 84 76 Z'}" fill="#3F6FB5" ${st()}/>
    <path d="M12 74 Q8 38 46 34 Q86 32 96 66 Q98 86 70 92 Q34 100 12 74 Z" fill="#4C84CF" ${st()}/>
    <path d="M20 76 Q40 92 78 88 Q60 100 36 94 Q24 88 20 76 Z" fill="#CFE6FF" ${st(2.5)}/>
    <circle cx="30" cy="64" r="4.6" fill="#fff" ${st(2)}/><circle cx="31.4" cy="64.4" r="2.2" fill="${O}"/>
    <path d="M18 74 q6 5 12 2" fill="none" ${st(2.5)}/>
    <path d="M44 22 q-6-10 0-16 M52 22 q0-12 8-14 M60 22 q6-8 14-6" fill="none" stroke="#7FC4FF" stroke-width="3.5" stroke-linecap="round"/>`);
  sp('ballena', 'Ballena', [['ballena-a', ballena(false)], ['ballena-b', ballena(true)]]);

  // 17. Balón
  const balon = (r) => svg(`
    <g transform="rotate(${r} 60 60)"><circle cx="60" cy="60" r="42" fill="#fff" ${st()}/>
    <path d="M60 38 L80 52 L72 76 L48 76 L40 52 Z" fill="${O}"/>
    <path d="M60 38 V20 M80 52 L98 46 M72 76 L84 94 M48 76 L36 94 M40 52 L22 46" fill="none" ${st(3)}/>
    <path d="M44 24 Q60 16 76 24 M100 56 Q104 72 94 84 M26 84 Q16 72 20 56" fill="none" stroke="${O}" stroke-width="2.5" stroke-linecap="round" opacity=".5"/></g>`);
  sp('balon', 'Balón', [['balon-a', balon(0)], ['balon-b', balon(36)]]);

  // 18. Portero
  const portero = (up) => svg(`
    <path d="${up ? 'M42 52 L24 14' : 'M42 54 L16 72'}" fill="none" stroke="#F0C9A2" stroke-width="10" stroke-linecap="round"/>
    <path d="${up ? 'M78 52 L96 14' : 'M78 54 L104 72'}" fill="none" stroke="#F0C9A2" stroke-width="10" stroke-linecap="round"/>
    <circle cx="${up ? 22 : 13}" cy="${up ? 11 : 74}" r="9" fill="#6BD56B" ${st(2.5)}/><circle cx="${up ? 98 : 107}" cy="${up ? 11 : 74}" r="9" fill="#6BD56B" ${st(2.5)}/>
    <rect x="40" y="94" width="14" height="22" rx="5" fill="#2E2A3C" ${st(2.5)}/><rect x="66" y="94" width="14" height="22" rx="5" fill="#2E2A3C" ${st(2.5)}/>
    <rect x="38" y="46" width="44" height="52" rx="12" fill="#FF7A3D" ${st()}/>
    <rect x="38" y="82" width="44" height="16" rx="6" fill="#3a2c4f"/>
    <circle cx="60" cy="30" r="20" fill="#F0C9A2" ${st()}/>
    <path d="M40 28 Q40 8 60 8 Q82 8 80 28 Q72 18 60 20 Q48 18 40 28 Z" fill="#5B3A29" ${st(2.5)}/>
    <circle cx="53" cy="32" r="3" fill="${O}"/><circle cx="67" cy="32" r="3" fill="${O}"/>
    <path d="M53 40 q7 ${up ? 8 : 5} 14 0" fill="none" ${st(2.6)}/>
    <text x="60" y="72" font-size="18" font-weight="900" text-anchor="middle" fill="#fff" font-family="Arial,sans-serif">1</text>`);
  sp('portero', 'Portero', [['portero-a', portero(false)], ['portero-b', portero(true)]]);

  // 19. Mira (diana)
  sp('mira', 'Mira', [['mira-a', svg(`
    <circle cx="60" cy="60" r="38" fill="#FF3355" fill-opacity=".18" stroke="#FF3355" stroke-width="7"/>
    <circle cx="60" cy="60" r="18" fill="none" stroke="#FF3355" stroke-width="5"/>
    <path d="M60 8 V34 M60 86 V112 M8 60 H34 M86 60 H112" stroke="#FF3355" stroke-width="7" stroke-linecap="round"/>
    <circle cx="60" cy="60" r="5" fill="#FF3355"/>`)]]);

  // 20. Cofre del tesoro
  const cofre = (open) => svg(`
    <rect x="12" y="56" width="96" height="52" rx="8" fill="#B5713A" ${st()}/>
    <path d="M12 74 H108 M40 56 V108 M80 56 V108" fill="none" stroke="#8A5A32" stroke-width="3.5"/>
    ${open ? `<path d="M14 56 L8 24 Q60 6 112 24 L106 56 Z" fill="#C98445" ${st()}/>
      <ellipse cx="60" cy="56" rx="44" ry="8" fill="#FFD91A" ${st(2.5)}/>
      <circle cx="40" cy="48" r="7" fill="#FFE066" ${st(2)}/><circle cx="62" cy="44" r="8" fill="#FFD91A" ${st(2)}/><circle cx="82" cy="49" r="7" fill="#FFE066" ${st(2)}/>
      <path d="M16 12 l4 8 M60 2 v10 M104 12 l-4 8" stroke="#FFD91A" stroke-width="4" stroke-linecap="round"/>`
    : `<path d="M12 56 Q12 22 60 22 Q108 22 108 56 Z" fill="#C98445" ${st()}/><path d="M40 56 V26 M80 56 V26" fill="none" stroke="#8A5A32" stroke-width="3.5"/>`}
    <rect x="50" y="62" width="20" height="22" rx="5" fill="#FFD91A" ${st(2.5)}/><circle cx="60" cy="71" r="3.5" fill="${O}"/>`);
  sp('cofre', 'Cofre', [['cofre-a', cofre(false)], ['cofre-b', cofre(true)]]);

  // 21. Manzana
  sp('manzana', 'Manzana', [['manzana-a', svg(`
    <path d="M60 30 Q70 8 86 8 Q84 26 66 32" fill="#5DBB4A" ${st(2.8)}/>
    <path d="M60 32 Q40 18 22 38 Q8 62 28 92 Q42 112 60 104 Q78 112 92 92 Q112 62 98 38 Q80 18 60 32 Z" fill="#FF4D5E" ${st()}/>
    <path d="M30 44 Q24 58 30 72" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/>
    <circle cx="48" cy="62" r="4.6" fill="${O}"/><circle cx="74" cy="62" r="4.6" fill="${O}"/>
    <circle cx="49.5" cy="60.5" r="1.5" fill="#fff"/><circle cx="75.5" cy="60.5" r="1.5" fill="#fff"/>
    <path d="M52 74 q9 9 18 0" fill="none" ${st(3)}/><circle cx="40" cy="72" r="4.4" fill="#FF9AA8" opacity=".8"/><circle cx="82" cy="72" r="4.4" fill="#FF9AA8" opacity=".8"/>`)]]);

  // 22. Zanahoria
  sp('zanahoria', 'Zanahoria', [['zanahoria-a', svg(`
    <path d="M52 30 Q44 6 54 4 Q58 16 60 28 Q64 6 76 6 Q72 20 68 30 Z" fill="#4DBB5A" ${st(2.6)}/>
    <path d="M36 32 Q60 22 84 32 Q92 40 74 112 Q60 118 46 112 Q28 40 36 32 Z" fill="#FF8A1F" ${st()}/>
    <path d="M44 50 h10 M70 66 h10 M48 84 h9" stroke="#E56F00" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="51" cy="50" r="4.2" fill="${O}"/><circle cx="69" cy="50" r="4.2" fill="${O}"/>
    <circle cx="52" cy="48.8" r="1.4" fill="#fff"/><circle cx="70" cy="48.8" r="1.4" fill="#fff"/>
    <path d="M52 62 q8 8 16 0" fill="none" ${st(3)}/>`)]]);

  // 23. Vaso de agua
  sp('agua', 'Vaso de agua', [['agua-a', svg(`
    <path d="M26 20 H94 L84 108 Q60 116 36 108 Z" fill="#E8F7FF" ${st()}/>
    <path d="M31 50 H89 L84 108 Q60 116 36 108 Z" fill="#5FC3FF" ${st(2.5)}/>
    <path d="M38 40 q6-5 12 0 t12 0 t12 0" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".9"/>
    <circle cx="50" cy="72" r="4.2" fill="${O}"/><circle cx="70" cy="72" r="4.2" fill="${O}"/>
    <circle cx="51.4" cy="70.6" r="1.4" fill="#fff"/><circle cx="71.4" cy="70.6" r="1.4" fill="#fff"/>
    <path d="M52 84 q8 8 16 0" fill="none" ${st(3)}/>
    <path d="M96 12 q8 12 0 18 q-8-6 0-18 Z" fill="#7FD0FF" ${st(2)}/>`)]]);

  // 24. Caramelo (dulce: «de vez en cuando»)
  sp('caramelo', 'Caramelo', [['caramelo-a', svg(`
    <path d="M24 60 L6 44 L8 76 Z M96 60 L114 44 L112 76 Z" fill="#FF8AC1" ${st()}/>
    <circle cx="60" cy="60" r="34" fill="#FF6FA8" ${st()}/>
    <path d="M36 40 Q60 56 82 34 M30 62 Q60 78 90 58 M40 84 Q62 94 84 80" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".85"/>
    <circle cx="50" cy="56" r="3.6" fill="${O}"/><circle cx="70" cy="56" r="3.6" fill="${O}"/>
    <path d="M52 70 q8 -6 16 0" fill="none" ${st(2.8)}/>`)]]);

  // 25. Pergamino (mensaje escondido)
  sp('pergamino', 'Pergamino', [['pergamino-a', svg(`
    <rect x="22" y="22" width="76" height="76" fill="#FFF1C9" ${st()}/>
    <rect x="14" y="14" width="92" height="14" rx="7" fill="#E8C378" ${st()}/><rect x="14" y="92" width="92" height="14" rx="7" fill="#E8C378" ${st()}/>
    <path d="M34 42 H86 M34 54 H80 M34 66 H86 M34 78 H66" fill="none" stroke="#B5713A" stroke-width="4" stroke-linecap="round"/>
    <circle cx="86" cy="80" r="9" fill="#E2554D" ${st(2.2)}/><path d="M86 75 l2 4 4 .6 -3 3 .8 4 -3.8-2 -3.8 2 .8-4 -3-3 4-.6 Z" fill="#FFE066"/>`)]]);

  // 26. Cartel de información
  sp('cartel', 'Cartel', [['cartel-a', svg(`
    <rect x="54" y="78" width="12" height="38" fill="#8A5A32" ${st(2.5)}/>
    <rect x="8" y="14" width="104" height="68" rx="12" fill="#FFF3D0" ${st()}/>
    <rect x="15" y="21" width="90" height="54" rx="8" fill="none" stroke="#E8C378" stroke-width="4"/>
    <circle cx="60" cy="48" r="20" fill="#3D8BFF" ${st()}/>
    <rect x="56.5" y="46" width="7" height="16" rx="3" fill="#fff"/><circle cx="60" cy="38" r="4.2" fill="#fff"/>`)]]);

  // 27. Semilla
  sp('semilla', 'Semilla', [['semilla-a', svg(`
    <path d="M60 10 Q96 52 84 86 Q72 112 60 112 Q48 112 36 86 Q24 52 60 10 Z" fill="#7B4A2A" ${st()}/>
    <path d="M50 44 Q44 66 52 90" fill="none" stroke="#B5713A" stroke-width="5" stroke-linecap="round" opacity=".8"/>
    <circle cx="52" cy="66" r="3.6" fill="#fff"/><circle cx="70" cy="66" r="3.6" fill="#fff"/><circle cx="53" cy="66.5" r="1.8" fill="${O}"/><circle cx="71" cy="66.5" r="1.8" fill="${O}"/>
    <path d="M54 80 q6 5 12 0" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>`)]]);

  // 28. Bandera
  sp('bandera', 'Bandera', [['bandera-a', svg(`
    <path d="M34 8 V112" fill="none" stroke="#C9D3DD" stroke-width="7" stroke-linecap="round"/>
    <path d="M38 12 H100 L84 34 L100 56 H38 Z" fill="#FF3355" ${st()}/>
    <path d="M24 112 H48" stroke="${O}" stroke-width="5" stroke-linecap="round"/>`)]]);

  // 29. Botella de plástico (basura)
  sp('botella', 'Botella', [['botella-a', svg(`
    <rect x="46" y="6" width="28" height="14" rx="4" fill="#E2554D" ${st(2.8)}/>
    <path d="M48 20 H72 L74 38 Q92 48 92 72 V104 Q92 114 82 114 H38 Q28 114 28 104 V72 Q28 48 46 38 Z" fill="#CDEFFF" fill-opacity=".85" ${st()}/>
    <path d="M30 76 H90 V102 Q90 112 80 112 H40 Q30 112 30 102 Z" fill="#8FD3F5" opacity=".7"/>
    <rect x="32" y="62" width="56" height="18" fill="#59B7FF" ${st(2.5)}/>
    <circle cx="52" cy="92" r="3.4" fill="${O}"/><circle cx="68" cy="92" r="3.4" fill="${O}"/>
    <path d="M54 102 q6-5 12 0" fill="none" ${st(2.6)}/>`)]]);

  // 30. Premio (cartel final de ánimo)
  sp('premio', 'Premio', [['premio-a', svg(`
    <rect x="4" y="10" width="112" height="100" rx="12" fill="#FFF6D6" ${st(3)}/>
    <rect x="10" y="16" width="100" height="88" rx="8" fill="none" stroke="#FFC933" stroke-width="3" stroke-dasharray="6 4"/>
    <g ${st(2)}><path d="M48 14 H72 V28 Q72 40 60 42 Q48 40 48 28 Z" fill="#FFD91A"/><path d="M48 18 H42 Q42 30 50 32 M72 18 H78 Q78 30 70 32" fill="none"/><rect x="55" y="42" width="10" height="5" fill="#FFB300"/><rect x="50" y="47" width="20" height="5" rx="2" fill="#FFB300"/></g>
    <path d="M22 26 l3 7 7 .8 -5.3 4.8 1.6 7 -6.3-3.7 -6.3 3.7 1.6-7 -5.3-4.8 7-.8 Z" fill="#FF6FA8" transform="scale(.7) translate(10 8)"/>
    <path d="M98 26 l3 7 7 .8 -5.3 4.8 1.6 7 -6.3-3.7 -6.3 3.7 1.6-7 -5.3-4.8 7-.8 Z" fill="#59B7FF" transform="scale(.7) translate(30 8)"/>
    <g font-family="Arial,Helvetica,sans-serif" font-weight="900" text-anchor="middle" fill="${O}">
      <text x="60" y="66" font-size="11" fill="#E2554D">¡ENHORABUENA!</text>
      <text x="60" y="78" font-size="8.2">¡Lo has conseguido!</text>
      <text x="60" y="90" font-size="6.3" fill="#2A8A57">Las frutas y las verduras</text>
      <text x="60" y="98" font-size="6.3" fill="#2A8A57">nos hacen crecer fuertes</text>
    </g>`)]]);

  PQ.SPRITE_LIB = SPRITES;

  /* ====================== FONDOS 480x360 ====================== */
  const bg = (inner) => '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">' + inner + '</svg>';
  const BACKDROPS = [];
  function bd(id, name, svgText) {
    // ids de degradado únicos por fondo (evita choques si se incrustan varios SVG en una misma página)
    const pre = id + '_';
    svgText = svgText.replace(/id="(\w+)"/g, 'id="' + pre + '$1"').replace(/url\(#(\w+)\)/g, 'url(#' + pre + '$1)');
    BACKDROPS.push({ id, name, svg: svgText });
  }

  const cloud = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity=".95"><ellipse cx="0" cy="0" rx="34" ry="14"/><ellipse cx="-16" cy="-10" rx="18" ry="14"/><ellipse cx="10" cy="-14" rx="20" ry="16"/></g>`;

  bd('playa', 'Playa', bg(`
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5FB8FF"/><stop offset="1" stop-color="#C8EBFF"/></linearGradient>
    <linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2D8CE0"/><stop offset="1" stop-color="#57C4F0"/></linearGradient></defs>
    <rect width="480" height="360" fill="url(#s)"/>
    <circle cx="396" cy="74" r="38" fill="#FFE066"/><circle cx="396" cy="74" r="52" fill="#FFE066" opacity=".3"/>
    ${cloud(90, 70, 1.2)}${cloud(250, 46, .9)}
    <rect y="170" width="480" height="90" fill="url(#m)"/>
    <path d="M0 200 q30-10 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/>
    <path d="M0 236 q30-10 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/>
    <path d="M0 250 Q120 236 240 252 T480 244 V360 H0 Z" fill="#F7DFA0"/>
    <path d="M0 300 Q160 284 300 306 T480 296 V360 H0 Z" fill="#F0CE80"/>
    <path d="M60 330 Q56 270 76 226" fill="none" stroke="#8A5A32" stroke-width="12" stroke-linecap="round"/>
    <g fill="#3FAE74" stroke="#2A8A57" stroke-width="2"><path d="M76 226 Q40 214 20 236 Q50 224 76 232 Z"/><path d="M76 226 Q100 196 134 202 Q104 206 80 232 Z"/><path d="M76 226 Q70 190 94 172 Q82 196 80 230 Z"/><path d="M76 226 Q42 192 52 174 Q64 200 78 230 Z"/><path d="M76 226 Q124 226 140 250 Q108 234 76 234 Z"/></g>`));

  bd('teide', 'El Teide', bg(`
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3E8EF0"/><stop offset="1" stop-color="#BFE3FF"/></linearGradient></defs>
    <rect width="480" height="360" fill="url(#s)"/>
    ${cloud(70, 60, 1)}${cloud(380, 90, 1.1)}
    <path d="M0 250 L90 190 L150 226 L210 160 L240 100 L270 160 L330 222 L400 180 L480 240 V360 H0 Z" fill="#8C6B55"/>
    <path d="M210 160 L240 100 L270 160 L252 150 L240 164 L226 148 Z" fill="#fff"/>
    <path d="M240 100 L224 126 L240 118 L258 130 Z" fill="#fff" opacity=".0"/>
    <path d="M150 226 L210 160 L190 250 Z M330 222 L270 160 L292 250 Z" fill="#6F5240" opacity=".5"/>
    <rect x="0" y="238" width="480" height="30" fill="#fff" opacity=".78"/>
    <ellipse cx="90" cy="250" rx="90" ry="14" fill="#fff" opacity=".9"/><ellipse cx="380" cy="256" rx="110" ry="16" fill="#fff" opacity=".9"/><ellipse cx="240" cy="262" rx="100" ry="12" fill="#fff" opacity=".9"/>
    <path d="M0 290 Q120 262 240 288 T480 280 V360 H0 Z" fill="#6DBE5A"/>
    <path d="M0 320 Q160 300 320 326 T480 316 V360 H0 Z" fill="#4FA648"/>
    <g fill="#fff" stroke="#9AA" stroke-width="1"><circle cx="60" cy="318" r="4"/><circle cx="64" cy="326" r="4"/><circle cx="72" cy="320" r="4"/><circle cx="410" cy="330" r="4"/><circle cx="420" cy="322" r="4"/></g>`));

  bd('laurisilva', 'Bosque de laurisilva', bg(`
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFE9D2"/><stop offset="1" stop-color="#8FCB9F"/></linearGradient></defs>
    <rect width="480" height="360" fill="url(#s)"/>
    <g fill="#4A9A62" opacity=".6"><circle cx="40" cy="150" r="70"/><circle cx="150" cy="130" r="80"/><circle cx="290" cy="140" r="74"/><circle cx="420" cy="150" r="80"/></g>
    <g stroke="#6B4A2B" stroke-width="16" stroke-linecap="round"><path d="M60 360 V150"/><path d="M200 360 V120"/><path d="M340 360 V140"/><path d="M450 360 V160"/></g>
    <g fill="#2F8A4C"><circle cx="60" cy="130" r="60"/><circle cx="200" cy="100" r="68"/><circle cx="340" cy="120" r="62"/><circle cx="450" cy="140" r="56"/></g>
    <g fill="#3FAE66"><circle cx="40" cy="116" r="30"/><circle cx="190" cy="82" r="32"/><circle cx="352" cy="104" r="30"/><circle cx="440" cy="126" r="26"/></g>
    <rect y="240" width="480" height="40" fill="#fff" opacity=".35"/>
    <path d="M0 290 Q120 270 240 292 T480 284 V360 H0 Z" fill="#5CB46A"/>
    <path d="M0 326 Q160 308 320 330 T480 322 V360 H0 Z" fill="#3F9455"/>
    <g fill="#FFD91A"><circle cx="110" cy="310" r="5"/><circle cx="270" cy="324" r="5"/><circle cx="390" cy="306" r="5"/></g>`));

  bd('mar', 'Fondo del mar', bg(`
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5CD1FF"/><stop offset="1" stop-color="#1B5FB0"/></linearGradient></defs>
    <rect width="480" height="360" fill="url(#s)"/>
    <g stroke="#fff" opacity=".25" stroke-width="14"><path d="M120 0 L60 360"/><path d="M240 0 L220 360"/><path d="M360 0 L420 360"/></g>
    <path d="M0 310 Q120 290 240 312 T480 300 V360 H0 Z" fill="#F0D58A"/>
    <g fill="none" stroke="#2FBF71" stroke-width="9" stroke-linecap="round"><path d="M50 330 q-14-30 0-60 q14-30 0-56"/><path d="M80 334 q12-24 0-48"/><path d="M400 330 q-14-34 0-70 q12-26 0-50"/><path d="M430 334 q12-24 0-46"/></g>
    <g fill="#FF8A4D" stroke="#C25E2C" stroke-width="2"><path d="M180 330 q10-26 20 0 q10-26 20 0 q-20 10-40 0 Z"/></g>
    <g fill="#BFE9FF" stroke="#6FB7E6" stroke-width="2" opacity=".9"><circle cx="150" cy="200" r="7"/><circle cx="164" cy="170" r="5"/><circle cx="154" cy="140" r="4"/><circle cx="330" cy="220" r="8"/><circle cx="344" cy="184" r="5"/></g>`));

  bd('espacio', 'Espacio', bg(`
    <defs><radialGradient id="s" cx=".5" cy=".4" r=".9"><stop offset="0" stop-color="#2B2A6B"/><stop offset="1" stop-color="#0B0B2A"/></radialGradient></defs>
    <rect width="480" height="360" fill="url(#s)"/>
    <g fill="#fff"><circle cx="40" cy="40" r="2"/><circle cx="120" cy="90" r="1.6"/><circle cx="200" cy="30" r="2.2"/><circle cx="300" cy="70" r="1.8"/><circle cx="380" cy="30" r="2"/><circle cx="440" cy="110" r="1.6"/><circle cx="70" cy="180" r="1.8"/><circle cx="160" cy="250" r="2"/><circle cx="260" cy="200" r="1.6"/><circle cx="350" cy="260" r="2.2"/><circle cx="430" cy="210" r="1.8"/><circle cx="30" cy="300" r="1.8"/><circle cx="230" cy="320" r="2"/><circle cx="410" cy="320" r="1.6"/></g>
    <circle cx="400" cy="80" r="42" fill="#F4F0DC"/><g fill="#D9D3B6"><circle cx="386" cy="70" r="8"/><circle cx="414" cy="94" r="10"/><circle cx="398" cy="58" r="4"/></g>
    <circle cx="90" cy="270" r="48" fill="#4C97FF"/><path d="M60 250 Q90 238 120 252 Q104 262 84 258 Q70 266 60 250 Z M70 290 Q96 280 126 292 Q102 304 70 290 Z" fill="#59D98E"/>
    <ellipse cx="90" cy="270" rx="78" ry="10" fill="none" stroke="#FFD91A" stroke-width="4" opacity=".0"/>
    <circle cx="260" cy="130" r="22" fill="#FF8A4D"/><ellipse cx="260" cy="130" rx="38" ry="8" fill="none" stroke="#FFD9B5" stroke-width="4" transform="rotate(-18 260 130)"/>`));

  bd('campo', 'Campo y granja', bg(`
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8DD3FF"/><stop offset="1" stop-color="#E4F6FF"/></linearGradient></defs>
    <rect width="480" height="360" fill="url(#s)"/>
    <circle cx="70" cy="70" r="34" fill="#FFE066"/>${cloud(250, 60, 1.1)}${cloud(400, 100, .8)}
    <path d="M0 220 Q100 160 220 210 T480 190 V360 H0 Z" fill="#7BCB63"/>
    <path d="M0 270 Q140 230 300 270 T480 260 V360 H0 Z" fill="#5DB04F"/>
    <g transform="translate(320 150)"><rect x="0" y="40" width="80" height="60" fill="#E2554D" stroke="#3a2c4f" stroke-width="3"/><path d="M-8 44 L40 0 L88 44 Z" fill="#8A3B34" stroke="#3a2c4f" stroke-width="3"/><rect x="30" y="64" width="20" height="36" fill="#F4F7FB" stroke="#3a2c4f" stroke-width="3"/></g>
    <g stroke="#fff" stroke-width="5" fill="none"><path d="M0 318 H480"/><path d="M0 334 H480"/></g><g stroke="#fff" stroke-width="6"><path d="M40 308 V350"/><path d="M140 308 V350"/><path d="M240 308 V350"/><path d="M340 308 V350"/><path d="M440 308 V350"/></g>`));

  bd('pueblo', 'Pueblo canario', bg(`
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7AC4FF"/><stop offset="1" stop-color="#FFE9C4"/></linearGradient></defs>
    <rect width="480" height="360" fill="url(#s)"/>
    <path d="M0 200 L110 120 L220 190 L330 110 L480 200 V260 H0 Z" fill="#B58A6A"/>
    ${[['#FFFFFF', 10, 170, 90, 100], ['#FF8A4D', 108, 150, 80, 120], ['#FFD91A', 196, 176, 84, 94], ['#59B7FF', 288, 158, 80, 112], ['#FF6FA8', 376, 172, 90, 98]].map((h) =>
      `<g><rect x="${h[1]}" y="${h[2]}" width="${h[3]}" height="${h[4]}" fill="${h[0]}" stroke="#3a2c4f" stroke-width="3"/><path d="M${h[1] - 6} ${h[2] + 2} L${h[1] + h[3] / 2} ${h[2] - 28} L${h[1] + h[3] + 6} ${h[2] + 2} Z" fill="#C8553D" stroke="#3a2c4f" stroke-width="3"/><rect x="${h[1] + 14}" y="${h[2] + 22}" width="20" height="26" fill="#7AC4FF" stroke="#3a2c4f" stroke-width="2.5"/><rect x="${h[1] + h[3] - 34}" y="${h[2] + h[4] - 40}" width="22" height="40" fill="#7A4B2B" stroke="#3a2c4f" stroke-width="2.5"/></g>`).join('')}
    <rect y="268" width="480" height="92" fill="#8E8AA0"/><path d="M0 312 H480" stroke="#fff" stroke-width="5" stroke-dasharray="26 18"/>
    <rect y="262" width="480" height="10" fill="#C9C5D6"/>`));

  bd('aula', 'Aula', bg(`
    <rect width="480" height="360" fill="#FFE8B0"/>
    <rect y="250" width="480" height="110" fill="#C98F5B"/><path d="M0 250 H480" stroke="#8A5A32" stroke-width="5"/>
    <g stroke="#B27B49" stroke-width="3"><path d="M0 290 H480"/><path d="M0 330 H480"/><path d="M120 250 L60 360"/><path d="M240 250 V360"/><path d="M360 250 L420 360"/></g>
    <rect x="70" y="40" width="340" height="170" rx="10" fill="#2F6B55" stroke="#8A5A32" stroke-width="12"/>
    <path d="M110 90 q30-20 60 0 t60 0" fill="none" stroke="#fff" stroke-width="5" opacity=".75" stroke-linecap="round"/>
    <path d="M110 140 h120" stroke="#fff" stroke-width="5" opacity=".7" stroke-linecap="round"/>
    <circle cx="340" cy="120" r="24" fill="none" stroke="#FFD91A" stroke-width="5" opacity=".9"/>
    <rect x="90" y="206" width="120" height="10" rx="4" fill="#8A5A32"/><rect x="236" y="198" width="26" height="8" rx="3" fill="#fff"/>
    <rect x="14" y="40" width="40" height="70" rx="6" fill="#BFE9FF" stroke="#8A5A32" stroke-width="5"/><path d="M34 40 V110 M14 75 H54" stroke="#8A5A32" stroke-width="4"/>`));

  bd('noche', 'Noche estrellada', bg(`
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E1B4D"/><stop offset="1" stop-color="#4B3F8E"/></linearGradient></defs>
    <rect width="480" height="360" fill="url(#s)"/>
    <g fill="#fff"><circle cx="40" cy="50" r="2.2"/><circle cx="110" cy="100" r="1.6"/><circle cx="170" cy="40" r="2"/><circle cx="250" cy="90" r="1.8"/><circle cx="330" cy="40" r="2.2"/><circle cx="440" cy="80" r="1.8"/><circle cx="80" cy="170" r="1.6"/><circle cx="210" cy="150" r="2"/><circle cx="390" cy="160" r="1.8"/></g>
    <circle cx="360" cy="90" r="34" fill="#FFF3B0"/><circle cx="374" cy="82" r="30" fill="#2D2F7A" opacity=".0"/>
    <path d="M0 270 L80 210 L130 250 L190 190 L240 140 L290 190 L350 250 L420 210 L480 260 V360 H0 Z" fill="#241F47"/>
    <path d="M190 190 L240 140 L290 190 L266 182 L240 198 L216 180 Z" fill="#E8E6FF"/>
    <path d="M0 310 Q140 286 280 312 T480 300 V360 H0 Z" fill="#171433"/>
    <g fill="#FFE066"><circle cx="80" cy="330" r="3"/><circle cx="130" cy="338" r="3"/><circle cx="400" cy="334" r="3"/></g>`));

  bd('atardecer', 'Atardecer en el mar', bg(`
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6B5BD8"/><stop offset=".55" stop-color="#FF8AC1"/><stop offset="1" stop-color="#FFD28A"/></linearGradient>
    <linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF9F7A"/><stop offset="1" stop-color="#4C3D9E"/></linearGradient></defs>
    <rect width="480" height="360" fill="url(#s)"/>
    <circle cx="240" cy="200" r="60" fill="#FFE9A8"/>
    <rect y="200" width="480" height="160" fill="url(#m)"/>
    <g stroke="#FFE9A8" stroke-width="5" stroke-linecap="round" opacity=".8"><path d="M200 222 h80"/><path d="M180 244 h120"/><path d="M200 268 h80"/><path d="M215 294 h50"/></g>
    <path d="M0 200 H480" stroke="#fff" opacity=".4" stroke-width="2"/>
    <g fill="#3a2c4f"><path d="M70 230 Q80 214 96 228 Z"/><path d="M356 242 q8-16 22-4 Z"/></g>`));

  bd('blanco', 'Blanco', bg('<rect width="480" height="360" fill="#fff"/>'));
  bd('cuadricula', 'Cuadrícula', bg(`<rect width="480" height="360" fill="#fff"/><g stroke="#CBD6EA" stroke-width="1.5">${[...Array(11)].map((_, i) => `<path d="M${(i + 1) * 40} 0 V360"/>`).join('')}${[...Array(8)].map((_, i) => `<path d="M0 ${(i + 1) * 40} H480"/>`).join('')}</g><path d="M240 0 V360 M0 180 H480" stroke="#8FA5CF" stroke-width="3"/>`));
  bd('mercado', 'Mercado', bg(`
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FD3FF"/><stop offset="1" stop-color="#FFF0CF"/></linearGradient></defs>
    <rect width="480" height="360" fill="url(#s)"/>
    ${[['#FF8A4D', 6, 90, 100, 120], ['#FFD91A', 112, 70, 96, 140], ['#59B7FF', 214, 96, 96, 114], ['#FF6FA8', 316, 78, 90, 132], ['#FFFFFF', 410, 100, 70, 110]].map((h) =>
      `<g><rect x="${h[1]}" y="${h[2]}" width="${h[3]}" height="${h[4]}" fill="${h[0]}" stroke="#3a2c4f" stroke-width="3"/><rect x="${h[1] + 14}" y="${h[2] + 16}" width="18" height="22" fill="#BFE9FF" stroke="#3a2c4f" stroke-width="2.5"/><rect x="${h[1] + h[3] - 34}" y="${h[2] + 16}" width="18" height="22" fill="#BFE9FF" stroke="#3a2c4f" stroke-width="2.5"/></g>`).join('')}
    <rect y="200" width="480" height="160" fill="#E9D3A8"/>
    <g stroke="#CDB57F" stroke-width="3"><path d="M0 250 H480"/><path d="M0 300 H480"/><path d="M80 200 L40 360"/><path d="M200 200 V360"/><path d="M320 200 L360 360"/><path d="M440 200 L500 360"/></g>
    ${[[16, '#E2554D'], [176, '#2FB37D'], [336, '#FFB300']].map((a) =>
      `<g><rect x="${a[0] + 6}" y="170" width="116" height="60" fill="#B5713A" stroke="#3a2c4f" stroke-width="3"/><path d="M${a[0]} 112 H${a[0] + 128} L${a[0] + 118} 168 H${a[0] + 10} Z" fill="${a[1]}" stroke="#3a2c4f" stroke-width="3"/>
      <path d="M${a[0] + 26} 112 L${a[0] + 22} 168 M${a[0] + 52} 112 L${a[0] + 50} 168 M${a[0] + 78} 112 L${a[0] + 78} 168 M${a[0] + 104} 112 L${a[0] + 106} 168" stroke="#fff" stroke-width="9" opacity=".85"/>
      <path d="M${a[0]} 112 H${a[0] + 128} L${a[0] + 118} 168 H${a[0] + 10} Z" fill="none" stroke="#3a2c4f" stroke-width="3"/></g>`).join('')}
    <g stroke="#3a2c4f" stroke-width="2.5"><circle cx="40" cy="210" r="10" fill="#FF4D5E"/><circle cx="60" cy="214" r="10" fill="#FF4D5E"/><circle cx="82" cy="210" r="10" fill="#7ACB57"/><circle cx="104" cy="214" r="10" fill="#FF4D5E"/>
    <circle cx="200" cy="212" r="10" fill="#FF8A1F"/><circle cx="222" cy="214" r="10" fill="#FF8A1F"/><circle cx="244" cy="211" r="10" fill="#FFD91A"/><circle cx="266" cy="214" r="10" fill="#FFD91A"/>
    <circle cx="362" cy="212" r="10" fill="#B866FF"/><circle cx="384" cy="214" r="10" fill="#B866FF"/><circle cx="406" cy="211" r="10" fill="#FF6FA8"/></g>`));

  bd('dentro-manzana', 'Dentro de la manzana', bg(`
    <defs><radialGradient id="r" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#FFFBE6"/><stop offset="1" stop-color="#FFE9A0"/></radialGradient></defs>
    <rect width="480" height="360" fill="#C81E3A"/>
    <path d="M0 0 H480 V360 H0 Z M24 18 Q8 120 20 190 Q40 330 240 342 Q440 330 460 190 Q472 120 456 18 Z" fill="#E2354F" fill-rule="evenodd" opacity=".0"/>
    <path d="M30 40 Q14 150 38 250 Q70 330 240 336 Q410 330 442 250 Q466 150 450 40 Q380 16 240 30 Q100 16 30 40 Z" fill="url(#r)" stroke="#8E1228" stroke-width="8"/>
    <g stroke="#F1D27A" stroke-width="3" fill="none" opacity=".8"><path d="M240 60 V150"/><path d="M120 80 Q150 130 190 160"/><path d="M360 80 Q330 130 290 160"/><path d="M70 160 Q130 190 170 200"/><path d="M410 160 Q350 190 310 200"/></g>
    <path d="M150 150 Q240 110 330 150 Q360 210 330 260 Q240 300 150 260 Q120 210 150 150 Z" fill="#E8F2A8" stroke="#B9C85A" stroke-width="5"/>
    <g fill="#7B4A2A" stroke="#3a2c4f" stroke-width="3"><path d="M190 190 Q206 220 190 246 Q174 220 190 190 Z"/><path d="M290 190 Q306 220 290 246 Q274 220 290 190 Z"/><path d="M240 170 Q256 200 240 226 Q224 200 240 170 Z"/></g>
    <circle cx="240" cy="18" r="9" fill="#7B4A2A"/>`));

  bd('cueva', 'Cueva del volcán', bg(`
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241A3D"/><stop offset="1" stop-color="#5A3B52"/></linearGradient></defs>
    <rect width="480" height="360" fill="url(#s)"/>
    <path d="M0 0 H480 V70 L450 40 L420 90 L388 36 L350 100 L312 44 L276 96 L240 30 L204 100 L166 40 L130 94 L94 36 L58 88 L24 44 L0 80 Z" fill="#150F26"/>
    <path d="M0 360 V250 Q120 220 240 250 T480 240 V360 Z" fill="#3E2A3F"/>
    <path d="M0 360 V300 Q140 276 280 304 T480 292 V360 Z" fill="#2B1C2E"/>
    <g stroke="#3a2c4f" stroke-width="3"><path d="M70 250 L56 190 L92 226 Z" fill="#59E0FF"/><path d="M100 252 L108 170 L132 240 Z" fill="#A58BFF"/><path d="M380 246 L372 176 L406 232 Z" fill="#FF8AC1"/><path d="M410 248 L428 196 L440 244 Z" fill="#59E0FF"/></g>
    <circle cx="96" cy="210" r="40" fill="#59E0FF" opacity=".12"/><circle cx="396" cy="210" r="40" fill="#FF8AC1" opacity=".12"/>
    <g fill="#FFE066"><circle cx="150" cy="120" r="2.4"/><circle cx="330" cy="140" r="2.4"/><circle cx="250" cy="170" r="2"/></g>
    <g transform="translate(226 222)"><rect x="0" y="0" width="8" height="40" fill="#8A5A32"/><path d="M4 -4 Q-8 -20 4 -34 Q16 -20 4 -4 Z" fill="#FF8A1F" stroke="#3a2c4f" stroke-width="2"/></g>`));

  bd('luna', 'La Luna', bg(`
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05071A"/><stop offset="1" stop-color="#22285E"/></linearGradient>
    <radialGradient id="t" cx=".35" cy=".35" r=".8"><stop offset="0" stop-color="#7FD0FF"/><stop offset="1" stop-color="#2D6FD0"/></radialGradient></defs>
    <rect width="480" height="360" fill="url(#s)"/>
    <g fill="#fff"><circle cx="40" cy="40" r="2"/><circle cx="120" cy="90" r="1.6"/><circle cx="200" cy="30" r="2.2"/><circle cx="290" cy="80" r="1.6"/><circle cx="440" cy="50" r="2"/><circle cx="360" cy="130" r="1.6"/><circle cx="70" cy="150" r="1.8"/></g>
    <circle cx="372" cy="86" r="42" fill="url(#t)" stroke="#BFE3FF" stroke-width="3"/>
    <path d="M346 70 Q362 58 372 74 Q364 94 350 90 Z M382 96 Q398 92 404 108 Q392 120 380 112 Z" fill="#4DBB5A"/>
    <path d="M0 250 Q100 220 220 246 T480 236 V360 H0 Z" fill="#B9BCCB"/>
    <path d="M0 300 Q140 272 300 302 T480 290 V360 H0 Z" fill="#9EA2B8"/>
    <g fill="#8B8FA8" stroke="#6E7290" stroke-width="3"><ellipse cx="90" cy="290" rx="34" ry="10"/><ellipse cx="330" cy="272" rx="26" ry="8"/><ellipse cx="420" cy="320" rx="38" ry="11"/><ellipse cx="200" cy="330" rx="22" ry="7"/></g>`));

  bd('estadio', 'Estadio de fútbol', bg(`
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6FC0FF"/><stop offset="1" stop-color="#CBEBFF"/></linearGradient></defs>
    <rect width="480" height="360" fill="url(#s)"/>
    <rect y="40" width="480" height="70" fill="#7A6CC8"/>
    <g>${[...Array(40)].map((_, i) => `<circle cx="${6 + i * 12}" cy="${56 + (i % 3) * 16}" r="5" fill="${['#FFD91A', '#FF6FA8', '#FFFFFF', '#59B7FF', '#FF8A4D'][i % 5]}"/>`).join('')}</g>
    <rect y="104" width="480" height="10" fill="#4C3F99"/>
    <rect y="114" width="480" height="246" fill="#4DBB5A"/>
    <g fill="#43AD50">${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${i * 80}" y="114" width="40" height="246"/>`).join('')}</g>
    <rect x="70" y="40" width="340" height="132" fill="#fff" fill-opacity=".18"/>
    <g stroke="#fff" stroke-width="1.6" opacity=".7">${[...Array(14)].map((_, i) => `<path d="M${70 + i * 26} 50 V172"/>`).join('')}${[...Array(6)].map((_, i) => `<path d="M70 ${60 + i * 22} H410"/>`).join('')}</g>
    <path d="M70 172 V48 H410 V172" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M70 172 V48 H410 V172" fill="none" stroke="#C9D3DD" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M40 300 L120 172 H360 L440 300 Z" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>
    <path d="M190 300 Q240 270 290 300" fill="none" stroke="#fff" stroke-width="5"/>
    <ellipse cx="240" cy="292" rx="8" ry="4" fill="#fff"/>`));

  bd('huerto', 'Huerto', bg(`
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FD3FF"/><stop offset="1" stop-color="#E4F6FF"/></linearGradient></defs>
    <rect width="480" height="360" fill="url(#s)"/>
    ${cloud(90, 60, 1)}${cloud(330, 80, .9)}
    <path d="M0 190 Q120 150 240 184 T480 170 V360 H0 Z" fill="#7BCB63"/>
    <g stroke="#8A5A32" stroke-width="5" fill="#C98F5B"><rect x="10" y="150" width="8" height="46"/><rect x="50" y="150" width="8" height="46"/><rect x="90" y="150" width="8" height="46"/><rect x="130" y="150" width="8" height="46"/><rect x="0" y="164" width="150" height="8"/><rect x="0" y="182" width="150" height="8"/></g>
    <path d="M0 250 Q120 232 240 250 T480 244 V360 H0 Z" fill="#8A5A32"/>
    <g fill="#6F4526">${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${10 + i * 80} 286 q30-16 60 0 v10 h-60 Z"/><path d="M${10 + i * 80} 330 q30-16 60 0 v10 h-60 Z"/>`).join('')}</g>
    <ellipse cx="240" cy="266" rx="50" ry="14" fill="#5E3A1E"/>`));

  PQ.BACKDROP_LIB = BACKDROPS;

  /* ====================== SONIDOS ====================== */
  const RATE = 22050;
  function synth(dur, fn) {
    const n = Math.floor(dur * RATE), a = new Float32Array(n);
    for (let i = 0; i < n; i++) a[i] = fn(i / RATE, i / n);
    return a;
  }
  const env = (t, d, atk) => Math.min(1, t / (atk || 0.005)) * Math.exp(-t / d);
  const SOUNDS = [
    ['Pop', () => synth(0.18, (t) => Math.sin(2 * Math.PI * (900 - t * 3600) * t) * env(t, 0.04) * 0.8)],
    ['Boing', () => synth(0.5, (t, p) => Math.sin(2 * Math.PI * (200 + 400 * Math.abs(Math.sin(p * 9)) * (1 - p)) * t) * env(t, 0.25) * 0.7)],
    ['Campana', () => synth(1.1, (t) => (Math.sin(2 * Math.PI * 880 * t) + 0.5 * Math.sin(2 * Math.PI * 1760 * t) + 0.25 * Math.sin(2 * Math.PI * 2640 * t)) * env(t, 0.3) * 0.4)],
    ['Tambor', () => synth(0.4, (t) => (Math.sin(2 * Math.PI * (120 - t * 160) * t) * 0.9 + (Math.random() * 2 - 1) * 0.3 * Math.exp(-t / 0.02)) * env(t, 0.1))],
    ['Ta-chán', () => {
      const notes = [[523.25, 0, 0.14], [659.25, 0.14, 0.14], [783.99, 0.28, 0.14], [1046.5, 0.42, 0.6]];
      return synth(1.1, (t) => { let v = 0; notes.forEach((n) => { if (t >= n[1]) { const tt = t - n[1]; v += Math.sin(2 * Math.PI * n[0] * tt) * env(tt, n[2] + 0.1) * 0.35; } }); return v; });
    }],
    ['Chapuzón', () => synth(0.7, (t) => (Math.random() * 2 - 1) * Math.exp(-t / 0.18) * 0.45 * (1 - Math.min(1, t / 0.7)) + Math.sin(2 * Math.PI * (500 - 300 * t) * t) * env(t, 0.08) * 0.3)],
    ['Bocina', () => synth(0.6, (t) => (Math.sign(Math.sin(2 * Math.PI * 330 * t)) * 0.3 + Math.sign(Math.sin(2 * Math.PI * 415 * t)) * 0.25) * Math.min(1, t / 0.02) * (t > 0.5 ? 1 - (t - 0.5) / 0.1 : 1))],
    ['Magia', () => synth(1.0, (t) => { let v = 0; for (let k = 0; k < 6; k++) { const s = k * 0.1; if (t >= s) { const tt = t - s; v += Math.sin(2 * Math.PI * (1000 + k * 260) * tt) * env(tt, 0.12) * 0.22; } } return v; })]
  ];
  PQ.SOUND_LIB = SOUNDS.map((s) => ({ name: s[0], make: s[1] }));

  PQ.makeSound = function (libName) {
    const s = SOUNDS.find((x) => x[0] === libName) || SOUNDS[0];
    const samples = s[1]();
    return { name: s[0], fmt: 'wav', bytes: PQ.makeWav(samples, RATE), rate: RATE, count: samples.length };
  };

  /* ====================== Constructores ====================== */
  PQ.makeSprite = function (libId, project) {
    const item = SPRITES.find((s) => s.id === libId);
    const t = PQ.newTarget(PQ.uniqueName(item.name, project ? project.sprites.map((s) => s.name) : []), false);
    item.costumes.forEach((c, i) => t.costumes.push(PQ.mkCostume(item.name + ' ' + (i + 1), c[1], 'svg', 60, 60)));
    return t;
  };
  PQ.makeBackdrop = function (libId) {
    const b = BACKDROPS.find((x) => x.id === libId);
    return PQ.mkCostume(b.name, b.svg, 'svg', 240, 180);
  };
  PQ.spriteLibById = (id) => SPRITES.find((s) => s.id === id);
})(typeof window !== 'undefined' ? window : globalThis);
