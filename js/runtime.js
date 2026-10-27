/* PequeBloques — diseñado por David OZC
 * runtime.js: escenario (canvas), hilos de ejecución con generadores, sonido, colisiones
 */
(function (g) {
  'use strict';
  const PQ = g.PQ = g.PQ || {};
  const W = 480, H = 360;

  /* ---------- imágenes de disfraces ---------- */
  PQ.costumeURL = function (c) {
    if (!c._url) c._url = URL.createObjectURL(new Blob([c.bytes], { type: PQ.mimeFor(c.fmt) }));
    return c._url;
  };
  function costumeImg(c) {
    if (c._img) return c._img;
    const img = new Image();
    c._img = img; c._ready = false;
    img.onload = () => {
      c._ready = true; c._w = img.naturalWidth || 100; c._h = img.naturalHeight || 100;
      c._ad = null; RT.dirty = true;
      if (PQ.onCostumeLoaded) PQ.onCostumeLoaded(c);
    };
    img.onerror = () => { c._ready = true; c._w = 60; c._h = 60; c._broken = true; RT.dirty = true; };
    img.src = PQ.costumeURL(c);
    return img;
  }
  PQ.costumeImg = costumeImg;

  function dims(c) {
    costumeImg(c);
    const res = c.res || 1;
    const w = (c._w || 60) / res, h = (c._h || 60) / res;
    return { w, h, rcx: (c.rcx || 0) / res, rcy: (c.rcy || 0) / res, res };
  }

  function alphaData(c) {
    if (c._ad) return c._ad;
    if (!c._ready || c._broken) return null;
    const d = dims(c);
    const cw = Math.max(1, Math.ceil(d.w)), ch = Math.max(1, Math.ceil(d.h));
    try {
      const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
      const cx = cv.getContext('2d', { willReadFrequently: true });
      cx.drawImage(c._img, 0, 0, d.w, d.h);
      c._ad = { w: cw, h: ch, data: cx.getImageData(0, 0, cw, ch).data };
    } catch (e) { c._ad = null; }
    return c._ad;
  }

  /* ---------- geometría ---------- */
  function wrapDir(d) {
    d = ((d + 180) % 360 + 360) % 360 - 180;
    return d === -180 ? 180 : d;
  }
  function prep(t) {
    const c = t.costumes[t.current] || t.costumes[0];
    const d = dims(c);
    const s = t.size / 100;
    const rot = t.rotationStyle === 'all around' ? (t.direction - 90) * Math.PI / 180 : 0;
    const flip = t.rotationStyle === 'left-right' && t.direction < 0 ? -1 : 1;
    return { t, c, d, s, rot, flip, cos: Math.cos(rot), sin: Math.sin(rot), ad: null };
  }
  function bounds(t) {
    const p = prep(t);
    const pts = [[-p.d.rcx, -p.d.rcy], [p.d.w - p.d.rcx, -p.d.rcy], [p.d.w - p.d.rcx, p.d.h - p.d.rcy], [-p.d.rcx, p.d.h - p.d.rcy]];
    let l = 1e9, r = -1e9, tp = -1e9, bt = 1e9;
    pts.forEach((q) => {
      const x = q[0] * p.s * p.flip, y = q[1] * p.s;
      const sx = x * p.cos - y * p.sin, sy = x * p.sin + y * p.cos;
      const X = t.x + sx, Y = t.y - sy;
      l = Math.min(l, X); r = Math.max(r, X); tp = Math.max(tp, Y); bt = Math.min(bt, Y);
    });
    return { left: l, right: r, top: tp, bottom: bt };
  }
  function hit(p, sx, sy) {
    if (!p.ad && p.ad !== false) p.ad = alphaData(p.c) || false;
    const px = sx - p.t.x, py = -(sy - p.t.y);
    let x = (px * p.cos + py * p.sin) / p.s, y = (-px * p.sin + py * p.cos) / p.s;
    if (p.flip < 0) x = -x;
    const u = x + p.d.rcx, v = y + p.d.rcy;
    if (u < 0 || v < 0 || u >= p.d.w || v >= p.d.h) return false;
    if (!p.ad) return true;
    const iu = Math.min(p.ad.w - 1, Math.floor(u)), iv = Math.min(p.ad.h - 1, Math.floor(v));
    return p.ad.data[(iv * p.ad.w + iu) * 4 + 3] > 24;
  }
  function fence(t) {
    const b = bounds(t);
    const inset = Math.min(15, (b.right - b.left) / 2, (b.top - b.bottom) / 2);
    let dx = 0, dy = 0;
    if (b.right < -W / 2 + inset) dx = -W / 2 + inset - b.right;
    if (b.left > W / 2 - inset) dx = W / 2 - inset - b.left;
    if (b.top < -H / 2 + inset) dy = -H / 2 + inset - b.top;
    if (b.bottom > H / 2 - inset) dy = H / 2 - inset - b.bottom;
    t.x += dx; t.y += dy;
  }
  function setXY(t, x, y) {
    const ox = t.x, oy = t.y;
    t.x = x; t.y = y; fence(t);
    t.x = Math.round(t.x * 1000) / 1000; t.y = Math.round(t.y * 1000) / 1000;
    if (t._pen && t._pen.down) penLine(t, ox, oy, t.x, t.y);
    RT.dirty = true;
  }
  function setSize(t, pct) {
    const d = dims(t.costumes[t.current]);
    const mn = Math.min(100, Math.max(5 / d.w, 5 / d.h) * 100);
    const mx = Math.min(1.5 * W / d.w, 1.5 * H / d.h) * 100;
    t.size = PQ.clamp(pct, mn, mx);
    RT.dirty = true;
  }

  /* ---------- sonido ---------- */
  const audio = { ctx: null, srcs: new Set() };
  function actx() {
    if (!audio.ctx) {
      const AC = g.AudioContext || g.webkitAudioContext;
      if (AC) { try { audio.ctx = new AC(); } catch (e) { audio.ctx = null; } }
    }
    if (audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume().catch(() => {});
    return audio.ctx;
  }
  PQ.audioCtx = actx;
  function decodeSound(s) {
    const ctx = actx();
    if (!ctx) return Promise.reject(new Error('sin audio'));
    if (!s._p) {
      s._p = new Promise((res, rej) => {
        const ab = s.bytes.slice().buffer;
        const r = ctx.decodeAudioData(ab, res, rej);
        if (r && r.then) r.then(res, rej);
      });
    }
    return s._p;
  }
  PQ.decodeSound = decodeSound;
  function playSoundObj(s, vol) {
    const h = { done: false, src: null };
    const ctx = actx();
    if (!ctx || !s) { h.done = true; return h; }
    decodeSound(s).then((buf) => {
      if (h.cancel) { h.done = true; return; }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      if (vol !== undefined && vol < 100) { const gn = ctx.createGain(); gn.gain.value = Math.max(0, vol) / 100; src.connect(gn); gn.connect(ctx.destination); } else src.connect(ctx.destination);
      src.onended = () => { h.done = true; audio.srcs.delete(src); };
      audio.srcs.add(src); h.src = src; src.start();
    }).catch(() => { h.done = true; });
    return h;
  }
  PQ.playSoundObj = playSoundObj;
  function stopSounds() {
    audio.srcs.forEach((s) => { try { s.stop(); } catch (e) { /* ya parado */ } });
    audio.srcs.clear();
  }
  PQ.stopSounds = stopSounds;

  /* ---------- voz (síntesis del navegador) ---------- */
  const VOICE_STYLE = { ALTO: [1.15, 1.0], TENOR: [0.7, 0.95], SQUEAK: [1.45, 1.1], GIANT: [0.35, 0.85], KITTEN: [1.65, 1.05] };
  const VOICE_KEYS = ['ALTO', 'TENOR', 'SQUEAK', 'GIANT', 'KITTEN'];
  function esVoices() {
    try { return (g.speechSynthesis.getVoices() || []).filter((v) => /^es/i.test(v.lang)); } catch (e) { return []; }
  }
  /* Devuelve {done} y se completa al terminar de hablar. */
  function utter(text, key) {
    const h = { done: false };
    text = String(text);
    const synth = g.speechSynthesis;
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
      setTimeout(() => { h.done = true; }, Math.min(8000, 400 + text.length * 70));
      return h;
    }
    try {
      const u = new SpeechSynthesisUtterance(text);
      const st = VOICE_STYLE[key] || VOICE_STYLE.ALTO;
      u.lang = 'es-ES'; u.pitch = st[0]; u.rate = st[1] * 0.92;
      const vs = esVoices();
      if (vs.length) u.voice = vs[Math.max(0, VOICE_KEYS.indexOf(key)) % vs.length];
      const fin = () => { h.done = true; };
      u.onend = fin; u.onerror = fin;
      setTimeout(fin, Math.min(30000, 2500 + text.length * 110));   // por si el navegador no avisa
      synth.speak(u);
      PQ._lastUtter = { text, key };
    } catch (e) { h.done = true; }
    return h;
  }
  PQ.utter = utter;
  function speakBubble(text, t) {
    if (!PQ.settings || !PQ.settings.voice) return { done: true };
    return utter(text, t && t._voice);
  }

  /* ---------- Runtime ---------- */
  const RT = PQ.RT = {
    project: null, canvas: null, ctx: null, threads: [], keys: {}, mouse: { x: 0, y: 0, down: false },
    dirty: true, flagCount: 0, runCount: 0, grid: false, last: 0, acc: 0, onChange: null, overlay: null,
    answer: '', timerStart: 0, pen: null
  };

  RT.init = function (canvas) {
    RT.canvas = canvas; RT.ctx = canvas.getContext('2d');
    canvas.width = W * 2; canvas.height = H * 2;
    const loop = (ts) => {
      requestAnimationFrame(loop);
      if (!RT.last) RT.last = ts;
      RT.acc += Math.min(200, ts - RT.last); RT.last = ts;
      let n = 0;
      while (RT.acc >= 1000 / 30 && n < 4) { RT.step(); RT.acc -= 1000 / 30; n++; }
      if (RT.acc > 200) RT.acc = 0;
      if (RT.dirty || RT.threads.length) { RT.render(); RT.dirty = false; }
    };
    requestAnimationFrame(loop);
  };
  RT.setProject = function (p) { RT.stopAll(); RT.project = p; RT.dirty = true; RT.penClear(); RT.timerStart = RT.now(); p.vars = p.vars || []; };
  RT.running = () => RT.threads.length > 0;

  RT.now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

  /* ---- capa del lápiz ---- */
  function penCtx() {
    if (!RT.pen) { RT.pen = document.createElement('canvas'); RT.pen.width = W * 2; RT.pen.height = H * 2; }
    const c = RT.pen.getContext('2d'); c.setTransform(2, 0, 0, 2, 0, 0); c.lineCap = 'round'; c.lineJoin = 'round';
    return c;
  }
  RT.penClear = function () { if (RT.pen) { const c = RT.pen.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W * 2, H * 2); } RT.dirty = true; };
  function penLine(t, x0, y0, x1, y1) {
    const p = t._pen; if (!p || !p.down) return;
    const c = penCtx(); c.strokeStyle = p.color; c.fillStyle = p.color; c.lineWidth = p.size;
    c.beginPath(); c.moveTo(W / 2 + x0, H / 2 - y0); c.lineTo(W / 2 + x1, H / 2 - y1); c.stroke();
    if (x0 === x1 && y0 === y1) { c.beginPath(); c.arc(W / 2 + x1, H / 2 - y1, p.size / 2, 0, 6.3); c.fill(); }
  }

  /* ---- dibujo ---- */
  function drawTarget(ctx, t) {
    const c = t.costumes[t.current];
    if (!c) return;
    const img = costumeImg(c);
    if (!c._ready || c._broken) return;
    const p = prep(t);
    ctx.save();
    ctx.translate(W / 2 + t.x, H / 2 - t.y);
    ctx.rotate(p.rot);
    ctx.scale(p.s * p.flip, p.s);
    ctx.drawImage(img, -p.d.rcx, -p.d.rcy, p.d.w, p.d.h);
    ctx.restore();
  }
  function wrapText(ctx, text, maxW) {
    const words = String(text).split(/\s+/), lines = [];
    let cur = '';
    words.forEach((w) => {
      const test = cur ? cur + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test;
    });
    if (cur) lines.push(cur);
    return lines.slice(0, 6);
  }
  function drawBubble(ctx, t) {
    const s = t._say;
    if (!s || !t.visible) return;
    ctx.save();
    ctx.font = '700 15px "Trebuchet MS", "Segoe UI", Arial, sans-serif';
    const lines = wrapText(ctx, s.text, 150);
    if (!lines.length) { ctx.restore(); return; }
    const tw = Math.max.apply(null, lines.map((l) => ctx.measureText(l).width));
    const bw = Math.max(34, tw + 22), bh = lines.length * 19 + 14;
    const b = bounds(t);
    let left = true;
    let bx = W / 2 + b.right - 8, by = H / 2 - b.top - bh - 14;
    if (bx + bw > W - 4) { bx = W / 2 + b.left + 8 - bw; left = false; }
    bx = PQ.clamp(bx, 4, W - bw - 4); by = PQ.clamp(by, 4, H - bh - 24);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#B9C0CF'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    const r = 12;
    ctx.moveTo(bx + r, by); ctx.arcTo(bx + bw, by, bx + bw, by + bh, r); ctx.arcTo(bx + bw, by + bh, bx, by + bh, r);
    ctx.arcTo(bx, by + bh, bx, by, r); ctx.arcTo(bx, by, bx + bw, by, r); ctx.closePath();
    ctx.fill(); ctx.stroke();
    const tx = left ? bx + 14 : bx + bw - 14;
    if (s.think) {
      ctx.fillStyle = '#fff';
      [[tx, by + bh + 6, 6], [tx + (left ? -6 : 6), by + bh + 15, 4]].forEach((c) => { ctx.beginPath(); ctx.arc(c[0], c[1], c[2], 0, 6.3); ctx.fill(); ctx.stroke(); });
    } else {
      ctx.beginPath();
      ctx.moveTo(tx - 6, by + bh - 1); ctx.lineTo(tx + (left ? -4 : 4), by + bh + 14); ctx.lineTo(tx + 8, by + bh - 1);
      ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
      ctx.fillRect(tx - 5, by + bh - 3, 12, 4);
    }
    ctx.fillStyle = '#4D4D4D'; ctx.textBaseline = 'top'; ctx.textAlign = 'center';
    lines.forEach((l, i) => ctx.fillText(l, bx + bw / 2, by + 8 + i * 19));
    ctx.restore();
  }
  function drawMonitors(ctx, p) {
    let y = 6;
    (p.vars || []).forEach((v) => {
      if (!v.show) return;
      ctx.save();
      ctx.font = '800 14px "Trebuchet MS","Segoe UI",Arial,sans-serif';
      const val = fmt(v.value), nw = ctx.measureText(v.name).width, vw = Math.max(26, ctx.measureText(val).width + 14);
      const bw = nw + vw + 22, bh = 26;
      ctx.fillStyle = '#E6F0FF'; ctx.strokeStyle = '#B9C0CF'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(6, y, bw, bh, 7) : ctx.rect(6, y, bw, bh); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#4D4D4D'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(v.name, 13, y + bh / 2 + 1);
      const vx = 13 + nw + 8;
      ctx.fillStyle = '#FF8C1A'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(vx, y + 3, vw, bh - 6, 5) : ctx.rect(vx, y + 3, vw, bh - 6); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(val, vx + vw / 2, y + bh / 2 + 1);
      ctx.restore();
      y += bh + 4;
    });
  }
  RT.render = function () {
    const ctx = RT.ctx, p = RT.project;
    if (!ctx || !p) return;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    drawTarget(ctx, p.stage);
    if (RT.pen) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(RT.pen, 0, 0); ctx.restore(); }
    p.sprites.forEach((s) => { if (s.visible) drawTarget(ctx, s); });
    if (RT.grid) {
      ctx.save();
      ctx.strokeStyle = 'rgba(30,40,90,.28)'; ctx.lineWidth = 1; ctx.font = '700 10px Arial'; ctx.fillStyle = 'rgba(20,30,80,.8)';
      for (let x = -200; x <= 200; x += 40) { ctx.beginPath(); ctx.moveTo(W / 2 + x, 0); ctx.lineTo(W / 2 + x, H); ctx.stroke(); if (x) ctx.fillText(String(x), W / 2 + x + 2, H / 2 + 11); }
      for (let y = -160; y <= 160; y += 40) { ctx.beginPath(); ctx.moveTo(0, H / 2 - y); ctx.lineTo(W, H / 2 - y); ctx.stroke(); if (y) ctx.fillText(String(y), W / 2 + 3, H / 2 - y - 2); }
      ctx.strokeStyle = 'rgba(30,40,90,.65)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
      ctx.restore();
    }
    p.sprites.forEach((s) => drawBubble(ctx, s));
    drawMonitors(ctx, p);
    if (RT.overlay) RT.overlay(ctx);
  };

  /* ---- consulta ---- */
  RT.spriteAt = function (x, y) {
    const sp = RT.project.sprites;
    for (let i = sp.length - 1; i >= 0; i--) {
      const s = sp[i];
      if (!s.visible) continue;
      const b = bounds(s);
      if (x < b.left || x > b.right || y < b.bottom || y > b.top) continue;
      if (hit(prep(s), x, y)) return s;
    }
    /* pasada tolerante para dedos pequeños: si el toque cae dentro de la caja del personaje, vale */
    for (let i = sp.length - 1; i >= 0; i--) {
      const s = sp[i];
      if (!s.visible) continue;
      const b = bounds(s);
      const m = 6;
      if (x >= b.left - m && x <= b.right + m && y >= b.bottom - m && y <= b.top + m) return s;
    }
    return null;
  };
  function touching(t, what) {
    if (!t.visible) return false;
    if (what === '_edge_') { const b = bounds(t); return b.left < -W / 2 || b.right > W / 2 || b.top > H / 2 || b.bottom < -H / 2; }
    if (what === '_mouse_') return hit(prep(t), RT.mouse.x, RT.mouse.y);
    const o = RT.project.sprites.find((s) => s.name === what);
    if (!o || o === t || !o.visible) return false;
    const a = bounds(t), b = bounds(o);
    const l = Math.max(a.left, b.left), r = Math.min(a.right, b.right), bt = Math.max(a.bottom, b.bottom), tp = Math.min(a.top, b.top);
    if (l > r || bt > tp) return false;
    const pa = prep(t), pb = prep(o);
    for (let y = bt; y <= tp; y += 2) for (let x = l; x <= r; x += 2) if (hit(pa, x, y) && hit(pb, x, y)) return true;
    return false;
  }
  RT.touching = touching;
  RT.bounds = bounds;

  /* ---- hilos ---- */
  function findIdx(list, name) {
    let i = list.findIndex((c) => c.name === name);
    if (i < 0 && name !== '' && !isNaN(Number(name))) i = Math.round(Number(name)) - 1;
    return i >= 0 && i < list.length ? i : -1;
  }
  RT.start = function (target, script, from) {
    const old = RT.threads.findIndex((th) => th.script === script);
    if (old >= 0) { RT.threads[old].dead = true; RT.threads.splice(old, 1); }
    const th = { target, script, dead: false, gen: null };
    th.gen = RT.exec(script.blocks.slice(from || 0), th);
    RT.threads.push(th);
    RT.runCount++;
    if (RT.onChange) RT.onChange();
    return th;
  };
  RT.hatScripts = function (pred) {
    const out = [];
    PQ.allTargets(RT.project).forEach((t) => {
      t.scripts.forEach((s) => { const h = s.blocks[0]; if (h && PQ.BLOCKS[h.op].kind === 'hat' && pred(h, t)) out.push([t, s]); });
    });
    return out;
  };
  RT.greenFlag = function () {
    actx();
    RT.stopAll(true);
    RT.flagCount++;
    RT.hatScripts((h) => h.op === 'event_whenflagclicked').forEach((x) => RT.start(x[0], x[1], 1));
    RT.dirty = true;
    if (RT.onChange) RT.onChange();
  };
  RT.stopAll = function (keepBubbles) {
    RT.threads.forEach((th) => { th.dead = true; });
    RT.threads = [];
    stopSounds();
    try { if (g.speechSynthesis) g.speechSynthesis.cancel(); } catch (e) { /* nada */ }
    if (RT.project && !keepBubbles) RT.project.sprites.forEach((s) => { s._say = null; });
    RT.dirty = true;
    if (RT.onChange) RT.onChange();
  };
  RT.runScript = function (target, script) {
    actx();
    const first = script.blocks[0];
    const from = first && PQ.BLOCKS[first.op].kind === 'hat' ? 1 : 0;
    RT.start(target, script, from);
  };
  RT.runBlock = function (target, b) {
    actx();
    RT.start(target, { blocks: [b], _tmp: true }, 0);
  };
  RT.keyEvent = function (name) {
    RT.hatScripts((h) => h.op === 'event_whenkeypressed' && (h.f.KEY_OPTION === name || h.f.KEY_OPTION === 'any')).forEach((x) => RT.start(x[0], x[1], 1));
  };
  RT.stageClicked = function () {
    RT.hatScripts((h, t) => h.op === 'event_whenstageclicked' && t === RT.project.stage).forEach((x) => RT.start(x[0], x[1], 1));
  };
  RT.spriteClicked = function (sprite) {
    RT.hatScripts((h, t) => h.op === 'event_whenthisspriteclicked' && t === sprite).forEach((x) => RT.start(x[0], x[1], 1));
  };
  RT.broadcast = function (name) {
    const started = [];
    RT.hatScripts((h) => h.op === 'event_whenbroadcastreceived' && h.f.BROADCAST_OPTION === name).forEach((x) => started.push(RT.start(x[0], x[1], 1)));
    return started;
  };
  RT.step = function () {
    if (!RT.threads.length) return;
    const list = RT.threads.slice();
    list.forEach((th) => {
      if (th.dead) return;
      let r;
      try { r = th.gen.next(); } catch (e) { th.dead = true; if (g.console) console.error(e); r = { done: true }; }
      if (r.done) th.dead = true;
    });
    const before = RT.threads.length;
    RT.threads = RT.threads.filter((th) => !th.dead);
    RT.dirty = true;
    if (before !== RT.threads.length && RT.onChange) RT.onChange();
  };

  function fmt(v) {
    if (typeof v === 'number') return String(Math.round(v * 1e6) / 1e6);
    if (typeof v === 'boolean') return v ? 'verdadero' : 'falso';
    return v === undefined || v === null ? '' : String(v);
  }
  RT.fmt = fmt;
  const toNum = (v) => { if (typeof v === 'boolean') return v ? 1 : 0; const n = parseFloat(v); return isNaN(n) ? 0 : n; };
  const isNumLike = (v) => typeof v === 'number' || (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v)));
  function cmp(a, b) {
    if (isNumLike(a) && isNumLike(b)) return Number(a) - Number(b);
    const x = String(a).toLowerCase(), y = String(b).toLowerCase();
    return x < y ? -1 : x > y ? 1 : 0;
  }
  RT.getVar = (name) => (RT.project.vars || []).find((v) => v.name === name);
  /* valor de un argumento (literal o reportero encajado) */
  RT.arg = function (b, n, t) {
    if (b.in && b.in[n]) return RT.ev(b.in[n], t);
    return b.f[n];
  };
  RT.ev = function (b, t) {
    if (!b) return '';
    const A = (n) => RT.arg(b, n, t), N = (n) => toNum(A(n));
    switch (b.op) {
      case 'operator_add': return N('NUM1') + N('NUM2');
      case 'operator_subtract': return N('NUM1') - N('NUM2');
      case 'operator_multiply': return N('NUM1') * N('NUM2');
      case 'operator_divide': { const d = N('NUM2'); return d === 0 ? 0 : N('NUM1') / d; }
      case 'operator_mod': { const d = N('NUM2'); if (d === 0) return 0; const m = N('NUM1') % d; return (m < 0) === (d < 0) || m === 0 ? m : m + d; }
      case 'operator_round': return Math.round(N('NUM'));
      case 'operator_random': {
        let lo = N('FROM'), hi = N('TO'); if (lo > hi) { const x = lo; lo = hi; hi = x; }
        const ints = Number.isInteger(lo) && Number.isInteger(hi) && !/\./.test(String(A('FROM')) + String(A('TO')));
        return ints ? lo + Math.floor(Math.random() * (hi - lo + 1)) : lo + Math.random() * (hi - lo);
      }
      case 'operator_join': return fmt(A('STRING1')) + fmt(A('STRING2'));
      case 'operator_gt': return cmp(A('OPERAND1'), A('OPERAND2')) > 0;
      case 'operator_lt': return cmp(A('OPERAND1'), A('OPERAND2')) < 0;
      case 'operator_equals': return cmp(A('OPERAND1'), A('OPERAND2')) === 0;
      case 'operator_and': return !!RT.truthy(b.in && b.in.OPERAND1, t) && !!RT.truthy(b.in && b.in.OPERAND2, t);
      case 'operator_or': return !!RT.truthy(b.in && b.in.OPERAND1, t) || !!RT.truthy(b.in && b.in.OPERAND2, t);
      case 'operator_not': return !RT.truthy(b.in && b.in.OPERAND, t);
      case 'data_variable': { const v = RT.getVar(b.f.VARIABLE); return v ? v.value : 0; }
      case 'motion_xposition': return Math.round(t.x * 100) / 100;
      case 'motion_yposition': return Math.round(t.y * 100) / 100;
      case 'motion_direction': return t.direction;
      case 'looks_size': return Math.round(t.size);
      case 'looks_costumenumbername': { const c = t.costumes[t.current]; return b.f.NUMBER_NAME === 'name' ? (c ? c.name : '') : t.current + 1; }
      case 'sound_volume': return t.volume === undefined ? 100 : t.volume;
      case 'sensing_mousex': return Math.round(RT.mouse.x);
      case 'sensing_mousey': return Math.round(RT.mouse.y);
      case 'sensing_mousedown': return !!RT.mouse.down;
      case 'sensing_timer': return Math.round((RT.now() - RT.timerStart)) / 1000;
      case 'sensing_answer': return RT.answer;
      case 'sensing_touchingobject': return touching(t, b.f.TOUCHINGOBJECTMENU);
      case 'sensing_keypressed': {
        const k = b.f.KEY_OPTION;
        if (k === 'any') return Object.keys(RT.keys).some((x) => RT.keys[x]);
        return !!RT.keys[k];
      }
      default: return '';
    }
  };
  RT.truthy = function (c, t) {
    if (!c) return false;
    const v = RT.ev(c, t);
    return v === true || (typeof v === 'string' && v !== '' && v.toLowerCase() !== 'false' && v !== '0') || (typeof v === 'number' && v !== 0);
  };
  RT.cond = (c, t) => RT.truthy(c, t);
  RT.bgHat = function () {
    const st = RT.project.stage, name = st.costumes[st.current] && st.costumes[st.current].name;
    RT.hatScripts((h) => h.op === 'event_whenbackdropswitchesto' && h.f.BACKDROP === name).forEach((x) => RT.start(x[0], x[1], 1));
  };

  RT.exec = function* (arr, th) {
    for (let i = 0; i < arr.length; i++) {
      if (th.dead) return;
      yield* RT.block(arr[i], th);
    }
  };

  function* waitSecs(th, secs) {
    const end = RT.now() + Math.max(0, secs) * 1000;
    yield;
    while (RT.now() < end && !th.dead) yield;
  }

  RT.block = function* (b, th) {
    const t = th.target, f = b.f, A = (k) => RT.arg(b, k, t), N = (k) => toNum(A(k));
    switch (b.op) {
      case 'motion_movesteps': { const r = (90 - t.direction) * Math.PI / 180; setXY(t, t.x + N('STEPS') * Math.cos(r), t.y + N('STEPS') * Math.sin(r)); break; }
      case 'motion_turnright': t.direction = wrapDir(t.direction + N('DEGREES')); RT.dirty = true; break;
      case 'motion_turnleft': t.direction = wrapDir(t.direction - N('DEGREES')); RT.dirty = true; break;
      case 'motion_goto': {
        const to = f.TO;
        if (to === '_random_') setXY(t, Math.round((Math.random() - 0.5) * W), Math.round((Math.random() - 0.5) * H));
        else if (to === '_mouse_') setXY(t, RT.mouse.x, RT.mouse.y);
        else { const o = RT.project.sprites.find((s) => s.name === to); if (o) setXY(t, o.x, o.y); }
        break;
      }
      case 'motion_gotoxy': setXY(t, N('X'), N('Y')); break;
      case 'motion_glidesecstoxy': {
        const x0 = t.x, y0 = t.y, x1 = N('X'), y1 = N('Y'), d = Math.max(0, N('SECS')) * 1000, st = RT.now();
        if (d <= 0) { setXY(t, x1, y1); break; }
        yield;
        for (;;) {
          if (th.dead) return;
          const k = Math.min(1, (RT.now() - st) / d);
          setXY(t, x0 + (x1 - x0) * k, y0 + (y1 - y0) * k);
          if (k >= 1) break;
          yield;
        }
        break;
      }
      case 'motion_changexby': setXY(t, t.x + N('DX'), t.y); break;
      case 'motion_setx': setXY(t, N('X'), t.y); break;
      case 'motion_changeyby': setXY(t, t.x, t.y + N('DY')); break;
      case 'motion_sety': setXY(t, t.x, N('Y')); break;
      case 'motion_ifonedgebounce': {
        const bd = bounds(t);
        const dl = bd.left + W / 2, dr = W / 2 - bd.right, dt = H / 2 - bd.top, db = bd.bottom + H / 2;
        const m = Math.min(dl, dr, dt, db);
        if (m > 0) break;
        const rad = (90 - t.direction) * Math.PI / 180;
        let dx = Math.cos(rad), dy = -Math.sin(rad);
        if (m === dl) dx = Math.max(0.2, Math.abs(dx));
        else if (m === dr) dx = -Math.max(0.2, Math.abs(dx));
        else if (m === dt) dy = Math.max(0.2, Math.abs(dy));
        else dy = -Math.max(0.2, Math.abs(dy));
        t.direction = wrapDir(Math.atan2(dx, -dy) * 180 / Math.PI);
        fence(t); RT.dirty = true;
        break;
      }
      case 'motion_pointindirection': t.direction = wrapDir(N('DIRECTION')); RT.dirty = true; break;

      case 'looks_say': case 'looks_think': {
        const txt = fmt(A('MESSAGE'));
        t._say = txt === '' ? null : { text: txt, think: b.op === 'looks_think' };
        if (txt) speakBubble(txt, t);
        RT.dirty = true; break;
      }
      case 'looks_sayforsecs': case 'looks_thinkforsecs': {
        const txt = fmt(A('MESSAGE'));
        const bub = txt === '' ? null : { text: txt, think: b.op === 'looks_thinkforsecs' };
        t._say = bub; RT.dirty = true;
        const sp = txt ? speakBubble(txt, t) : { done: true };
        yield* waitSecs(th, N('SECS'));
        while (!sp.done && !th.dead) yield;
        if (t._say === bub) { t._say = null; RT.dirty = true; }
        break;
      }
      case 'looks_switchcostumeto': { const i = findIdx(t.costumes, String(f.COSTUME)); if (i >= 0) t.current = i; RT.dirty = true; break; }
      case 'looks_nextcostume': t.current = (t.current + 1) % t.costumes.length; RT.dirty = true; break;
      case 'looks_switchbackdropto': { const st = RT.project.stage, i = findIdx(st.costumes, String(f.BACKDROP)); if (i >= 0) st.current = i; RT.dirty = true; RT.bgHat(); break; }
      case 'looks_nextbackdrop': { const st = RT.project.stage; st.current = (st.current + 1) % st.costumes.length; RT.dirty = true; RT.bgHat(); break; }
      case 'looks_changesizeby': setSize(t, t.size + N('CHANGE')); break;
      case 'looks_setsizeto': setSize(t, N('SIZE')); break;
      case 'looks_show': t.visible = true; RT.dirty = true; break;
      case 'looks_hide': t.visible = false; t._say = null; RT.dirty = true; break;

      case 'sound_play': case 'sound_playuntildone': {
        const i = findIdx(t.sounds, String(f.SOUND_MENU));
        if (i < 0) break;
        const h = playSoundObj(t.sounds[i], t.volume);
        if (b.op === 'sound_playuntildone') { yield; while (!h.done && !th.dead) yield; if (th.dead) h.cancel = true; }
        break;
      }
      case 'sound_stopallsounds': stopSounds(); break;
      case 'sound_setvolumeto': t.volume = PQ.clamp(N('VOLUME'), 0, 100); break;
      case 'sound_changevolumeby': t.volume = PQ.clamp((t.volume === undefined ? 100 : t.volume) + N('VOLUME'), 0, 100); break;

      case 'text2speech_setVoice': t._voice = String(f.VOICE); break;
      case 'text2speech_speakAndWait': {
        const words = fmt(A('WORDS'));
        if (!words) break;
        const bub = t.isStage ? null : { text: words, think: false };
        if (bub) { t._say = bub; RT.dirty = true; }
        const h = utter(words, t._voice);
        yield;
        while (!h.done && !th.dead) yield;
        if (bub && t._say === bub) { t._say = null; RT.dirty = true; }
        break;
      }

      case 'sensing_resettimer': RT.timerStart = RT.now(); break;
      case 'sensing_askandwait': {
        const q = fmt(A('QUESTION'));
        let done = false;
        if (PQ.ui && PQ.ui.ask) PQ.ui.ask(q, (ans) => { RT.answer = ans; done = true; }, t); else done = true;
        yield;
        while (!done && !th.dead) yield;
        break;
      }

      case 'data_setvariableto': {
        const v = RT.getVar(f.VARIABLE); if (!v) break;
        const x = A('VALUE'); v.value = isNumLike(x) ? Number(x) : x; RT.dirty = true; break;
      }
      case 'data_changevariableby': { const v = RT.getVar(f.VARIABLE); if (v) { v.value = toNum(v.value) + N('VALUE'); RT.dirty = true; } break; }
      case 'data_showvariable': { const v = RT.getVar(f.VARIABLE); if (v) { v.show = true; RT.dirty = true; } break; }
      case 'data_hidevariable': { const v = RT.getVar(f.VARIABLE); if (v) { v.show = false; RT.dirty = true; } break; }

      case 'pen_clear': RT.penClear(); break;
      case 'pen_penDown': t._pen = t._pen || { down: false, color: '#FF3355', size: 4 }; t._pen.down = true; penLine(t, t.x, t.y, t.x, t.y); RT.dirty = true; break;
      case 'pen_penUp': if (t._pen) t._pen.down = false; break;
      case 'pen_setPenColorToColor': t._pen = t._pen || { down: false, color: '#FF3355', size: 4 }; t._pen.color = String(f.COLOR); break;
      case 'pen_changePenSizeBy': t._pen = t._pen || { down: false, color: '#FF3355', size: 4 }; t._pen.size = PQ.clamp(t._pen.size + N('SIZE'), 1, 400); break;
      case 'pen_setPenSizeTo': t._pen = t._pen || { down: false, color: '#FF3355', size: 4 }; t._pen.size = PQ.clamp(N('SIZE'), 1, 400); break;
      case 'pen_stamp': { const c = penCtx(); drawTarget(c, t); RT.dirty = true; break; }

      case 'control_wait': yield* waitSecs(th, N('DURATION')); break;
      case 'control_repeat': {
        const n = Math.floor(N('TIMES') + 0.5);
        for (let i = 0; i < n; i++) { yield* RT.exec(b.sub, th); if (th.dead) return; yield; }
        break;
      }
      case 'control_forever': for (;;) { yield* RT.exec(b.sub, th); if (th.dead) return; yield; } // eslint-disable-line no-constant-condition
      case 'control_if': if (RT.cond(b.cond, t)) yield* RT.exec(b.sub, th); break;
      case 'control_if_else': if (RT.cond(b.cond, t)) yield* RT.exec(b.sub, th); else yield* RT.exec(b.sub2, th); break;
      case 'control_wait_until': yield; while (!RT.cond(b.cond, t) && !th.dead) yield; break;
      case 'control_repeat_until': while (!RT.cond(b.cond, t)) { yield* RT.exec(b.sub, th); if (th.dead) return; yield; } break;
      case 'control_stop':
        if (f.STOP_OPTION === 'all') { th.dead = true; RT.stopAll(); } else th.dead = true;
        return;
      case 'event_broadcast': RT.broadcast(String(f.BROADCAST_INPUT)); break;
      case 'event_broadcastandwait': {
        const started = RT.broadcast(String(f.BROADCAST_INPUT));
        yield;
        while (started.some((x) => !x.dead) && !th.dead) yield;
        break;
      }
      default: break;
    }
  };

  PQ._rt = { fmt, prep, hit, bounds, setXY, setSize, wrapDir, dims, touching };
})(typeof window !== 'undefined' ? window : globalThis);
