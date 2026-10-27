/* PequeBloques — diseñado por David OZC
 * editor.js: paleta de bloques, área de programación, arrastrar y soltar, teclado numérico
 */
(function (g) {
  'use strict';
  const PQ = g.PQ = g.PQ || {};
  const B = PQ.BLOCKS, CATS = PQ.CATS;
  const S = PQ.S = PQ.S || { project: null, target: null, level: 1, zoom: 1 };
  const ED = PQ.ed = { onChange: null };

  function h(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  const $ = (s, r) => (r || document).querySelector(s);

  /* ---------- iconos ---------- */
  const ICONS = {
    flag: '<path d="M6 21V4" stroke="#1F7A2B"/><path d="M6 5c4-2 6 2 12 0v9c-6 2-8-2-12 0" fill="#4CBF56" stroke="#1F7A2B"/>',
    key: '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M7 14h10"/>',
    tap: '<path d="M6 3l12 8-5 1.6L10.5 19z" fill="#fff"/>',
    mail: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 8l9 6 9-6"/>',
    arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
    arrowup: '<path d="M12 20V5M6 11l6-6 6 6"/>',
    turnr: '<path d="M19 9a8 8 0 1 0 1 6"/><path d="M19 3v6h-6"/>',
    turnl: '<path d="M5 9a8 8 0 1 1-1 6"/><path d="M5 3v6h6"/>',
    target: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2" fill="#fff"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
    glide: '<path d="M3 12h4M10 12h3M16 12h5M17 8l4 4-4 4"/>',
    bounce: '<path d="M20 4v16M4 12h12M10 6l-6 6 6 6"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15 9l-2 6-4 0 2-6z" fill="#fff"/>',
    bubble: '<path d="M4 5h16v11H11l-4 4v-4H4z" fill="#fff" stroke="#fff"/>',
    cloud: '<path d="M7 17a4 4 0 0 1 0-8 5 5 0 0 1 9.5-1A4.5 4.5 0 0 1 17 17z" fill="#fff"/>',
    face: '<circle cx="12" cy="12" r="9"/><path d="M8 14c2 3 6 3 8 0"/><circle cx="9" cy="10" r="1" fill="#fff"/><circle cx="15" cy="10" r="1" fill="#fff"/>',
    picture: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 16l5-5 4 4 3-3 6 6"/><circle cx="16" cy="9" r="1.5" fill="#fff"/>',
    grow: '<path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3" fill="#fff"/>',
    eyeoff: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><path d="M4 4l16 16"/>',
    speaker: '<path d="M4 9h4l5-4v14l-5-4H4z" fill="#fff"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
    speakeroff: '<path d="M4 9h4l5-4v14l-5-4H4z" fill="#fff"/><path d="M17 9l5 6M22 9l-5 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    repeat: '<path d="M4 11a8 8 0 0 1 14-4M18 3v5h-5"/><path d="M20 13a8 8 0 0 1-14 4M6 21v-5h5"/>',
    forever: '<path d="M7 8c-4 0-4 8 0 8 4 0 6-8 10-8 4 0 4 8 0 8-4 0-6-8-10-8z"/>',
    question: '<path d="M8.5 9a3.5 3.5 0 1 1 5 3c-1.2.7-1.5 1.3-1.5 2.5M12 18.5v.5"/>',
    stop: '<path d="M8 3h8l5 5v8l-5 5H8l-5-5V8z" fill="#E64040" stroke="#fff"/>',
    hand: '<path d="M6 3l12 8-5 1.6L10.5 19z" fill="#fff"/>',
    pen: '<path d="M4 20l1-5L16 4l4 4L9 19z" fill="#fff"/><path d="M14 6l4 4"/>',
    var: '<rect x="4" y="7" width="16" height="10" rx="5"/><path d="M9 12h6"/>',
    dice: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2" fill="#fff"/><circle cx="15" cy="15" r="1.2" fill="#fff"/><circle cx="12" cy="12" r="1.2" fill="#fff"/>'
  };
  PQ.icon = function (name, cls) {
    return '<svg class="' + (cls || 'ico') + '" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  };

  const env = () => ({ target: S.target, project: S.project });

  /* ---------- renderizado de bloques ---------- */
  const slotGet = (o, n) => (n === 'CONDITION' ? o.cond : (o.in && o.in[n]));
  const slotSet = (o, n, v) => { if (n === 'CONDITION') o.cond = v; else { o.in = o.in || {}; if (v) o.in[n] = v; else delete o.in[n]; } };
  function argEl(b, name, a, loc) {
    if (a.k === 'prim' || a.k === 'bslot') {
      const w = h('span', a.k === 'bslot' ? 'condslot' : 'islot');
      w._owner = b; w._name = name; w._acceptsRep = a.k === 'prim';
      const nb = b.in && b.in[name];
      if (nb) { w.classList.add('filled'); w.appendChild(renderBlock(nb, { type: 'in', owner: b, name, script: loc && loc.script })); }
      else if (a.k === 'bslot') w.appendChild(h('span', 'hexempty'));
      else w.appendChild(primEl(b, name, a));
      return w;
    }
    return menuEl(b, name, a);
  }
  function colorEl(b, name) {
    const sw = h('span', 'fld clr'); sw.style.background = b.f[name]; sw.tabIndex = 0; sw.setAttribute('role', 'button'); sw.setAttribute('aria-label', 'Color');
    const open = (e) => {
      e.stopPropagation();
      document.querySelectorAll('.clrpop').forEach((x) => x.remove());
      const pop = h('div', 'clrpop');
      PQ.COLORS.forEach((c) => {
        const bt = h('button', 'pcol'); bt.type = 'button'; bt.style.background = c; bt.setAttribute('aria-label', c);
        bt.addEventListener('click', (ev) => { ev.stopPropagation(); b.f[name] = c; sw.style.background = c; pop.remove(); ED.changed(true); });
        pop.appendChild(bt);
      });
      document.body.appendChild(pop);
      const r = sw.getBoundingClientRect();
      pop.style.left = Math.min(innerWidth - 220, Math.max(6, r.left - 60)) + 'px'; pop.style.top = (r.bottom + 8 > innerHeight - 140 ? r.top - 130 : r.bottom + 8) + 'px';
      const off = (ev) => { if (!pop.contains(ev.target)) { pop.remove(); document.removeEventListener('pointerdown', off, true); } };
      setTimeout(() => document.addEventListener('pointerdown', off, true), 0);
    };
    sw.addEventListener('click', open);
    sw.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') open(e); });
    return sw;
  }
  function primEl(b, name, a) {
    if (a.t === 'color') return colorEl(b, name);
    if (a.t === 'txt') {
      const i = h('input', 'fld txt');
      i.type = 'text'; i.value = b.f[name] == null ? '' : b.f[name]; i.maxLength = 80;
      const fit = () => { i.style.width = Math.max(3.2, Math.min(22, i.value.length * 0.62 + 1.6)) + 'em'; };
      fit();
      i.setAttribute('aria-label', 'Texto');
      i.addEventListener('input', () => { b.f[name] = i.value; fit(); ED.changed(true); });
      return i;
    }
    const s = h('span', 'fld num');
    s.textContent = b.f[name]; s.tabIndex = 0; s.setAttribute('role', 'button'); s.setAttribute('aria-label', 'Número ' + b.f[name]);
    s.addEventListener('click', (e) => { e.stopPropagation(); ED.keypad(s, b, name); });
    s.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ED.keypad(s, b, name); } });
    return s;
  }
  function menuEl(b, name, a) {
    const sel = h('select', 'sel');
    const opts = PQ.menuOptions(a.menu, env());
    let cur = b.f[name];
    if (cur !== undefined && cur !== '' && !opts.some((o) => o[0] === cur)) opts.unshift([cur, a.menu === 'touching' || a.menu === 'goto' ? cur : cur]);
    opts.forEach((o) => {
      const op = h('option'); op.value = o[0]; op.textContent = o[1];
      if (o[0] === cur) op.selected = true;
      sel.appendChild(op);
    });
    if ((cur === undefined || cur === '') && sel.options.length) { b.f[name] = sel.options[0].value === '__new__' ? '' : sel.options[0].value; }
    sel.setAttribute('aria-label', 'Elegir');
    sel.addEventListener('change', () => {
      if (sel.value === '__new__') {
        PQ.ui.prompt('Nombre del mensaje nuevo', 'mensaje' + (S.project.messages.length + 1), (v) => {
          v = (v || '').trim();
          if (v) {
            if (S.project.messages.indexOf(v) < 0) S.project.messages.push(v);
            b.f[name] = v;
          }
          ED.refreshAll();
          ED.changed();
        }, () => ED.refreshAll());
        return;
      }
      b.f[name] = sel.value; ED.changed(true);
      if (a.menu === 'voices' && PQ.utter) { try { speechSynthesis.cancel(); } catch (e) { /* nada */ } PQ.utter('¡Hola! Así sueno yo.', sel.value); }
    });
    return sel;
  }

  function fillRow(row, b, spec, loc) {
    if (spec.icon && spec.kind !== 'bool' && spec.kind !== 'rep') { const w = h('span', 'icow', PQ.icon(spec.icon)); row.appendChild(w); }
    PQ.parseLabel(spec.label).forEach((tok) => {
      if (typeof tok === 'string') {
        const t = tok.trim();
        if (t) { const s = h('span', 't'); s.textContent = t; row.appendChild(s); }
        return;
      }
      if (tok.arg === 'FLAG') { row.appendChild(h('span', 'icow flagw', PQ.icon('flag'))); return; }
      if (tok.arg === 'CONDITION') {
        const slot = h('span', 'condslot');
        slot._owner = b; slot._name = 'CONDITION';
        if (b.cond) { slot.classList.add('filled'); slot.appendChild(renderBlock(b.cond, { type: 'cond', owner: b, script: loc && loc.script })); }
        else slot.appendChild(h('span', 'hexempty'));
        row.appendChild(slot); return;
      }
      const a = spec.args[tok.arg];
      if (b.op === 'data_variable' && tok.arg === 'VARIABLE') { const v = h('span', 't'); v.textContent = b.f.VARIABLE; row.appendChild(v); return; }
      if (a) row.appendChild(argEl(b, tok.arg, a, loc));
    });
  }

  function renderStack(arr, script) {
    const st = h('div', 'stack');
    arr.forEach((b, i) => {
      const e = renderBlock(b, { type: 'stack', arr, idx: i, script, top: !!script && script.blocks === arr && i === 0 });
      if (i === 0) e.classList.add('sfirst');
      if (i === arr.length - 1) e.classList.add('slast');
      st.appendChild(e);
    });
    return st;
  }

  function renderBlock(b, loc) {
    const spec = B[b.op], cat = CATS[spec.cat];
    const root = h('div', 'block k-' + spec.kind);
    root.style.setProperty('--c', cat.c); root.style.setProperty('--b', cat.b);
    root.dataset.op = b.op; root._b = b; root._loc = loc; root._subs = [];
    if (spec.kind === 'bool' || spec.kind === 'rep') {
      const inner = h('div', 'in');
      fillRow(inner, b, spec, loc);
      root.appendChild(inner);
      return root;
    }
    const head = h('div', 'row head');
    fillRow(head, b, spec, loc);
    root.appendChild(head);
    if (spec.kind === 'hat') { head.classList.add('hatrow', 'bump'); }
    else if (spec.kind === 'stack') head.classList.add('bump');
    else if (spec.kind === 'cap') head.classList.add('nobump');
    if (spec.kind === 'c') {
      head.classList.add('cbump');
      const mk = (arr) => {
        const wrap = h('div', 'cwrap'), arm = h('div', 'arm'), sub = h('div', 'sub');
        const inner = renderStack(arr, loc && loc.script);
        inner.classList.add('substack');
        sub.appendChild(inner);
        wrap.appendChild(arm); wrap.appendChild(sub);
        root._subs.push({ el: sub, arr });
        return wrap;
      };
      root.appendChild(mk(b.sub));
      if (spec.two) {
        const mid = h('div', 'row mid cbump'); mid.appendChild(h('span', 't', 'si no'));
        root.appendChild(mid);
        root.appendChild(mk(b.sub2));
      }
      const foot = h('div', 'row foot' + (spec.noNext ? ' nobump' : ' bump'));
      foot.appendChild(h('span', 't', ' '));
      root.appendChild(foot);
    }
    return root;
  }
  ED.renderBlock = renderBlock;

  /* ---------- paleta ---------- */
  function palOps(cat) {
    return PQ.PALETTE[cat].filter((op) => {
      const sp = B[op];
      if (sp.noPal) return false;
      if (sp.lvl > S.level) return false;
      if (cat === 'data' && !(S.project.vars || []).length) return false;
      if (S.target && S.target.isStage && (sp.sprite || sp.spriteOnly)) return false;
      if (S.target && !S.target.isStage && sp.stageOnly) return false;
      return true;
    });
  }
  ED.renderPalette = function () {
    const pal = $('#pal'), cats = $('#cats');
    if (!pal || !S.target) return;
    const keep = pal.scrollTop;
    pal.innerHTML = ''; cats.innerHTML = '';
    PQ.CAT_ORDER.forEach((cat) => {
      const ops = palOps(cat);
      if (!ops.length && !(cat === 'data' && S.level >= 2)) return;
      const c = CATS[cat];
      const sec = h('section', 'palsec'); sec.dataset.cat = cat;
      sec.appendChild(h('h3', 'palh', c.name));
      if (cat === 'data') {
        const mv = h('button', 'mkvar', '<span>+</span> Crear variable'); mv.type = 'button';
        mv.addEventListener('click', () => ED.makeVariable());
        sec.appendChild(mv);
        (S.project.vars || []).forEach((v) => {
          const wrap = h('div', 'palitem');
          wrap.appendChild(renderBlock(PQ.mkBlock('data_variable', { VARIABLE: v.name }, env()), { type: 'palette' }));
          sec.appendChild(wrap);
        });
      }
      ops.forEach((op) => {
        const wrap = h('div', 'palitem');
        wrap.appendChild(renderBlock(PQ.mkBlock(op, null, env()), { type: 'palette' }));
        sec.appendChild(wrap);
      });
      pal.appendChild(sec);
      const btn = h('button', 'cat'); btn.type = 'button'; btn.dataset.cat = cat;
      btn.style.setProperty('--cc', c.c);
      btn.innerHTML = '<span class="dot"></span><span class="cn">' + c.name + '</span>';
      btn.addEventListener('click', () => { pal.scrollTop = sec.offsetTop - 4; });
      cats.appendChild(btn);
    });
    pal.scrollTop = keep;
    updateCatActive();
  };
  function updateCatActive() {
    const pal = $('#pal'); if (!pal) return;
    let act = null;
    pal.querySelectorAll('.palsec').forEach((s) => { if (s.offsetTop - 130 <= pal.scrollTop) act = s.dataset.cat; });
    document.querySelectorAll('#cats .cat').forEach((b) => b.classList.toggle('on', b.dataset.cat === act));
  }
  ED.makeVariable = function () {
    PQ.ui.prompt('Nombre de la variable', 'puntos', (v) => {
      v = (v || '').trim().slice(0, 20);
      if (!v) return;
      const names = (S.project.vars || []).map((x) => x.name);
      if (names.indexOf(v) >= 0) { PQ.ui.toast('Ya existe una variable con ese nombre.'); return; }
      S.project.vars = S.project.vars || [];
      S.project.vars.push({ name: v, value: 0, show: true });
      if (PQ.RT) PQ.RT.dirty = true;
      ED.refreshAll(); ED.changed();
    });
  };
  ED.deleteVariable = function (name) {
    PQ.ui.confirm('¿Borrar variable?', 'Se borrará «' + name + '».', () => {
      S.project.vars = (S.project.vars || []).filter((x) => x.name !== name);
      PQ.allTargets(S.project).forEach((t) => { t.scripts.forEach((sc) => { (function w(arr) { arr.forEach((b) => { if (b.f && b.f.VARIABLE === name) b.f.VARIABLE = (S.project.vars[0] || {}).name || ''; w(b.sub || []); w(b.sub2 || []); }); })(sc.blocks); }); });
      if (PQ.RT) PQ.RT.dirty = true;
      ED.refreshAll(); ED.changed();
    }, { yes: 'Borrar', cls: 'red' });
  };
  /* texto legible de un bloque (para leerlo en voz alta) */
  PQ.blockText = function (b) {
    const spec = B[b.op]; const out = [];
    PQ.parseLabel(spec.label).forEach((tok) => {
      if (typeof tok === 'string') { out.push(tok.trim()); return; }
      if (tok.arg === 'FLAG') { out.push('bandera verde'); return; }
      if (tok.arg === 'CONDITION') { out.push(b.cond ? PQ.blockText(b.cond) : ''); return; }
      const a = spec.args[tok.arg]; if (!a) return;
      if (b.in && b.in[tok.arg]) { out.push(PQ.blockText(b.in[tok.arg])); return; }
      let v = b.f[tok.arg];
      if (a.k === 'menu' || a.k === 'field' || a.k === 'bfield' || a.k === 'bin') {
        const o = PQ.menuOptions(a.menu, env()).find((x) => x[0] === v); if (o) v = o[1];
      }
      out.push(a.t === 'color' ? '' : String(v));
    });
    return out.filter(Boolean).join(' ').replace(/[↻↺]/g, '').replace(/\s+/g, ' ');
  };
  ED.showValue = function (el, b) {
    document.querySelectorAll('.valbubble').forEach((x) => x.remove());
    let v = '';
    try { v = PQ._rt.fmt(PQ.RT.ev(b, S.target)); } catch (e) { v = ''; }
    const bub = h('div', 'valbubble'); bub.textContent = v === '' ? '—' : v;
    document.body.appendChild(bub);
    const r = el.getBoundingClientRect();
    bub.style.left = Math.max(6, Math.min(innerWidth - 120, r.left)) + 'px'; bub.style.top = Math.max(6, r.top - 44) + 'px';
    setTimeout(() => bub.remove(), 2400);
    if (PQ.settings && PQ.settings.voice && PQ.utter && v !== '') PQ.utter(v, 'ALTO');
  };
  ED.highlight = function (op) {
    document.querySelectorAll('#pal .block.pulse').forEach((e) => e.classList.remove('pulse'));
    if (!op) return;
    const pal = $('#pal');
    const blk = pal && pal.querySelector('.block[data-op="' + op + '"]');
    if (!blk) return;
    blk.classList.add('pulse');
    const pr = pal.getBoundingClientRect(), br = blk.getBoundingClientRect();
    pal.scrollTop += br.top - pr.top - 70;
  };

  /* ---------- área de programación ---------- */
  ED.renderWorkspace = function () {
    const wsin = $('#wsin');
    if (!wsin || !S.target) return;
    wsin.innerHTML = '';
    setTimeout(markSel, 0);
    S.target.scripts.forEach((s) => {
      const d = h('div', 'script');
      d.style.left = s.x + 'px'; d.style.top = s.y + 'px';
      d._script = s;
      d.appendChild(renderStack(s.blocks, s));
      wsin.appendChild(d);
    });
    const empty = S.target.scripts.length === 0;
    $('#wshint').hidden = !empty;
    ED.markRunning();
  };
  ED.refreshAll = function () { ED.renderPalette(); ED.renderWorkspace(); };
  ED.markRunning = function () {
    const th = (PQ.RT && PQ.RT.threads) || [];
    document.querySelectorAll('#wsin .script').forEach((d) => {
      d.classList.toggle('running', th.some((t) => t.script === d._script));
    });
  };
  ED.changed = function (soft) {
    if (ED.onChange) ED.onChange(!!soft);
  };

  /* ---------- deshacer ---------- */
  ED.pushUndo = function () {
    const t = S.target; if (!t) return;
    (t._undo = t._undo || []).push(JSON.stringify(t.scripts));
    if (t._undo.length > 40) t._undo.shift();
    t._redo = [];
  };
  ED.undo = function () {
    const t = S.target;
    if (!t || !t._undo || !t._undo.length) return false;
    (t._redo = t._redo || []).push(JSON.stringify(t.scripts));
    t.scripts = JSON.parse(t._undo.pop());
    ED.renderWorkspace(); ED.changed();
    return true;
  };
  ED.redo = function () {
    const t = S.target;
    if (!t || !t._redo || !t._redo.length) return false;
    t._undo.push(JSON.stringify(t.scripts));
    t.scripts = JSON.parse(t._redo.pop());
    ED.renderWorkspace(); ED.changed();
    return true;
  };

  ED.cleanUp = function () {
    ED.renderWorkspace();
    const ws = $('#ws'), els = Array.from(document.querySelectorAll('#wsin .script'));
    ED.pushUndo();
    const limit = Math.max(500, ws.clientHeight - 20);
    let x = 20, y = 20, colW = 0;
    els.sort((a, b) => (a._script.y - b._script.y) || (a._script.x - b._script.x));
    els.forEach((d) => {
      const r = d.getBoundingClientRect();
      if (y > 20 && y + r.height > limit) { x += colW + 40; y = 20; colW = 0; }
      d._script.x = x; d._script.y = y;
      y += r.height + 34; colW = Math.max(colW, r.width);
    });
    ED.renderWorkspace(); ED.changed();
  };

  ED.setZoom = function (z) {
    S.zoom = PQ.clamp(z, 0.75, 1.7);
    document.documentElement.style.setProperty('--fs', (16 * S.zoom).toFixed(2) + 'px');
  };

  /* ---------- teclado numérico ---------- */
  let kp = null;
  ED.closeKeypad = function () { if (kp) { kp.el.remove(); document.removeEventListener('pointerdown', kp.out, true); document.removeEventListener('keydown', kp.key, true); kp = null; } };
  ED.keypad = function (span, b, name) {
    ED.closeKeypad();
    let cur = String(b.f[name] === undefined ? '' : b.f[name]);
    let fresh = true;
    const el = h('div', 'keypad');
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Teclado de números');
    const disp = h('div', 'kdisp'); el.appendChild(disp);
    const grid = h('div', 'kgrid'); el.appendChild(grid);
    const upd = () => {
      disp.textContent = cur === '' ? '0' : cur;
      b.f[name] = cur === '' || cur === '-' ? '0' : cur;
      span.textContent = b.f[name];
      ED.changed(true);
    };
    const press = (k) => {
      if (k === 'ok') { ED.closeKeypad(); return; }
      if (k === 'back') { cur = cur.slice(0, -1); fresh = false; }
      else if (k === 'neg') { cur = cur.startsWith('-') ? cur.slice(1) : '-' + cur; fresh = false; }
      else if (k === 'clr') { cur = ''; fresh = false; }
      else {
        if (fresh) { cur = ''; fresh = false; }
        if (k === '.' && cur.indexOf('.') >= 0) return;
        if (cur.replace('-', '').length >= 7) return;
        cur += k;
      }
      upd();
    };
    ['7', '8', '9', 'back', '4', '5', '6', 'neg', '1', '2', '3', 'clr', '0', '.', 'ok'].forEach((k) => {
      const bt = h('button', 'kb' + (k === 'ok' ? ' kok' : ''));
      bt.type = 'button';
      bt.textContent = ({ back: '⌫', neg: '±', clr: 'C', ok: '✔' })[k] || k;
      bt.setAttribute('aria-label', ({ back: 'Borrar', neg: 'Cambiar signo', clr: 'Limpiar', ok: 'Aceptar' })[k] || k);
      bt.addEventListener('click', (e) => { e.stopPropagation(); press(k); });
      grid.appendChild(bt);
    });
    document.body.appendChild(el);
    const r = span.getBoundingClientRect();
    const w = 236, hh = 330;
    let left = PQ.clamp(r.left + r.width / 2 - w / 2, 6, innerWidth - w - 6);
    let top = r.bottom + 8;
    if (top + hh > innerHeight - 6) top = Math.max(6, r.top - hh - 8);
    el.style.left = left + 'px'; el.style.top = top + 'px';
    disp.textContent = cur === '' ? '0' : cur;
    kp = {
      el,
      out: (e) => { if (!el.contains(e.target) && e.target !== span) ED.closeKeypad(); },
      key: (e) => {
        if (/^[0-9.]$/.test(e.key)) { press(e.key); e.preventDefault(); }
        else if (e.key === 'Backspace') { press('back'); e.preventDefault(); }
        else if (e.key === '-') { press('neg'); e.preventDefault(); }
        else if (e.key === 'Enter' || e.key === 'Escape') { ED.closeKeypad(); e.preventDefault(); }
      }
    };
    document.addEventListener('pointerdown', kp.out, true);
    document.addEventListener('keydown', kp.key, true);
  };

  /* ---------- arrastrar y soltar ---------- */
  let pending = null, drag = null;
  const kindOf = (b) => B[b.op].kind;
  const isEnd = (b) => { const sp = B[b.op]; return sp.kind === 'cap' || sp.noNext; };

  /* ---------- selección y borrado con el teclado ---------- */
  let selB = null;
  function markSel() {
    document.querySelectorAll('#wsin .block').forEach((el) => el.classList.toggle('sel', !!selB && el._b === selB));
  }
  function findLoc(b) {
    let found = null;
    const inBlock = (blk) => {
      if (found) return;
      Object.keys(blk.in || {}).forEach((n) => { const r = blk.in[n]; if (found || !r) return; if (r === b) found = { type: 'in', owner: blk, name: n }; else inBlock(r); });
      if (!found && blk.cond) { if (blk.cond === b) found = { type: 'cond', owner: blk }; else inBlock(blk.cond); }
    };
    const inArr = (arr, script) => {
      for (let i = 0; i < arr.length && !found; i++) {
        const blk = arr[i];
        if (blk === b) { found = { type: 'stack', arr, idx: i, script }; return; }
        inBlock(blk); if (found) return;
        if (blk.sub) inArr(blk.sub, script);
        if (!found && blk.sub2) inArr(blk.sub2, script);
      }
    };
    S.target.scripts.forEach((s) => { if (!found) inArr(s.blocks, s); });
    return found;
  }
  function deleteSelected(whole) {
    if (!selB) return false;
    const loc = findLoc(selB);
    if (!loc) { selB = null; return false; }
    ED.pushUndo();
    if (loc.type === 'stack') {
      if (whole) S.target.scripts.splice(S.target.scripts.indexOf(loc.script), 1);
      else {
        loc.arr.splice(loc.idx, 1);
        if (loc.script.blocks.length === 0) S.target.scripts.splice(S.target.scripts.indexOf(loc.script), 1);
      }
    } else if (loc.type === 'in') slotSet(loc.owner, loc.name, null);
    else loc.owner.cond = null;
    selB = null;
    ED.renderWorkspace(); ED.changed();
    if (PQ.ui && PQ.ui.toast) PQ.ui.toast(whole ? 'Conjunto de bloques borrado.' : 'Bloque borrado.');
    return true;
  }
  ED.deleteSelected = deleteSelected;

  function onDown(e, fromPal) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.target.closest('.fld,.sel,input,select,option,.keypad')) return;
    const be = e.target.closest('.block');
    if (!be) return;
    ED.closeKeypad();
    pending = { be, fromPal, sx: e.clientX, sy: e.clientY, id: e.pointerId };
    if (e.pointerType !== 'mouse') e.preventDefault();
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
  }
  function endListeners() {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onCancel);
  }
  function onMove(e) {
    if (pending && !drag) {
      const mdx = e.clientX - pending.sx, mdy = e.clientY - pending.sy;
      if (Math.hypot(mdx, mdy) < 6) return;
      /* con el dedo en la paleta, un gesto más vertical que horizontal es para hacer scroll, no para coger el bloque */
      if (pending.fromPal && e.pointerType === 'touch' && Math.abs(mdy) > Math.abs(mdx) * 1.2) return;
      beginDrag(e);
    }
    if (drag) { e.preventDefault(); updateDrag(e); }
  }
  function onCancel() { if (drag) finishDrag(null, true); pending = null; endListeners(); }
  function onUp(e) {
    endListeners();
    if (drag) { finishDrag(e, false); pending = null; return; }
    if (pending) {
      const { be, fromPal } = pending;
      pending = null;
      const kk = kindOf(be._b), isR = kk === 'bool' || kk === 'rep';
      if (fromPal) {
        const b = PQ.clone(be._b);
        if (isR) ED.showValue(be, b);
        else {
          if (kk !== 'hat' && PQ.RT) PQ.RT.runBlock(S.target, b);
          if (PQ.settings && PQ.settings.voice && PQ.utter) { try { speechSynthesis.cancel(); } catch (e) { /* nada */ } PQ.utter(PQ.blockText(b), 'ALTO'); }
        }
        flash(be);
      } else if (isR) {
        selB = be._b; markSel();
        ED.showValue(be, be._b);
      } else if (be._loc && be._loc.script && PQ.RT) {
        selB = be._b; markSel();
        PQ.RT.runScript(S.target, be._loc.script);
        ED.markRunning();
      }
    }
  }
  function flash(be) { be.classList.add('clicked'); setTimeout(() => be.classList.remove('clicked'), 180); }

  function beginDrag(e) {
    const { be, fromPal } = pending;
    const r = be.getBoundingClientRect();
    let dragged;
    if (fromPal) {
      ED.pushUndo();
      dragged = [PQ.clone(be._b)];
    } else {
      ED.pushUndo();
      const loc = be._loc;
      if (loc.type === 'cond') { loc.owner.cond = null; dragged = [be._b]; }
      else if (loc.type === 'in') { slotSet(loc.owner, loc.name, null); dragged = [be._b]; }
      else {
        dragged = loc.arr.splice(loc.idx);
        if (loc.script && loc.arr === loc.script.blocks && loc.arr.length === 0) {
          const i = S.target.scripts.indexOf(loc.script);
          if (i >= 0) S.target.scripts.splice(i, 1);
        }
      }
      ED.renderWorkspace();
    }
    const fl = h('div', 'dragstack');
    fl.appendChild(renderStack(dragged, { blocks: dragged }));
    document.body.appendChild(fl);
    drag = { dragged, el: fl, ox: pending.sx - r.left, oy: pending.sy - r.top, fromPal, snap: null, hl: null, line: h('div', 'snapline') };
    document.body.appendChild(drag.line);
    drag.line.style.display = 'none';
    document.body.classList.add('dragging');
    updateDrag(e);
  }
  function over(rect, x, y) { return rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom; }
  function updateDrag(e) {
    const d = drag;
    d.el.style.left = (e.clientX - d.ox) + 'px'; d.el.style.top = (e.clientY - d.oy) + 'px';
    const pal = $('#pal').getBoundingClientRect(), ws = $('#ws').getBoundingClientRect();
    d.overPal = over(pal, e.clientX, e.clientY);
    $('#pal').classList.toggle('trash', d.overPal);
    d.overWs = over(ws, e.clientX, e.clientY);
    if (d.hl) { d.hl.classList.remove('hl'); d.hl = null; }
    d.snap = d.overWs ? findSnap(d.el.getBoundingClientRect(), d.dragged) : null;
    if (d.snap) {
      if (d.snap.kind === 'slot') { d.hl = d.snap.slot; d.hl.classList.add('hl'); d.line.style.display = 'none'; }
      else {
        d.line.style.display = 'block';
        d.line.style.left = d.snap.pt.x + 'px'; d.line.style.top = (d.snap.pt.y - 4) + 'px';
        d.line.style.width = Math.max(60, d.snap.w || 90) + 'px';
      }
    } else d.line.style.display = 'none';
    // auto-scroll del área de programación
    const wsEl = $('#ws');
    if (d.overWs) {
      if (e.clientY > ws.bottom - 36) wsEl.scrollTop += 14; else if (e.clientY < ws.top + 36) wsEl.scrollTop -= 14;
      if (e.clientX > ws.right - 36) wsEl.scrollLeft += 14; else if (e.clientX < ws.left + 36) wsEl.scrollLeft -= 14;
    }
  }

  function findSnap(dr, dragged) {
    const first = dragged[0], last = dragged[dragged.length - 1];
    const T = 34 * S.zoom + 14;
    let best = null;
    const consider = (c) => { if (!best || c.dist < best.dist) best = c; };
    const isR = (b) => kindOf(b) === 'bool' || kindOf(b) === 'rep';
    if (dragged.length === 1 && isR(first)) {
      const cx = dr.left, cy = (dr.top + dr.bottom) / 2;
      document.querySelectorAll('#wsin .condslot, #wsin .islot').forEach((slot) => {
        if (!slot._owner) return;
        if (!slot._acceptsRep && kindOf(first) !== 'bool') return;
        const r = slot.getBoundingClientRect();
        const dist = Math.hypot(cx - r.left, cy - (r.top + r.bottom) / 2);
        if (dist < T + 16) consider({ kind: 'slot', slot, owner: slot._owner, name: slot._name, dist });
      });
      return best;
    }
    if (isR(first)) return null;
    const canAttachBelow = !isEnd(last);
    document.querySelectorAll('#wsin .block').forEach((el) => {
      const loc = el._loc, b = el._b;
      if (!loc || loc.type !== 'stack') return;
      const r = el.getBoundingClientRect(), k = kindOf(b);
      if (k === 'bool' || k === 'rep') return;
      if (kindOf(first) !== 'hat') {
        if (!(k === 'cap' || B[b.op].noNext)) {
          const ok = isEnd(last) ? loc.idx + 1 >= loc.arr.length : true;
          if (ok) consider({ kind: 'after', arr: loc.arr, idx: loc.idx + 1, pt: { x: r.left, y: r.bottom }, w: r.width, dist: Math.hypot(dr.left - r.left, dr.top - r.bottom) });
        }
        if (k === 'c') {
          el._subs.forEach((sb) => {
            const sr = sb.el.getBoundingClientRect();
            const ok = isEnd(last) ? sb.arr.length === 0 : true;
            if (ok) consider({ kind: 'inside', arr: sb.arr, idx: 0, pt: { x: sr.left, y: sr.top }, w: sr.width, dist: Math.hypot(dr.left - sr.left, dr.top - sr.top) });
          });
        }
      }
      if (loc.top && k !== 'hat' && canAttachBelow) {
        consider({ kind: 'before', script: loc.script, pt: { x: r.left, y: r.top }, w: r.width, dist: Math.hypot(dr.left - r.left, dr.bottom - r.top) });
      }
    });
    return best && best.dist <= T ? best : null;
  }

  function finishDrag(e, cancelled) {
    const d = drag; drag = null;
    document.body.classList.remove('dragging');
    $('#pal').classList.remove('trash');
    if (d.hl) d.hl.classList.remove('hl');
    const dr = d.el.getBoundingClientRect();
    d.el.remove(); d.line.remove();
    const wsRect = $('#ws').getBoundingClientRect(), wsEl = $('#ws');
    const toWs = (x, y) => ({ x: Math.max(6, Math.round(x - wsRect.left + wsEl.scrollLeft)), y: Math.max(6, Math.round(y - wsRect.top + wsEl.scrollTop)) });
    let changed = true;
    if (cancelled) {
      const p = toWs(wsRect.left + 30, wsRect.top + 30);
      S.target.scripts.push({ x: p.x, y: p.y, blocks: d.dragged });
    } else if (d.overPal) {
      if (d.fromPal) changed = false;               // arrastrar desde la paleta y devolver: nada
    } else if (d.snap) {
      const sn = d.snap;
      if (sn.kind === 'after' || sn.kind === 'inside') sn.arr.splice.apply(sn.arr, [sn.idx, 0].concat(d.dragged));
      else if (sn.kind === 'before') {
        sn.script.blocks.unshift.apply(sn.script.blocks, d.dragged);
        const p = toWs(dr.left, dr.top); sn.script.x = p.x; sn.script.y = p.y;
      } else if (sn.kind === 'slot') {
        const old = slotGet(sn.owner, sn.name);
        slotSet(sn.owner, sn.name, d.dragged[0]);
        if (old) { const p = toWs(dr.left + 30, dr.top + 46); S.target.scripts.push({ x: p.x, y: p.y, blocks: [old] }); }
      }
    } else {
      const p = toWs(dr.left, dr.top);
      S.target.scripts.push({ x: p.x, y: p.y, blocks: d.dragged });
    }
    ED.renderWorkspace();
    if (changed) ED.changed();
  }

  /* ---------- menú contextual ---------- */
  let ctx = null;
  function closeCtx() { if (ctx) { ctx.remove(); ctx = null; } }
  function showCtx(x, y, items) {
    closeCtx();
    ctx = h('div', 'ctxmenu');
    items.forEach((it) => {
      const bt = h('button', '', it[0]); bt.type = 'button';
      bt.addEventListener('click', () => { closeCtx(); it[1](); });
      ctx.appendChild(bt);
    });
    document.body.appendChild(ctx);
    ctx.style.left = Math.min(x, innerWidth - 190) + 'px'; ctx.style.top = Math.min(y, innerHeight - 40 * items.length - 10) + 'px';
  }
  document.addEventListener('pointerdown', (e) => { if (ctx && !ctx.contains(e.target)) closeCtx(); }, true);

  function dupArr(arr, idx, script) {
    ED.pushUndo();
    const copy = PQ.clone(arr.slice(idx));
    S.target.scripts.push({ x: (script ? script.x : 40) + 36, y: (script ? script.y : 40) + 36, blocks: copy });
    ED.renderWorkspace(); ED.changed();
  }

  ED.init = function () {
    const ws = $('#ws'), pal = $('#pal');
    ws.addEventListener('pointerdown', (e) => { if (!e.target.closest('.block')) { selB = null; markSel(); } onDown(e, false); });
    pal.addEventListener('pointerdown', (e) => onDown(e, true));
    pal.addEventListener('scroll', updateCatActive);
    pal.addEventListener('contextmenu', (e) => {
      const be = e.target.closest('.block');
      if (be && be._b && be._b.op === 'data_variable') { e.preventDefault(); showCtx(e.clientX, e.clientY, [['Borrar variable «' + be._b.f.VARIABLE + '»', () => ED.deleteVariable(be._b.f.VARIABLE)]]); }
    });
    ws.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const be = e.target.closest('.block');
      if (be && be._loc) {
        const loc = be._loc;
        const items = [];
        if (loc.type === 'stack') {
          items.push(['Duplicar', () => dupArr(loc.arr, loc.idx, loc.script)]);
          items.push(['Borrar todo el conjunto', () => { selB = loc.arr[loc.idx]; deleteSelected(true); }]);
          items.push(['Borrar este bloque', () => {
            ED.pushUndo(); loc.arr.splice(loc.idx, 1);
            if (loc.script && loc.script.blocks.length === 0) S.target.scripts.splice(S.target.scripts.indexOf(loc.script), 1);
            ED.renderWorkspace(); ED.changed();
          }]);
        } else if (loc.type === 'in') {
          items.push(['Quitar este bloque', () => { ED.pushUndo(); slotSet(loc.owner, loc.name, null); ED.renderWorkspace(); ED.changed(); }]);
        } else {
          items.push(['Quitar condición', () => { ED.pushUndo(); loc.owner.cond = null; ED.renderWorkspace(); ED.changed(); }]);
        }
        showCtx(e.clientX, e.clientY, items);
      } else {
        showCtx(e.clientX, e.clientY, [['Ordenar los bloques', ED.cleanUp], ['Deshacer', ED.undo]]);
      }
    });
    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selB && !kp && !e.target.closest('input,textarea,select,[contenteditable]') && !document.querySelector('.modal-back,.modal')) {
        if (deleteSelected(e.shiftKey || e.ctrlKey || e.metaKey)) e.preventDefault();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z' && !e.target.closest('input,textarea,select')) { e.preventDefault(); ED.undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z')) && !e.target.closest('input,textarea,select')) { e.preventDefault(); ED.redo(); }
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
