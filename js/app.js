/* PequeBloques — diseñado por David OZC · © 2026 David OZC · CC BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/deed.es)
 * app.js: aplicación (pestañas, personajes, disfraces, sonidos, pintar, grabar, abrir/guardar .sb3)
 */
(function (g) {
  'use strict';
  const PQ = g.PQ, S = PQ.S, ED = PQ.ed, RT = PQ.RT, B = PQ.BLOCKS;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  function h(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  const ICO = {
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    copy: '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg>',
    list: '<svg viewBox="0 0 24 24"><path d="M3 7h6l2 2h10v10H3z"/></svg>',
    brush: '<svg viewBox="0 0 24 24"><path d="M4 20c4 0 6-2 6-4l-2-2c-2 0-4 2-4 6zM9 14l9-10 2 2-10 9z"/></svg>',
    up: '<svg viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5M4 20h16"/></svg>',
    dice: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.3" fill="currentColor"/><circle cx="15" cy="15" r="1.3" fill="currentColor"/><circle cx="15" cy="9" r="1.3" fill="currentColor"/><circle cx="9" cy="15" r="1.3" fill="currentColor"/></svg>',
    mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    stop: '<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/></svg>',
    undo: '<svg viewBox="0 0 24 24"><path d="M9 7L4 12l5 5M4 12h10a6 6 0 0 1 0 12"/></svg>',
    save: '<svg viewBox="0 0 24 24"><path d="M5 3h12l3 3v15H5z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/></svg>'
  };
  PQ.settings = { voice: false, level: 1 };

  /* ============================ UI genérica ============================ */
  const ui = PQ.ui = {};
  let modalStack = [];
  ui.modal = function (o) {
    const back = h('div', 'modal-back');
    const m = h('div', 'modal ' + (o.size || ''));
    m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', o.title || 'Ventana');
    const head = h('div', 'mh'); head.appendChild(h('h2', '', ''));
    head.firstChild.textContent = o.title || '';
    const cl = h('button', 'close'); cl.type = 'button'; cl.setAttribute('aria-label', 'Cerrar'); cl.innerHTML = ICO.close;
    head.appendChild(cl); m.appendChild(head);
    const body = h('div', 'mb');
    if (typeof o.body === 'string') body.innerHTML = o.body; else if (o.body) body.appendChild(o.body);
    m.appendChild(body);
    const api = { el: m, body, back, close: null };
    if (o.buttons && o.buttons.length) {
      const f = h('div', 'mf');
      o.buttons.forEach((b) => {
        const bt = h('button', 'btn ' + (b.cls || '')); bt.type = 'button'; bt.innerHTML = b.label;
        bt.addEventListener('click', () => { if (b.onClick) { const r = b.onClick(api); if (r === false) return; } if (b.close !== false) api.close(); });
        f.appendChild(bt); b.el = bt;
      });
      m.appendChild(f);
    }
    back.appendChild(m);
    const prevFocus = document.activeElement;
    api.close = (silent) => {
      if (!back.parentNode) return;
      back.remove(); modalStack = modalStack.filter((x) => x !== api);
      if (!silent && o.onClose) o.onClose();
      if (prevFocus && prevFocus.focus && document.body.contains(prevFocus)) { try { prevFocus.focus(); } catch (e) { /* nada */ } }
    };
    cl.addEventListener('click', () => api.close());
    back.addEventListener('pointerdown', (e) => { if (e.target === back && !o.sticky) api.close(); });
    $('#modalroot').appendChild(back);
    modalStack.push(api);
    setTimeout(() => {
      const f = o.focus ? $(o.focus, m) : (m.querySelector('input.big') || m.querySelector('.mf .btn.pri,.mf .btn.ok') || cl);
      if (f && f.focus) f.focus();
      if (f && f.select && f.tagName === 'INPUT') f.select();
    }, 30);
    return api;
  };
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalStack.length) { modalStack[modalStack.length - 1].close(); e.preventDefault(); }
    if (e.key === 'Tab' && modalStack.length) {
      const m = modalStack[modalStack.length - 1].el;
      const f = $$('button,input,select,textarea,[tabindex="0"]', m).filter((x) => !x.disabled && x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (!m.contains(document.activeElement)) { first.focus(); e.preventDefault(); }
      else if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    }
  });
  ui.prompt = function (title, def, ok, cancel) {
    const inp = h('input', 'big'); inp.type = 'text'; inp.value = def || ''; inp.maxLength = 40;
    let done = false;
    const m = ui.modal({
      title, size: 'sm', body: inp,
      buttons: [{ label: 'Cancelar', onClick: () => { done = true; if (cancel) cancel(); } }, { label: 'Aceptar', cls: 'ok', onClick: () => { done = true; ok(inp.value); } }],
      onClose: () => { if (!done && cancel) cancel(); }
    });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { done = true; ok(inp.value); m.close(true); } });
  };
  ui.confirm = function (title, msg, ok, opts) {
    opts = opts || {};
    const p = h('p'); p.textContent = msg;
    ui.modal({ title, size: 'sm', body: p, buttons: [{ label: opts.no || 'Cancelar' }, { label: opts.yes || 'Sí', cls: opts.cls || 'ok', onClick: () => ok() }] });
  };
  ui.ask = function (question, cb) {
    const inp = h('input', 'big'); inp.type = 'text'; inp.maxLength = 60;
    let done = false;
    const finish = () => { if (done) return; done = true; cb(inp.value); };
    const m = ui.modal({ title: question, size: 'sm', body: inp, sticky: true, buttons: [{ label: 'Listo', cls: 'ok', onClick: () => { finish(); } }], onClose: finish });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { finish(); m.close(true); } });
    if (PQ.say) PQ.say(question);
  };
  ui.toast = function (msg, o) {
    o = o || {};
    const t = h('div', 'toast' + (o.good ? ' good' : ''));
    const s = h('span'); s.textContent = msg; t.appendChild(s);
    (o.actions || []).forEach((a) => {
      const b = h('button', 'btn ' + (a.cls || 'yel')); b.type = 'button'; b.textContent = a.label;
      b.addEventListener('click', () => { t.remove(); a.onClick(); });
      t.appendChild(b);
    });
    $('#toasts').appendChild(t);
    setTimeout(() => t.remove(), o.ms || (o.actions ? 12000 : 4200));
    return t;
  };
  function popupMenu(anchor, items) {
    const old = $('.ctxmenu'); if (old) old.remove();
    const m = h('div', 'ctxmenu');
    items.forEach((it) => {
      const b = h('button'); b.type = 'button';
      b.innerHTML = '<span style="display:inline-flex;align-items:center;gap:10px"><span class="mi" style="width:22px;height:22px;display:inline-flex;color:#5b3bd0">' + it.icon + '</span>' + it.label + '</span>';
      b.addEventListener('click', () => { m.remove(); it.onClick(); });
      m.appendChild(b);
    });
    document.body.appendChild(m);
    $$('.mi svg', m).forEach((s) => { s.style.cssText = 'width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round'; });
    const r = anchor.getBoundingClientRect();
    m.style.left = Math.max(6, Math.min(r.left, innerWidth - 250)) + 'px';
    m.style.top = Math.max(6, r.top - items.length * 46 - 14) + 'px';
    const off = (e) => { if (!m.contains(e.target)) { m.remove(); document.removeEventListener('pointerdown', off, true); } };
    setTimeout(() => document.addEventListener('pointerdown', off, true), 0);
  }
  function confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cols = ['#FFBF00', '#4C97FF', '#9966FF', '#59D98E', '#FF6FA8', '#FF8A4D'];
    for (let i = 0; i < 60; i++) {
      const c = h('div', 'confetti');
      c.style.left = Math.random() * 100 + 'vw'; c.style.background = cols[i % cols.length];
      c.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px'); c.style.setProperty('--rot', (Math.random() * 720) + 'deg');
      c.style.animationDuration = (1.4 + Math.random() * 1.6) + 's'; c.style.animationDelay = Math.random() * 0.4 + 's';
      document.body.appendChild(c); setTimeout(() => c.remove(), 3600);
    }
  }
  ui.confetti = confetti;

  /* ============================ utilidades de proyecto ============================ */
  function walkAll(project, fn) {
    PQ.allTargets(project).forEach((t) => {
      (function walk(arr) { (arr || []).forEach((b) => { fn(b, t); if (b.cond) fn(b.cond, t); walk(b.sub); walk(b.sub2); }); })(
        [].concat.apply([], t.scripts.map((s) => s.blocks)));
    });
  }
  function renameRefs(kind, oldN, newN, target) {
    walkAll(S.project, (b, t) => {
      const f = b.f;
      if (kind === 'sprite') { if (f.TOUCHINGOBJECTMENU === oldN) f.TOUCHINGOBJECTMENU = newN; if (f.TO === oldN) f.TO = newN; }
      if (kind === 'costume' && t === target && f.COSTUME === oldN) f.COSTUME = newN;
      if (kind === 'backdrop' && f.BACKDROP === oldN) f.BACKDROP = newN;
      if (kind === 'sound' && t === target && f.SOUND_MENU === oldN) f.SOUND_MENU = newN;
    });
  }
  let dirty = false, autoTimer = 0;
  function markDirty() {
    dirty = true; clearTimeout(autoTimer);
    autoTimer = setTimeout(autosave, 2500);
  }
  PQ.markDirty = markDirty;
  const AUTOKEY = 'pequebloques.auto';
  function autosave() {
    try {
      if (!S.project) return;
      const bytes = PQ.exportSb3(S.project);
      const data = PQ.b64(bytes);
      if (data.length > 4200000) return;
      localStorage.setItem(AUTOKEY, JSON.stringify({ title: S.project.title, ts: Date.now(), data }));
      $('#btnLast').hidden = false;
    } catch (e) { /* almacenamiento lleno o bloqueado */ }
  }
  function readAuto() {
    try { const r = localStorage.getItem(AUTOKEY); return r ? JSON.parse(r) : null; } catch (e) { return null; }
  }

  function defaultProject() {
    const p = PQ.newProject();
    p.stage.costumes.push(PQ.makeBackdrop('playa'));
    const s = PQ.makeSprite('canario', p);
    s.x = -110; s.y = -40;
    s.sounds.push(PQ.makeSound('Pop'));
    p.sprites.push(s);
    p.messages = ['mensaje1'];
    return p;
  }
  PQ.defaultProject = defaultProject;
  PQ.addDefaultSound = (t) => { if (!t.sounds.length) t.sounds.push(PQ.makeSound('Pop')); };

  function loadProject(p, opts) {
    opts = opts || {};
    RT.stopAll();
    if (g.speechSynthesis) try { g.speechSynthesis.cancel(); } catch (e) { /* nada */ }
    p.messages = p.messages && p.messages.length ? p.messages : ['mensaje1'];
    PQ.allTargets(p).forEach((t) => { if (!t.costumes.length) t.costumes.push(PQ.mkCostume('disfraz1', '<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"></svg>', 'svg', 1, 1)); });
    S.project = p;
    RT.setProject(p);
    S.level = Math.max(PQ.settings.level, PQ.projectLevel(p));
    S.target = p.sprites[0] || p.stage;
    $('#title').value = p.title || 'Mi proyecto';
    hideBanner();
    if (PQ.Tut) PQ.Tut.stop(true);
    if (opts.banner) showBanner(opts.banner);
    updateLevelBtn();
    renderAll();
    if (PQ.padAuto) PQ.padAuto();
    dirty = false;
    if (!opts.noAuto) markDirty();
    $('#ws').scrollTop = 0; $('#ws').scrollLeft = 0;
  }
  PQ.loadProject = loadProject;

  function updateLevelBtn() {
    const on = S.level >= 2;
    $('#btnLevel').setAttribute('aria-pressed', String(on));
    $('#levelLabel').textContent = on ? 'Más bloques' : 'Pocos bloques';
  }

  /* ============================ aviso (reto) ============================ */
  function showBanner(text) {
    const b = $('#banner');
    b.innerHTML = '<span class="bi"><svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6L12 16.7 6.7 19.6l1.1-6L3.4 9.4l6-.8z"/></svg></span><button type="button" class="bsp" aria-label="Escuchar el reto" title="Escuchar el reto"><svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg></button><span class="bt"></span><button type="button" class="bx" aria-label="Cerrar aviso">×</button>';
    $('.bt', b).textContent = text;
    PQ._challenge = text;
    $('.bsp', b).addEventListener('click', () => PQ.say(text, true));
    $('.bx', b).addEventListener('click', hideBanner);
    b.hidden = false;
  }
  function hideBanner() { $('#banner').hidden = true; PQ._challenge = null; }
  PQ.showBanner = showBanner;

  /* ============================ renderizado general ============================ */
  function renderAll() {
    renderSprites(); renderInfo(); ED.refreshAll(); renderSidePanes(); updateUndoBtns();
  }
  PQ.renderAll = renderAll;
  PQ.selectTarget = function (t) {
    if (S.target === t) return;
    ED.closeKeypad();
    S.target = t; renderAll();
  };
  function thumb(t) { const c = t.costumes[t.current] || t.costumes[0]; return c ? PQ.costumeURL(c) : ''; }

  function renderSprites() {
    const list = $('#spritelist'); list.innerHTML = '';
    S.project.sprites.forEach((s) => {
      const t = h('div', 'stile' + (S.target === s ? ' on' : ''));
      t.tabIndex = 0; t.setAttribute('role', 'option'); t.setAttribute('aria-selected', String(S.target === s)); t.dataset.id = s.id;
      const im = h('img'); im.alt = ''; im.src = thumb(s); im._cur = s.current; t.appendChild(im);
      const nm = h('div', 'nm'); nm.textContent = s.name; t.appendChild(nm);
      const x = h('button', 'x'); x.type = 'button'; x.title = 'Borrar este personaje'; x.setAttribute('aria-label', 'Borrar ' + s.name); x.innerHTML = ICO.trash;
      const d = h('button', 'dup'); d.type = 'button'; d.title = 'Copiar este personaje'; d.setAttribute('aria-label', 'Copiar ' + s.name); d.innerHTML = ICO.copy;
      t.appendChild(x); t.appendChild(d);
      t.addEventListener('click', (e) => { if (e.target.closest('.x')) deleteSprite(s); else if (e.target.closest('.dup')) duplicateSprite(s); else PQ.selectTarget(s); });
      t.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); PQ.selectTarget(s); } });
      list.appendChild(t);
    });
    const st = $('#stagetile');
    const sc = S.project.stage.costumes[S.project.stage.current];
    st.style.backgroundImage = sc ? 'url("' + PQ.costumeURL(sc) + '")' : 'none';
    st.classList.toggle('on', S.target.isStage);
    st.setAttribute('aria-pressed', String(S.target.isStage));
  }
  function renderInfo() {
    const t = S.target, isSt = t.isStage;
    $('#spriteinfo').classList.toggle('isstage', isSt);
    const ae = document.activeElement;
    const set = (id, v) => { const e = $(id); if (e !== ae) e.value = v; };
    set('#inName', isSt ? 'Escenario' : t.name);
    $('#inName').disabled = isSt;
    ['#inX', '#inY', '#inSize', '#inDir'].forEach((i) => { $(i).disabled = isSt; });
    $('#btnShow').disabled = $('#btnHide').disabled = isSt;
    if (!isSt) {
      set('#inX', Math.round(t.x)); set('#inY', Math.round(t.y)); set('#inSize', Math.round(t.size)); set('#inDir', Math.round(t.direction));
      $('#btnShow').classList.toggle('on', t.visible); $('#btnHide').classList.toggle('on', !t.visible);
    }
    $('#costTabName').textContent = isSt ? 'Fondos' : 'Disfraces';
  }
  function updateUndoBtns() { /* siempre activos */ }

  /* ============================ pestañas ============================ */
  let curTab = 'code';
  function showTab(name) {
    curTab = name;
    ['code', 'cost', 'sound'].forEach((n) => {
      $('#pane-' + n).hidden = n !== name;
      const b = $('#tabbtn-' + n); b.classList.toggle('on', n === name); b.setAttribute('aria-selected', String(n === name));
    });
    renderSidePanes();
  }
  function renderSidePanes() {
    if (curTab === 'cost') renderCostPane();
    if (curTab === 'sound') renderSoundPane();
  }

  /* ---------- Disfraces ---------- */
  function renderCostPane() {
    const pane = $('#pane-cost'); const t = S.target; const isSt = t.isStage;
    pane.innerHTML = '';
    const col = h('div', 'listcol');
    const top = h('div', 'row2');
    [[isSt ? 'Elegir fondo' : 'Elegir disfraz', ICO.list, 'pri', () => openLibrary(isSt ? 'backdrop' : 'costume')],
      ['Pintar', ICO.brush, '', () => openPaint(null)],
      ['Subir', ICO.up, '', () => pickImage((c) => addCostume(c))]].forEach((b) => {
      const bt = h('button', 'btn ' + b[2], b[1] + '<span>' + b[0] + '</span>'); bt.type = 'button'; bt.addEventListener('click', b[3]); top.appendChild(bt);
    });
    col.appendChild(top);
    t.costumes.forEach((c, i) => {
      const it = h('div', 'item' + (i === t.current ? ' on' : '')); it.tabIndex = 0; it.setAttribute('role', 'button');
      it.innerHTML = '<span class="num">' + (i + 1) + '</span>';
      const im = h('img'); im.alt = ''; im.src = PQ.costumeURL(c); it.appendChild(im);
      const nm = h('span', 'nm'); nm.textContent = c.name; it.appendChild(nm);
      const del = h('button', 'del'); del.type = 'button'; del.innerHTML = ICO.trash; del.setAttribute('aria-label', 'Borrar ' + c.name);
      it.appendChild(del);
      const sel = () => { t.current = i; RT.dirty = true; markDirty(); renderCostPane(); renderSprites(); };
      it.addEventListener('click', (e) => { if (e.target.closest('.del')) deleteCostume(i); else sel(); });
      it.addEventListener('keydown', (e) => { if (e.key === 'Enter') sel(); });
      col.appendChild(it);
    });
    const ed = h('div', 'editcol');
    const c = t.costumes[t.current];
    ed.appendChild(h('h2', '', isSt ? 'Mi fondo' : 'Mi disfraz'));
    const rn = h('input', 'rname'); rn.type = 'text'; rn.value = c.name; rn.maxLength = 30; rn.setAttribute('aria-label', 'Nombre');
    rn.addEventListener('change', () => {
      const names = t.costumes.filter((x) => x !== c).map((x) => x.name);
      const nn = PQ.uniqueName(rn.value.trim() || 'disfraz', names);
      renameRefs(isSt ? 'backdrop' : 'costume', c.name, nn, t); c.name = nn; rn.value = nn; markDirty(); ED.refreshAll(); renderCostPane();
    });
    ed.appendChild(rn);
    const pv = h('div', 'bigprev'); const pi = h('img'); pi.alt = 'Vista previa'; pi.src = PQ.costumeURL(c); pv.appendChild(pi); ed.appendChild(pv);
    const acts = h('div', 'row2');
    [['Dibujar encima', ICO.brush, 'yel', () => openPaint(c)], ['Copiar', ICO.copy, '', () => duplicateCostume()], ['Borrar', ICO.trash, 'red', () => deleteCostume(t.current)]].forEach((b) => {
      const bt = h('button', 'btn ' + b[2], b[1] + '<span>' + b[0] + '</span>'); bt.type = 'button'; bt.addEventListener('click', b[3]); acts.appendChild(bt);
    });
    ed.appendChild(acts);
    ed.appendChild(h('p', 'hint', isSt ? 'Los fondos también se pueden cambiar con el bloque «cambiar fondo a».' : 'Cambia de disfraz con los bloques «siguiente disfraz» o «cambiar disfraz a» para animar a tu personaje.'));
    pane.appendChild(col); pane.appendChild(ed);
  }
  function addCostume(c, makeCurrent) {
    const t = S.target;
    c.name = PQ.uniqueName(c.name || (t.isStage ? 'fondo' : 'disfraz'), t.costumes.map((x) => x.name));
    t.costumes.push(c);
    if (makeCurrent !== false) t.current = t.costumes.length - 1;
    RT.dirty = true; markDirty(); renderAll();
    ED.refreshAll();
  }
  function duplicateCostume() {
    const t = S.target, c = t.costumes[t.current];
    const n = Object.assign({}, c); delete n._img; delete n._url; delete n._ad; delete n._ready; delete n._w; delete n._h;
    n.name = PQ.uniqueName(c.name, t.costumes.map((x) => x.name));
    t.costumes.splice(t.current + 1, 0, n); t.current++;
    markDirty(); renderAll();
  }
  function deleteCostume(i) {
    const t = S.target;
    if (t.costumes.length <= 1) { ui.toast('Tiene que quedar al menos uno.'); return; }
    ui.confirm('¿Borrar?', 'Se borrará «' + t.costumes[i].name + '».', () => {
      t.costumes.splice(i, 1); t.current = Math.min(t.current, t.costumes.length - 1);
      RT.dirty = true; markDirty(); renderAll();
    }, { yes: 'Borrar', cls: 'red' });
  }

  /* ---------- Sonidos ---------- */
  function renderSoundPane() {
    const pane = $('#pane-sound'); const t = S.target;
    pane.innerHTML = '';
    const col = h('div', 'listcol');
    const top = h('div', 'row2');
    [['Elegir sonido', ICO.list, 'pri', () => openLibrary('sound')], ['Grabar', ICO.mic, '', openRecord], ['Subir', ICO.up, '', pickSound]].forEach((b) => {
      const bt = h('button', 'btn ' + b[2], b[1] + '<span>' + b[0] + '</span>'); bt.type = 'button'; bt.addEventListener('click', b[3]); top.appendChild(bt);
    });
    col.appendChild(top);
    if (!t.sounds.length) col.appendChild(h('p', 'hint', 'Aún no hay sonidos. ¡Elige uno o graba tu voz!'));
    if (curSound >= t.sounds.length) curSound = Math.max(0, t.sounds.length - 1);
    t.sounds.forEach((s, i) => {
      const it = h('div', 'item' + (i === curSound ? ' on' : '')); it.tabIndex = 0; it.setAttribute('role', 'button');
      it.innerHTML = '<span class="num">' + (i + 1) + '</span><span style="width:46px;height:46px;border-radius:50%;background:#CF63CF;display:flex;align-items:center;justify-content:center;flex:none"><svg viewBox="0 0 24 24" style="width:26px;height:26px;fill:none;stroke:#fff;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6"/></svg></span>';
      const nm = h('span', 'nm'); nm.textContent = s.name; it.appendChild(nm);
      const del = h('button', 'del'); del.type = 'button'; del.innerHTML = ICO.trash; del.setAttribute('aria-label', 'Borrar ' + s.name); it.appendChild(del);
      const sel = () => { curSound = i; PQ.playSoundObj(s); renderSoundPane(); };
      it.addEventListener('click', (e) => { if (e.target.closest('.del')) deleteSound(i); else sel(); });
      it.addEventListener('keydown', (e) => { if (e.key === 'Enter') sel(); });
      col.appendChild(it);
    });
    const ed = h('div', 'editcol');
    ed.appendChild(h('h2', '', 'Mi sonido'));
    if (t.sounds.length) {
      const s = t.sounds[curSound];
      const rn = h('input', 'rname'); rn.type = 'text'; rn.value = s.name; rn.maxLength = 30; rn.setAttribute('aria-label', 'Nombre');
      rn.addEventListener('change', () => {
        const nn = PQ.uniqueName(rn.value.trim() || 'sonido', t.sounds.filter((x) => x !== s).map((x) => x.name));
        renameRefs('sound', s.name, nn, t); s.name = nn; markDirty(); ED.refreshAll(); renderSoundPane();
      });
      ed.appendChild(rn);
      const acts = h('div', 'row2');
      const pl = h('button', 'btn ok', ICO.play + '<span>Escuchar</span>'); pl.type = 'button'; pl.addEventListener('click', () => PQ.playSoundObj(s));
      const st = h('button', 'btn', ICO.stop + '<span>Parar</span>'); st.type = 'button'; st.addEventListener('click', PQ.stopSounds);
      acts.appendChild(pl); acts.appendChild(st); ed.appendChild(acts);
      ed.appendChild(h('p', 'hint', (s.count && s.rate ? 'Dura ' + (s.count / s.rate).toFixed(1) + ' segundos. ' : '') + 'Usa los bloques de Sonido para que suene en tu programa.'));
    }
    pane.appendChild(col); pane.appendChild(ed);
  }
  let curSound = 0;
  function deleteSound(i) {
    const t = S.target;
    ui.confirm('¿Borrar?', 'Se borrará «' + t.sounds[i].name + '».', () => { t.sounds.splice(i, 1); markDirty(); ED.refreshAll(); renderSoundPane(); }, { yes: 'Borrar', cls: 'red' });
  }
  function addSound(s) {
    const t = S.target;
    s.name = PQ.uniqueName(s.name, t.sounds.map((x) => x.name));
    t.sounds.push(s); curSound = t.sounds.length - 1;
    markDirty(); ED.refreshAll(); if (curTab === 'sound') renderSoundPane();
  }

  /* ============================ personajes ============================ */
  function placeNew(s) {
    const n = S.project.sprites.length;
    s.x = [-120, 90, -30, 140, -170, 20][n % 6]; s.y = [-30, -50, 40, 30, 50, -80][n % 6];
  }
  function addSprite(s, select) {
    placeNew(s);
    PQ.addDefaultSound(s);
    S.project.sprites.push(s);
    if (select !== false) S.target = s;
    RT.dirty = true; markDirty(); renderAll();
  }
  function duplicateSprite(s) {
    const n = PQ.newTarget(PQ.uniqueName(s.name, S.project.sprites.map((x) => x.name)), false);
    s.costumes.forEach((c) => { const k = Object.assign({}, c); delete k._img; delete k._url; delete k._ad; delete k._ready; delete k._w; delete k._h; n.costumes.push(k); });
    s.sounds.forEach((x) => { const k = Object.assign({}, x); delete k._p; n.sounds.push(k); });
    n.current = s.current; n.scripts = PQ.clone(s.scripts); n.size = s.size; n.direction = s.direction; n.rotationStyle = s.rotationStyle;
    n.x = Math.min(220, s.x + 30); n.y = Math.max(-170, s.y - 25);
    S.project.sprites.push(n); S.target = n; RT.dirty = true; markDirty(); renderAll();
  }
  function deleteSprite(s) {
    ui.confirm('¿Borrar personaje?', 'Se borrará «' + s.name + '» y sus bloques.', () => {
      const i = S.project.sprites.indexOf(s);
      S.project.sprites.splice(i, 1);
      RT.threads = RT.threads.filter((th) => { if (th.target === s) { th.dead = true; return false; } return true; });
      S.target = S.project.sprites[Math.min(i, S.project.sprites.length - 1)] || S.project.stage;
      RT.dirty = true; markDirty(); renderAll();
    }, { yes: 'Borrar', cls: 'red' });
  }

  /* ============================ bibliotecas ============================ */
  let sndPrev = null;
  function openLibrary(kind) {
    const body = h('div');
    const gridEl = h('div', 'grid'); body.appendChild(gridEl);
    let title = '', m;
    const done = () => m.close();
    if (kind === 'sprite') {
      title = 'Elige un personaje';
      PQ.SPRITE_LIB.forEach((it) => {
        const c = h('button', 'card'); c.type = 'button';
        c.innerHTML = '<img alt=""><span></span>'; $('img', c).src = URL.createObjectURL(new Blob([it.costumes[0][1]], { type: 'image/svg+xml' })); $('span', c).textContent = it.name;
        c.addEventListener('click', () => { addSprite(PQ.makeSprite(it.id, S.project)); done(); ui.toast('¡' + it.name + ' ya está en tu proyecto!', { good: true }); });
        gridEl.appendChild(c);
      });
    } else if (kind === 'costume') {
      title = 'Elige un disfraz';
      PQ.SPRITE_LIB.forEach((it) => it.costumes.forEach((cs, i) => {
        const c = h('button', 'card'); c.type = 'button';
        c.innerHTML = '<img alt=""><span></span>'; $('img', c).src = URL.createObjectURL(new Blob([cs[1]], { type: 'image/svg+xml' })); $('span', c).textContent = it.name + ' ' + (i + 1);
        c.addEventListener('click', () => { addCostume(PQ.mkCostume(it.name + ' ' + (i + 1), cs[1], 'svg', 60, 60)); done(); });
        gridEl.appendChild(c);
      }));
    } else if (kind === 'backdrop') {
      title = 'Elige un fondo';
      PQ.BACKDROP_LIB.forEach((it) => {
        const c = h('button', 'card bd'); c.type = 'button';
        c.innerHTML = '<img alt=""><span></span>'; $('img', c).src = URL.createObjectURL(new Blob([it.svg], { type: 'image/svg+xml' })); $('span', c).textContent = it.name;
        c.addEventListener('click', () => {
          const prev = S.target; S.target = S.project.stage;
          addCostume(PQ.makeBackdrop(it.id)); S.target = prev; renderAll(); done();
        });
        gridEl.appendChild(c);
      });
    } else if (kind === 'sound') {
      title = 'Elige un sonido';
      PQ.SOUND_LIB.forEach((it) => {
        const c = h('button', 'card'); c.type = 'button';
        c.innerHTML = '<span class="snd"><svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg></span><span></span>';
        $('span:last-child', c).textContent = it.name;
        c.addEventListener('click', () => { const s = PQ.makeSound(it.name); PQ.playSoundObj(s); addSound(s); done(); });
        gridEl.appendChild(c);
      });
      body.appendChild(h('p', 'hint', 'Al elegir un sonido lo escucharás y se añadirá a tu personaje.'));
    }
    m = ui.modal({ title, body, buttons: [{ label: 'Cerrar' }] });
    if (sndPrev) sndPrev = null;
  }

  /* ============================ imágenes y sonidos desde archivos ============================ */
  function readFile(file, mode) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result); r.onerror = () => rej(r.error);
      if (mode === 'text') r.readAsText(file); else r.readAsArrayBuffer(file);
    });
  }
  function loadImg(url) { return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('No se puede leer la imagen')); im.src = url; }); }
  function canvasPng(cv) { return new Promise((res) => cv.toBlob((b) => b.arrayBuffer().then((ab) => res(new Uint8Array(ab))), 'image/png')); }

  async function imageFileToCostume(file, asBackdrop) {
    const name = file.name.replace(/\.[^.]+$/, '').slice(0, 24) || 'imagen';
    if (/\.svg$/i.test(file.name) || file.type === 'image/svg+xml') {
      const txt = PQ.normSvg(await readFile(file, 'text'));
      const doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
      const w = parseFloat(doc.documentElement.getAttribute('width')) || 100, hh = parseFloat(doc.documentElement.getAttribute('height')) || 100;
      return PQ.mkCostume(name, txt, 'svg', w / 2, hh / 2, 1);
    }
    const url = URL.createObjectURL(file);
    try {
      const im = await loadImg(url);
      const cv = document.createElement('canvas'); const cx = cv.getContext('2d');
      if (asBackdrop) {
        cv.width = 960; cv.height = 720;
        const k = Math.max(960 / im.naturalWidth, 720 / im.naturalHeight);
        const w = im.naturalWidth * k, hh = im.naturalHeight * k;
        cx.drawImage(im, (960 - w) / 2, (720 - hh) / 2, w, hh);
        return PQ.mkCostume(name, await canvasPng(cv), 'png', 480, 360, 2);
      }
      const k = Math.min(1, 480 / im.naturalWidth, 480 / im.naturalHeight);
      cv.width = Math.max(1, Math.round(im.naturalWidth * k)); cv.height = Math.max(1, Math.round(im.naturalHeight * k));
      cx.drawImage(im, 0, 0, cv.width, cv.height);
      return PQ.mkCostume(name, await canvasPng(cv), 'png', cv.width / 2, cv.height / 2, 2);
    } finally { URL.revokeObjectURL(url); }
  }
  function pickImage(cb, asBackdrop) {
    const f = $('#fileImg'); f.value = '';
    f.onchange = async () => {
      if (!f.files[0]) return;
      try { cb(await imageFileToCostume(f.files[0], asBackdrop)); } catch (e) { ui.toast('No he podido abrir esa imagen.'); }
    };
    f.click();
  }
  function bufferToWavBytes(buf) {
    const ch = buf.numberOfChannels, len = buf.length, mono = new Float32Array(len);
    for (let c = 0; c < ch; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) mono[i] += d[i] / ch; }
    const rate = Math.min(22050, buf.sampleRate), ratio = buf.sampleRate / rate;
    const maxSec = 20, n = Math.min(Math.floor(len / ratio), rate * maxSec), out = new Float32Array(n);
    for (let i = 0; i < n; i++) { const p = i * ratio, i0 = Math.floor(p), f = p - i0; out[i] = mono[i0] * (1 - f) + (mono[i0 + 1] !== undefined ? mono[i0 + 1] : mono[i0]) * f; }
    let peak = 0; for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(out[i]));
    if (peak > 0 && peak < 0.5) for (let i = 0; i < n; i++) out[i] = out[i] * (0.8 / peak);
    return { bytes: PQ.makeWav(out, rate), rate, count: n };
  }
  async function blobToSound(blobOrBuf, name) {
    const ctx = PQ.audioCtx();
    if (!ctx) throw new Error('Sin audio');
    const ab = blobOrBuf instanceof ArrayBuffer ? blobOrBuf : await blobOrBuf.arrayBuffer();
    const buf = await new Promise((res, rej) => { const r = ctx.decodeAudioData(ab, res, rej); if (r && r.then) r.then(res, rej); });
    const w = bufferToWavBytes(buf);
    return { name, fmt: 'wav', bytes: w.bytes, rate: w.rate, count: w.count };
  }
  function pickSound() {
    const f = $('#fileSnd'); f.value = '';
    f.onchange = async () => {
      if (!f.files[0]) return;
      try { addSound(await blobToSound(await readFile(f.files[0]), f.files[0].name.replace(/\.[^.]+$/, '').slice(0, 24) || 'sonido')); }
      catch (e) { ui.toast('No he podido abrir ese sonido.'); }
    };
    f.click();
  }

  /* ---------- grabar ---------- */
  function openRecord() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') { ui.toast('Este navegador no permite grabar la voz.'); return; }
    const body = h('div');
    body.innerHTML = '<p id="recMsg">Pulsa el micrófono y habla. Luego pulsa parar.</p><div class="vu"><i id="recVu"></i></div><div class="row2" id="recBtns"></div>';
    let stream, rec, chunks = [], blob = null, an, raf, ctx2, st = 'idle';
    const msg = $('#recMsg', body), vu = $('#recVu', body), btns = $('#recBtns', body);
    const m = ui.modal({
      title: 'Grabar mi voz', size: 'sm', body,
      buttons: [{ label: 'Cancelar', onClick: () => cleanup() }, {
        label: 'Guardar sonido', cls: 'ok', onClick: async () => {
          if (!blob) { ui.toast('Primero graba algo.'); return false; }
          try { addSound(await blobToSound(blob, 'grabación ' + (S.target.sounds.length + 1))); cleanup(); } catch (e) { ui.toast('No he podido guardar la grabación.'); }
        }
      }],
      onClose: () => cleanup()
    });
    function cleanup() { cancelAnimationFrame(raf); try { if (rec && rec.state !== 'inactive') rec.stop(); } catch (e) { /* ya parado */ } if (stream) stream.getTracks().forEach((t) => t.stop()); try { if (ctx2) ctx2.close(); } catch (e) { /* nada */ } }
    function draw() {
      if (!an) return;
      const d = new Uint8Array(an.fftSize); an.getByteTimeDomainData(d);
      let mx = 0; for (let i = 0; i < d.length; i++) mx = Math.max(mx, Math.abs(d[i] - 128));
      vu.style.width = Math.min(100, mx * 1.6) + '%'; raf = requestAnimationFrame(draw);
    }
    function btnsRender() {
      btns.innerHTML = '';
      const add = (txt, ico, cls, fn) => { const b = h('button', 'btn ' + cls, ico + '<span>' + txt + '</span>'); b.type = 'button'; b.addEventListener('click', fn); btns.appendChild(b); };
      if (st === 'idle') add('Grabar', ICO.mic, 'red', start);
      if (st === 'rec') add('Parar', ICO.stop, 'red', () => rec.stop());
      if (st === 'done') { add('Escuchar', ICO.play, 'ok', () => { const a = new Audio(URL.createObjectURL(blob)); a.play(); }); add('Otra vez', ICO.mic, '', () => { st = 'idle'; blob = null; btnsRender(); }); }
    }
    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        rec = new MediaRecorder(stream); chunks = [];
        rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
        rec.onstop = () => { blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' }); st = 'done'; msg.textContent = '¡Listo! Escúchalo y guárdalo.'; vu.style.width = '0'; cancelAnimationFrame(raf); stream.getTracks().forEach((t) => t.stop()); btnsRender(); };
        const AC = g.AudioContext || g.webkitAudioContext; ctx2 = new AC(); an = ctx2.createAnalyser(); ctx2.createMediaStreamSource(stream).connect(an);
        rec.start(); st = 'rec'; msg.textContent = 'Grabando… ¡habla!'; btnsRender(); draw();
      } catch (e) { msg.textContent = 'No tengo permiso para usar el micrófono. Revisa los permisos del navegador.'; }
    }
    btnsRender();
  }

  /* ============================ pintar ============================ */
  const PCOLORS = ['#000000', '#7a7a7a', '#ffffff', '#E64040', '#FF8A4D', '#FFD91A', '#59D98E', '#2FB37D', '#4C97FF', '#9966FF', '#FF6FA8', '#8A5A32'];
  function openPaint(existing, onDone) {
    const isSt = !onDone && S.target.isStage;
    const CW = isSt ? 480 : 300, CH = isSt ? 360 : 300, RES = isSt ? 1 : 2;
    const wrap = h('div', 'paint');
    const cw = h('div', 'pcanvaswrap'); const cv = h('canvas'); cv.id = 'paintCv'; cv.width = CW; cv.height = CH;
    if (isSt) cv.style.cssText = 'width:min(440px,84vw);height:auto;aspect-ratio:4/3';
    cw.appendChild(cv); wrap.appendChild(cw);
    const tools = h('div', 'ptools'); wrap.appendChild(tools);
    const cx = cv.getContext('2d', { willReadFrequently: true });
    cx.lineCap = 'round'; cx.lineJoin = 'round';
    let tool = 'pen', color = PCOLORS[0], size = 10, drawing = false, last = null, snap = null, start = null;
    const hist = [];
    const pushH = () => { hist.push(cx.getImageData(0, 0, CW, CH)); if (hist.length > 20) hist.shift(); };
    const tb = h('div', 'ptb');
    const toolBtns = {};
    [['pen', 'Lápiz'], ['eraser', 'Goma'], ['fill', 'Bote'], ['line', 'Línea'], ['rect', 'Cuadrado'], ['circle', 'Círculo']].forEach((t) => {
      const b = h('button', 'btn' + (t[0] === tool ? ' on' : ''), t[1]); b.type = 'button';
      b.addEventListener('click', () => { tool = t[0]; Object.keys(toolBtns).forEach((k) => toolBtns[k].classList.toggle('on', k === tool)); });
      toolBtns[t[0]] = b; tb.appendChild(b);
    });
    tools.appendChild(tb);
    const cols = h('div', 'pcolors');
    PCOLORS.forEach((c, i) => {
      const b = h('button', 'pcol' + (i === 0 ? ' on' : '')); b.type = 'button'; b.style.background = c; b.setAttribute('aria-label', 'Color ' + (i + 1));
      b.addEventListener('click', () => { color = c; $$('.pcol', cols).forEach((x) => x.classList.toggle('on', x === b)); if (tool === 'eraser') { tool = 'pen'; Object.keys(toolBtns).forEach((k) => toolBtns[k].classList.toggle('on', k === tool)); } });
      cols.appendChild(b);
    });
    tools.appendChild(cols);
    const sz = h('div', 'psizes');
    [4, 10, 22].forEach((s, i) => {
      const b = h('button', 'psz' + (i === 1 ? ' on' : '')); b.type = 'button'; b.setAttribute('aria-label', 'Grosor ' + (i + 1));
      b.innerHTML = '<i style="width:' + (s * 0.9 + 4) + 'px;height:' + (s * 0.9 + 4) + 'px"></i>';
      b.addEventListener('click', () => { size = s; $$('.psz', sz).forEach((x) => x.classList.toggle('on', x === b)); });
      sz.appendChild(b);
    });
    tools.appendChild(sz);
    const act = h('div', 'ptb');
    const bu = h('button', 'btn', ICO.undo + '<span>Deshacer</span>'); bu.type = 'button';
    bu.addEventListener('click', () => { if (hist.length > 1) { hist.pop(); cx.putImageData(hist[hist.length - 1], 0, 0); } });
    const bc = h('button', 'btn red', ICO.trash + '<span>Borrar todo</span>'); bc.type = 'button';
    bc.addEventListener('click', () => { cx.clearRect(0, 0, CW, CH); pushH(); });
    act.appendChild(bu); act.appendChild(bc); tools.appendChild(act);

    const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * CW / r.width, y: (e.clientY - r.top) * CH / r.height }; };
    function floodFill(x, y) {
      x = Math.floor(x); y = Math.floor(y);
      const img = cx.getImageData(0, 0, CW, CH), d = img.data;
      const idx = (px, py) => (py * CW + px) * 4;
      const t0 = [d[idx(x, y)], d[idx(x, y) + 1], d[idx(x, y) + 2], d[idx(x, y) + 3]];
      const rgb = color.replace('#', ''); const f = [parseInt(rgb.slice(0, 2), 16), parseInt(rgb.slice(2, 4), 16), parseInt(rgb.slice(4, 6), 16), 255];
      if (t0[0] === f[0] && t0[1] === f[1] && t0[2] === f[2] && t0[3] === f[3]) return;
      const near = (i) => Math.abs(d[i] - t0[0]) + Math.abs(d[i + 1] - t0[1]) + Math.abs(d[i + 2] - t0[2]) + Math.abs(d[i + 3] - t0[3]) < 60;
      const stack = [[x, y]], seen = new Uint8Array(CW * CH);
      while (stack.length) {
        const p = stack.pop(); let px = p[0], py = p[1];
        while (py >= 0 && near(idx(px, py)) && !seen[py * CW + px]) py--;
        py++;
        let l = false, r = false;
        while (py < CH && near(idx(px, py)) && !seen[py * CW + px]) {
          seen[py * CW + px] = 1; const i = idx(px, py); d[i] = f[0]; d[i + 1] = f[1]; d[i + 2] = f[2]; d[i + 3] = 255;
          if (px > 0) { if (near(idx(px - 1, py)) && !seen[py * CW + px - 1]) { if (!l) { stack.push([px - 1, py]); l = true; } } else l = false; }
          if (px < CW - 1) { if (near(idx(px + 1, py)) && !seen[py * CW + px + 1]) { if (!r) { stack.push([px + 1, py]); r = true; } } else r = false; }
          py++;
        }
      }
      cx.putImageData(img, 0, 0);
    }
    function shape(a, b, preview) {
      cx.save(); cx.strokeStyle = color; cx.lineWidth = size; cx.globalCompositeOperation = 'source-over';
      cx.beginPath();
      if (tool === 'line') { cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); }
      else if (tool === 'rect') cx.rect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y));
      else if (tool === 'circle') cx.ellipse((a.x + b.x) / 2, (a.y + b.y) / 2, Math.abs(b.x - a.x) / 2, Math.abs(b.y - a.y) / 2, 0, 0, 6.2832);
      cx.stroke(); cx.restore();
    }
    cv.addEventListener('pointerdown', (e) => {
      e.preventDefault(); cv.setPointerCapture(e.pointerId);
      const p = pos(e); start = p; last = p;
      if (tool === 'fill') { floodFill(p.x, p.y); pushH(); return; }
      drawing = true;
      if (tool === 'pen' || tool === 'eraser') {
        cx.save(); cx.lineWidth = size; cx.strokeStyle = color; cx.fillStyle = color;
        cx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
        cx.beginPath(); cx.arc(p.x, p.y, size / 2, 0, 6.2832); cx.fill(); cx.restore();
      } else snap = cx.getImageData(0, 0, CW, CH);
    });
    cv.addEventListener('pointermove', (e) => {
      if (!drawing) return;
      const p = pos(e);
      if (tool === 'pen' || tool === 'eraser') {
        cx.save(); cx.lineWidth = size; cx.strokeStyle = color;
        cx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
        cx.beginPath(); cx.moveTo(last.x, last.y); cx.lineTo(p.x, p.y); cx.stroke(); cx.restore(); last = p;
      } else { cx.putImageData(snap, 0, 0); shape(start, p); }
    });
    const up = () => { if (drawing) { drawing = false; pushH(); } };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

    // contenido previo
    const init = async () => {
      if (existing) {
        try {
          const im = await loadImg(PQ.costumeURL(existing));
          const res = existing.res || 1, w = (im.naturalWidth || 100) / res * RES, hh = (im.naturalHeight || 100) / res * RES;
          const k = isSt ? Math.min(CW / w, CH / hh) : Math.min(1, (CW - 6) / w, (CH - 6) / hh);
          const dw = isSt ? CW : w * k, dh = isSt ? CH : hh * k;
          cx.drawImage(im, (CW - dw) / 2, (CH - dh) / 2, dw, dh);
        } catch (e) { /* lienzo en blanco */ }
      }
      pushH();
    };
    init();

    ui.modal({
      title: existing ? 'Dibujar encima' : 'Pintar', size: 'md', body: wrap, sticky: true, focus: '.ptb .btn',
      buttons: [{ label: 'Cancelar' }, {
        label: 'Hecho', cls: 'ok', onClick: async () => {
          const d = cx.getImageData(0, 0, CW, CH).data;
          let x0 = CW, y0 = CH, x1 = -1, y1 = -1;
          for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) if (d[(y * CW + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
          if (x1 < 0) { ui.toast('¡Dibuja algo primero!'); return false; }
          let out = cv, ox = 0, oy = 0, ow = CW, oh = CH;
          if (!isSt) {
            x0 = Math.max(0, x0 - 2); y0 = Math.max(0, y0 - 2); x1 = Math.min(CW - 1, x1 + 2); y1 = Math.min(CH - 1, y1 + 2);
            ow = x1 - x0 + 1; oh = y1 - y0 + 1; ox = x0; oy = y0;
            out = document.createElement('canvas'); out.width = ow; out.height = oh;
            out.getContext('2d').drawImage(cv, ox, oy, ow, oh, 0, 0, ow, oh);
          }
          const bytes = await canvasPng(out);
          const c = PQ.mkCostume(existing ? existing.name : (isSt ? 'fondo' : 'dibujo'), bytes, 'png', ow / 2, oh / 2, RES);
          if (existing) {
            const t = S.target, i = t.costumes.indexOf(existing);
            c.name = existing.name; if (i >= 0) t.costumes[i] = c;
            RT.dirty = true; markDirty(); renderAll(); ED.refreshAll();
          } else if (onDone) onDone(c); else addCostume(c);
        }
      }]
    });
  }

  /* ============================ abrir / guardar ============================ */
  async function openFile(file) {
    try {
      const buf = await readFile(file);
      const { project, report } = await PQ.importSb3(buf, file.name.replace(/\.sb3$/i, ''));
      project.sprites.forEach((s) => { if (!s.scripts) s.scripts = []; });
      loadProject(project);
      showImportReport(report);
      ui.toast('¡Proyecto abierto!', { good: true });
    } catch (e) {
      ui.modal({ title: 'No he podido abrir el archivo', size: 'sm', body: '<p></p>', buttons: [{ label: 'Vale', cls: 'pri' }] }).body.firstChild.textContent = e.message || 'El archivo no es un proyecto válido.';
    }
  }
  function showImportReport(r) {
    if (!r.skipped && !r.missing) return;
    const ops = Object.keys(r.ops).map((o) => o.replace(/^[a-z]+_/, '')).slice(0, 12);
    const p = h('div');
    p.innerHTML = '<p>El proyecto se ha abierto, pero este programa tiene <b>menos bloques</b> que Scratch.</p>' +
      (r.skipped ? '<p>Se han omitido <b>' + r.skipped + '</b> bloques que no existen aquí (por ejemplo variables, operadores o extensiones).</p>' : '') +
      (r.missing ? '<p>Faltaban <b>' + r.missing + '</b> imágenes o sonidos dentro del archivo.</p>' : '') +
      (ops.length ? '<p class="hint">Bloques omitidos: ' + ops.join(', ') + '</p>' : '') +
      '<p class="hint">Tu archivo original no se ha cambiado. Si guardas desde aquí, se guardará la versión simplificada.</p>';
    ui.modal({ title: 'Proyecto de Scratch abierto', size: 'sm', body: p, buttons: [{ label: 'Entendido', cls: 'pri' }] });
  }
  function safeName() { return ($('#title').value || 'mi-proyecto').replace(/[\\/:*?"<>|]+/g, '').trim().slice(0, 40) || 'mi-proyecto'; }
  function saveProject() {
    try {
      S.project.title = $('#title').value || 'Mi proyecto';
      const bytes = PQ.exportSb3(S.project);
      const blob = new Blob([bytes], { type: 'application/x.scratch.sb3' });
      const url = URL.createObjectURL(blob);
      const a = h('a'); a.href = url; a.download = safeName() + '.sb3'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      dirty = false; autosave();
      ui.toast('¡Guardado como ' + safeName() + '.sb3! Se abre también en Scratch.', { good: true, ms: 6000 });
    } catch (e) { ui.toast('No he podido guardar el proyecto: ' + (e.message || e)); }
  }
  function newProject() {
    const go = () => loadProject(defaultProject());
    if (dirty) ui.confirm('¿Proyecto nuevo?', 'Se cerrará el proyecto actual. Si no lo has guardado, puedes recuperarlo con el botón «Último».', go, { yes: 'Sí, nuevo' });
    else go();
  }
  PQ.confirmDiscard = function (fn) {
    if (dirty) ui.confirm('¿Abrir otro proyecto?', 'Se cerrará el proyecto actual. Si no lo has guardado, puedes recuperarlo con el botón «Último».', fn, { yes: 'Sí, abrir' });
    else fn();
  };
  async function recoverAuto() {
    const a = readAuto();
    if (!a) { ui.toast('No hay ningún proyecto guardado automáticamente.'); return; }
    try {
      const { project } = await PQ.importSb3(PQ.unb64(a.data), a.title);
      loadProject(project, { noAuto: true });
      ui.toast('Proyecto recuperado.', { good: true });
    } catch (e) { ui.toast('No he podido recuperar el proyecto.'); }
  }

  /* ============================ cuentos y retos ============================ */
  function openStories(filter) {
    filter = filter || 'all';
    const body = h('div');
    const tabs = h('div', 'tabsm');
    const grid = h('div', 'stories');
    let m;
    const items = () => [].concat((PQ.TUT ? PQ.TUT.list : []).map((t) => ({ kind: 'tut', id: t.id, title: t.title, desc: t.desc, stars: t.stars, bg: t.bg, sprite: t.sprite })),
      (PQ.EX || []).map((x) => ({ kind: x.kind, voices: x.voices, id: x.id, title: x.title, desc: x.desc, stars: x.stars, bg: x.bg, sprite: x.sprite })));
    function draw() {
      grid.innerHTML = '';
      items().filter((x) => filter === 'all' || (filter === 'voz' ? !!x.voices : (x.kind === filter && !(filter === 'cuento' && x.voices)))).forEach((x) => {
        const c = h('button', 'story'); c.type = 'button';
        const bd = PQ.BACKDROP_LIB.find((b) => b.id === x.bg) || PQ.BACKDROP_LIB[0];
        const sp = PQ.spriteLibById(x.sprite) || PQ.SPRITE_LIB[0];
        const bgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(bd.svg);
        const spUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sp.costumes[0][1]);
        c.innerHTML = '<div class="pic" style="background-image:url(\'' + bgUrl + '\')"><span class="kind ' + x.kind + '">' + (x.voices ? 'Cuento con voces' : ({ tut: 'Tutorial', cuento: 'Cuento', reto: 'Reto', juego: 'Juego' })[x.kind]) + '</span><img alt="" src="' + spUrl + '" style="position:absolute;right:12px;bottom:-6px;width:86px"></div><div class="body"><h3></h3><p></p><div class="stars" aria-label="Dificultad"></div></div>';
        $('h3', c).textContent = x.title; $('p', c).textContent = x.desc;
        $('.stars', c).textContent = '★'.repeat(x.stars) + '☆'.repeat(3 - x.stars);
        c.addEventListener('click', () => {
          m.close();
          PQ.confirmDiscard(() => { if (x.kind === 'tut') PQ.Tut.start(x.id); else openExample(x.id); });
        });
        grid.appendChild(c);
      });
    }
    [['all', 'Todo'], ['tut', 'Tutoriales'], ['cuento', 'Cuentos'], ['voz', 'Cuentos con voz'], ['reto', 'Retos'], ['juego', 'Juegos']].forEach((f) => {
      const b = h('button', filter === f[0] ? 'on' : '', f[1]); b.type = 'button';
      b.addEventListener('click', () => { filter = f[0]; $$('button', tabs).forEach((x) => x.classList.toggle('on', x === b)); draw(); });
      tabs.appendChild(b);
    });
    body.appendChild(tabs); body.appendChild(grid);
    m = ui.modal({ title: 'Cuentos, retos y tutoriales', body, buttons: [{ label: 'Cerrar' }] });
    draw();
  }
  function openExample(id) {
    const ex = PQ.EX.find((x) => x.id === id);
    if (!ex) return;
    const p = ex.build();
    p.title = ex.title;
    loadProject(p, { banner: ex.challenge });
    PQ.say(ex.challenge);
    if (ex.openSprite) { const s = p.sprites.find((x) => x.name === ex.openSprite); if (s) { S.target = s; renderAll(); } }
  }
  PQ.openExample = openExample;
  PQ.openStories = openStories;

  /* ============================ ayuda ============================ */
  function openAbout() {
    const b = h('div', 'about');
    b.innerHTML =
      '<div class="by">Diseñado por <b>David OZC</b> · para el alumnado de Infantil y primer ciclo de Primaria.</div>' +
      '<h3>Licencia y derechos</h3><p>© 2026 David OZC. Uso <b>gratuito</b> en centros educativos. Obra bajo licencia <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/deed.es" target="_blank" rel="noopener">Creative Commons BY-NC-ND 4.0</a>: puedes compartirla <b>sin cambios</b>, citando al autor y sin fines comerciales. No se permite modificarla, venderla ni presentarla como propia sin el permiso del autor. Los proyectos que crea el alumnado son suyos.</p>' +
      '<h3>Cómo se usa</h3><ul>' +
      '<li><b>Arrastra</b> los bloques de la izquierda hasta la zona de programar y <b>engánchalos</b> unos debajo de otros.</li>' +
      '<li><b>Toca un bloque</b> (o un programa entero) para ver qué hace.</li>' +
      '<li>Pulsa la <b>bandera verde</b> para empezar y el <b>stop rojo</b> para parar.</li>' +
      '<li>Toca un <b>número</b> para cambiarlo con el teclado grande.</li>' +
      '<li>Para borrar, arrastra el bloque de vuelta a la paleta. También: clic derecho ▸ borrar.</li>' +
      '<li>¿Te has quedado atascado? Pulsa <b>¿Me ayudas?</b>: Pipo te da una pista con su voz y te enseña con una mano dónde arrastrar.</li>' +
      '<li>¿Te has equivocado? Usa <b>Deshacer</b> (<kbd>Ctrl</kbd> + <kbd>Z</kbd>).</li></ul>' +
      '<h3>Guardar y abrir</h3><ul>' +
      '<li><b>Guardar</b> descarga un archivo <b>.sb3</b> que también se abre en Scratch 3 (Archivo ▸ Cargar desde tu ordenador).</li>' +
      '<li><b>Abrir</b> carga archivos <b>.sb3</b> de Scratch 3, con variables, operadores, lápiz y voz. Los bloques que aún no existen aquí (listas, clones, efectos, música, «Mis bloques» y otras extensiones) se omiten y se avisa.</li>' +
      '<li>Se hace una copia automática en este navegador; el botón <b>Último</b> la recupera.</li></ul>' +
      '<h3>Privacidad</h3><p>Todo funciona en este ordenador. No hay registro, ni cuentas, ni se envía nada a internet.</p>' +
      '<small>PequeBloques es una herramienta independiente, compatible con el formato de archivo .sb3. Scratch es un proyecto de la Fundación Scratch, del Lifelong Kindergarten Group del MIT Media Lab; esta página no está afiliada ni respaldada por ellos. Los personajes, fondos y sonidos son originales de esta herramienta.</small>';
    ui.modal({ title: 'Ayuda y créditos', body: b, buttons: [{ label: 'Cerrar', cls: 'pri' }], size: 'md' });
  }

  /* ============================ escenario: ratón, teclado ============================ */
  function stagePos(e) {
    const r = $('#stage').getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * 480 - 240, y: 180 - (e.clientY - r.top) / r.height * 360 };
  }
  function wireStage() {
    const cv = $('#stage');
    let dr = null, sc = false;
    cv.addEventListener('pointermove', (e) => {
      const p = stagePos(e); RT.mouse.x = p.x; RT.mouse.y = p.y;
      if (dr) {
        if (Math.hypot(e.clientX - dr.sx, e.clientY - dr.sy) > 4) dr.moved = true;
        if (dr.moved) { PQ._rt.setXY(dr.sprite, p.x - dr.ox, p.y - dr.oy); renderInfo(); }
      }
    });
    cv.addEventListener('pointerdown', (e) => {
      const p = stagePos(e); RT.mouse.x = p.x; RT.mouse.y = p.y; RT.mouse.down = true;
      const s = RT.spriteAt(p.x, p.y);
      if (s) {
        cv.setPointerCapture(e.pointerId);
        dr = { sprite: s, ox: p.x - s.x, oy: p.y - s.y, sx: e.clientX, sy: e.clientY, moved: false };
        if (S.target !== s) PQ.selectTarget(s);
      } else sc = true; /* clic en el fondo */
    });
    const up = () => {
      RT.mouse.down = false;
      if (dr) { if (!dr.moved) RT.spriteClicked(dr.sprite); else markDirty(); dr = null; }
      else if (sc) RT.stageClicked();
      sc = false;
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  function keyName(e) {
    const k = e.key;
    if (k === ' ') return 'space';
    if (k === 'ArrowUp') return 'up arrow'; if (k === 'ArrowDown') return 'down arrow';
    if (k === 'ArrowLeft') return 'left arrow'; if (k === 'ArrowRight') return 'right arrow';
    if (k.length === 1) return k.toLowerCase();
    return null;
  }
  /* mando en pantalla: simula las teclas de flecha y espacio con el dedo o el ratón */
  function wirePad() {
    const pad = $('#pad'), btn = $('#btnPad');
    const show = (on) => { pad.hidden = !on; btn.setAttribute('aria-pressed', String(on)); };
    btn.addEventListener('click', () => show(pad.hidden));
    PQ.padAuto = function () {
      let uses = false;
      const one = (b) => {
        if (!b) return;
        if ((b.op === 'event_whenkeypressed' || b.op === 'sensing_keypressed') && /arrow|space/.test((b.f && b.f.KEY_OPTION) || '')) uses = true;
        walk(b.sub); walk(b.sub2); one(b.cond);
        if (b.in) Object.keys(b.in).forEach((k) => one(b.in[k]));
      };
      const walk = (arr) => (arr || []).forEach(one);
      PQ.allTargets(S.project).forEach((t) => (t.scripts || []).forEach((sc) => walk(sc.blocks)));
      if (uses && g.matchMedia && g.matchMedia('(pointer: coarse)').matches) show(true);
    };
    pad.querySelectorAll('.pk').forEach((el) => {
      const k = el.dataset.k; let timer = null;
      const up = () => { if (timer) { clearInterval(timer); timer = null; } RT.keys[k] = false; el.classList.remove('on'); };
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (x) { /* nada */ }
        RT.keys[k] = true; el.classList.add('on'); RT.keyEvent(k);
        if (k !== 'space') timer = setInterval(() => RT.keyEvent(k), 140);
      });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => el.addEventListener(ev, up));
    });
  }
  function wireKeys() {
    window.addEventListener('keydown', (e) => {
      if (modalStack.length) return;
      if (e.target.closest && e.target.closest('input,textarea,select,[contenteditable]')) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = keyName(e); if (!k) return;
      if (k === 'space' || k.endsWith('arrow')) {
        const ae = document.activeElement;
        if (ae && ae.tagName === 'BUTTON') ae.blur();
        e.preventDefault();
      }
      RT.keys[k] = true;
      RT.keyEvent(k);
    });
    window.addEventListener('keyup', (e) => { const k = keyName(e); if (k) RT.keys[k] = false; });
    window.addEventListener('blur', () => { RT.keys = {}; });
    wirePad();
  }

  /* ============================ conexión de botones ============================ */
  function wire() {
    $('#btnStories').addEventListener('click', () => openStories());
    $('#btnNew').addEventListener('click', newProject);
    $('#btnOpen').addEventListener('click', () => { $('#fileOpen').value = ''; $('#fileOpen').click(); });
    $('#fileOpen').addEventListener('change', (e) => { const f = e.target.files[0]; if (f) PQ.confirmDiscard(() => openFile(f)); });
    $('#btnSave').addEventListener('click', saveProject);
    $('#btnLast').addEventListener('click', () => PQ.confirmDiscard(recoverAuto));
    $('#btnAbout').addEventListener('click', openAbout);
    $('#title').addEventListener('input', () => { S.project.title = $('#title').value; markDirty(); });
    $('#btnLevel').addEventListener('click', () => {
      S.level = S.level >= 2 ? 1 : 2; PQ.settings.level = S.level; updateLevelBtn(); ED.renderPalette();
    });
    $('#btnVoice').addEventListener('click', () => {
      PQ.settings.voice = !PQ.settings.voice;
      $('#btnVoice').setAttribute('aria-pressed', String(PQ.settings.voice));
      if (PQ.settings.voice) { try { const u = new SpeechSynthesisUtterance('Voz activada'); u.lang = 'es-ES'; g.speechSynthesis.speak(u); } catch (e) { ui.toast('Este navegador no tiene voz.'); } }
      else if (g.speechSynthesis) g.speechSynthesis.cancel();
    });
    $('#btnZoomIn').addEventListener('click', () => ED.setZoom(S.zoom + 0.12));
    $('#btnZoomOut').addEventListener('click', () => ED.setZoom(S.zoom - 0.12));
    $('#tabbtn-code').addEventListener('click', () => showTab('code'));
    $('#tabbtn-cost').addEventListener('click', () => showTab('cost'));
    $('#tabbtn-sound').addEventListener('click', () => showTab('sound'));
    $('#btnFlag').addEventListener('click', (e) => { RT.greenFlag(); e.currentTarget.blur(); if (PQ.Tut) PQ.Tut.check(); });
    $('#btnStop').addEventListener('click', (e) => { RT.stopAll(); e.currentTarget.blur(); });
    $('#btnGrid').addEventListener('click', (e) => { RT.grid = !RT.grid; e.currentTarget.setAttribute('aria-pressed', String(RT.grid)); RT.dirty = true; });
    $('#btnStageSize').addEventListener('click', (e) => { const r = $('#right'); r.classList.toggle('small'); e.currentTarget.setAttribute('aria-pressed', String(r.classList.contains('small'))); });
    $('#btnFull').addEventListener('click', () => {
      const el = $('#stagebox');
      if (document.fullscreenElement) document.exitFullscreen(); else if (el.requestFullscreen) el.requestFullscreen().catch(() => ui.toast('No se puede poner en pantalla completa.'));
      else ui.toast('Este navegador no permite pantalla completa.');
    });
    $('#btnUndo').addEventListener('click', ED.undo);
    $('#btnRedo').addEventListener('click', ED.redo);
    $('#btnClean').addEventListener('click', ED.cleanUp);
    $('#stagetile').addEventListener('click', () => PQ.selectTarget(S.project.stage));
    $('#btnAddSprite').addEventListener('click', (e) => popupMenu(e.currentTarget, [
      { label: 'Elegir un personaje', icon: ICO.list, onClick: () => openLibrary('sprite') },
      { label: 'Pintar uno nuevo', icon: ICO.brush, onClick: openPaintNewSprite },
      { label: 'Subir una imagen', icon: ICO.up, onClick: () => pickImage((c) => newSpriteFromCostume(c)) },
      { label: 'Sorpresa', icon: ICO.dice, onClick: () => { const it = PQ.SPRITE_LIB[Math.floor(Math.random() * PQ.SPRITE_LIB.length)]; addSprite(PQ.makeSprite(it.id, S.project)); } }
    ]));
    $('#btnAddBackdrop').addEventListener('click', (e) => popupMenu(e.currentTarget, [
      { label: 'Elegir un fondo', icon: ICO.list, onClick: () => openLibrary('backdrop') },
      { label: 'Pintar un fondo', icon: ICO.brush, onClick: () => { PQ.selectTarget(S.project.stage); openPaint(null); } },
      { label: 'Subir una imagen', icon: ICO.up, onClick: () => pickImage((c) => { const prev = S.target; S.target = S.project.stage; addCostume(c); S.target = prev; renderAll(); }, true) }
    ]));
    // información del personaje
    const num = (id, fn) => $(id).addEventListener('change', () => { const t = S.target; if (t.isStage) return; const v = parseFloat($(id).value); if (!isNaN(v)) { fn(t, v); markDirty(); renderInfo(); } });
    num('#inX', (t, v) => PQ._rt.setXY(t, v, t.y));
    num('#inY', (t, v) => PQ._rt.setXY(t, t.x, v));
    num('#inSize', (t, v) => PQ._rt.setSize(t, v));
    num('#inDir', (t, v) => { t.direction = PQ._rt.wrapDir(v); RT.dirty = true; });
    $('#inName').addEventListener('change', () => {
      const t = S.target; if (t.isStage) return;
      const nn = PQ.uniqueName($('#inName').value.trim() || 'Personaje', S.project.sprites.filter((x) => x !== t).map((x) => x.name));
      renameRefs('sprite', t.name, nn); t.name = nn; markDirty(); renderAll();
    });
    $('#btnShow').addEventListener('click', () => { if (!S.target.isStage) { S.target.visible = true; RT.dirty = true; markDirty(); renderInfo(); } });
    $('#btnHide').addEventListener('click', () => { if (!S.target.isStage) { S.target.visible = false; RT.dirty = true; markDirty(); renderInfo(); } });
    // soltar archivos
    let dc = 0;
    window.addEventListener('dragenter', (e) => { if (e.dataTransfer && Array.from(e.dataTransfer.types || []).indexOf('Files') >= 0) { dc++; $('#dropveil').hidden = false; } });
    window.addEventListener('dragleave', () => { dc = Math.max(0, dc - 1); if (!dc) $('#dropveil').hidden = true; });
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => {
      e.preventDefault(); dc = 0; $('#dropveil').hidden = true;
      const f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (f && /\.sb3$/i.test(f.name)) PQ.confirmDiscard(() => openFile(f)); else if (f) ui.toast('Solo puedo abrir archivos .sb3 de Scratch 3.');
    });
  }
  function openPaintNewSprite() { openPaint(null, newSpriteFromCostume); }
  function newSpriteFromCostume(c) {
    const s = PQ.newTarget(PQ.uniqueName(c.name.slice(0, 16) || 'Dibujo', S.project.sprites.map((x) => x.name)), false);
    c.name = c.name + ' 1';
    s.costumes.push(c);
    addSprite(s);
  }
  PQ._newSpriteFromCostume = newSpriteFromCostume;

  /* ============================ arranque ============================ */
  function init() {
    RT.init($('#stage'));
    ED.init();
    ED.onChange = (soft) => { markDirty(); if (PQ.helpActivity) PQ.helpActivity(); if (!soft) { if (curTab === 'code') { /* nada */ } } if (PQ.Tut) PQ.Tut.check(); };
    RT.onChange = () => {
      $('#btnFlag').classList.toggle('running', RT.threads.length > 0);
      ED.markRunning();
      if (PQ.Tut) PQ.Tut.check();
    };
    PQ.onCostumeLoaded = () => { RT.dirty = true; };
    wire(); wireStage(); wireKeys();
    ED.setZoom(window.innerWidth < 1100 ? 0.9 : 0.92);
    loadProject(defaultProject(), { noAuto: true });
    const a = readAuto();
    if (a) {
      $('#btnLast').hidden = false;
    }
    // refresco ligero de la información mientras se ejecuta
    setInterval(() => {
      if (!S.project) return;
      renderInfo();
      if (RT.threads.length || RT.dirty) {
        $$('#spritelist .stile').forEach((t) => {
          const s = S.project.sprites.find((x) => x.id === t.dataset.id); if (!s) return;
          const im = $('img', t), c = s.costumes[s.current];
          if (im && c && im._cur !== s.current) { im._cur = s.current; im.src = PQ.costumeURL(c); }
        });
        const sc = S.project.stage.costumes[S.project.stage.current];
        if (sc) { const u = 'url("' + PQ.costumeURL(sc) + '")'; if ($('#stagetile')._u !== u) { $('#stagetile')._u = u; $('#stagetile').style.backgroundImage = u; } }
      }
    }, 200);
    if (PQ.Tut) PQ.Tut.welcome(!!a, recoverAuto);
  }
  PQ.app = { init, showTab, openLibrary, openPaint, saveProject, openFile, markDirty, renderAll, renderInfo };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
