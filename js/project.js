/* PequeBloques — diseñado por David OZC
 * project.js: modelo de proyecto + importar/exportar .sb3 (Scratch 3)
 */
(function (g) {
  'use strict';
  const PQ = g.PQ = g.PQ || {};
  const B = PQ.BLOCKS;

  const BLANK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2" viewBox="0 0 2 2"></svg>';

  PQ.newTarget = function (name, isStage) {
    return {
      id: PQ.uid('t'), name, isStage: !!isStage,
      costumes: [], current: 0, sounds: [], scripts: [],
      x: 0, y: 0, size: 100, direction: 90, visible: true, rotationStyle: 'all around'
    };
  };

  PQ.newProject = function () {
    return { title: 'Mi proyecto', stage: PQ.newTarget('Escenario', true), sprites: [], messages: ['mensaje1'], vars: [] };
  };

  PQ.mkCostume = function (name, svgOrBytes, fmt, rcx, rcy, res) {
    const isStr = typeof svgOrBytes === 'string';
    return {
      name, fmt: fmt || 'svg', bytes: isStr ? PQ.enc(svgOrBytes) : svgOrBytes,
      rcx: rcx, rcy: rcy, res: res || 1
    };
  };

  PQ.allTargets = (p) => [p.stage].concat(p.sprites);

  PQ.uniqueName = function (name, names) {
    if (names.indexOf(name) < 0) return name;
    const base = name.replace(/\d+$/, '');
    let i = 2;
    while (names.indexOf(base + i) >= 0) i++;
    return base + i;
  };

  /* ------------------------------------------------------------------
   * Estimación de tamaño para ordenar programas importados sin DOM
   * ------------------------------------------------------------------ */
  function rows(arr) {
    let n = 0;
    (arr || []).forEach((b) => {
      n += 1;
      if (b.sub) n += Math.max(0.7, rows(b.sub)) + 0.5;
      if (b.sub2) n += Math.max(0.7, rows(b.sub2)) + 0.5;
    });
    return n;
  }
  PQ.estimateHeight = (s) => Math.round(rows(s.blocks) * 46 + 8);
  PQ.layoutScripts = function (scripts, colW, maxH) {
    colW = colW || 430; maxH = maxH || 1500;
    const order = scripts.slice().sort((a, b) => (a._oy - b._oy) || (a._ox - b._ox));
    let x = 24, y = 24, col = 0;
    order.forEach((s) => {
      const h = PQ.estimateHeight(s);
      if (y > 24 && y + h > maxH) { col++; x = 24 + col * colW; y = 24; }
      s.x = x; s.y = y; y += h + 36;
    });
  };

  /* ------------------------------------------------------------------
   * EXPORTAR .sb3
   * ------------------------------------------------------------------ */
  function mimeFor(fmt) {
    return ({ svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', bmp: 'image/bmp', wav: 'audio/wav', mp3: 'audio/mpeg' })[fmt] || 'application/octet-stream';
  }
  PQ.mimeFor = mimeFor;

  PQ.exportSb3 = function (project, opts) {
    const files = {};     // nombre -> bytes (sin duplicados)
    const bmap = {};      // nombre de mensaje -> id
    const bmapRev = {};
    (project.messages || []).forEach((n) => {
      const id = 'msg' + PQ.md5(PQ.enc(n)).slice(0, 16);
      bmap[n] = id; bmapRev[id] = n;
    });
    function msgId(name) {
      if (!bmap[name]) { bmap[name] = 'msg' + PQ.md5(PQ.enc(name)).slice(0, 16); }
      return bmap[name];
    }

    const exts = {};
    function exportTarget(t, layer) {
      const blocks = {};
      const costumes = t.costumes.map((c) => {
        const id = PQ.md5(c.bytes), ext = c.fmt === 'jpeg' ? 'jpg' : c.fmt;
        const md5ext = id + '.' + ext;
        files[md5ext] = c.bytes;
        const o = { assetId: id, name: c.name, md5ext, dataFormat: ext, rotationCenterX: c.rcx, rotationCenterY: c.rcy };
        if (ext !== 'svg') o.bitmapResolution = c.res || 1;
        return o;
      });
      const sounds = t.sounds.map((s) => {
        const id = PQ.md5(s.bytes), md5ext = id + '.' + s.fmt;
        files[md5ext] = s.bytes;
        return { assetId: id, name: s.name, dataFormat: s.fmt, rate: s.rate, sampleCount: s.count, md5ext };
      });

      function addBool(b, parent) {
        const id = PQ.uid('b');
        blocks[id] = makeNode(b, id, parent, null, false, 0, 0);
        return id;
      }
      const varId = (n) => 'var' + PQ.md5(PQ.enc(String(n))).slice(0, 16);
      function makeNode(b, id, parent, next, top, x, y) {
        const spec = B[b.op];
        const node = { opcode: b.op, next, parent, inputs: {}, fields: {}, shadow: false, topLevel: !!top };
        if (top) { node.x = Math.round(x); node.y = Math.round(y); }
        Object.keys(spec.args).forEach((n) => {
          const a = spec.args[n];
          let v = b.f[n];
          if (v === undefined || v === null) v = a.d === undefined ? '' : a.d;
          switch (a.k) {
            case 'prim': {
              const nb = b.in && b.in[n];
              if (nb && nb.op === 'data_variable') node.inputs[n] = [3, [12, String(nb.f.VARIABLE), varId(nb.f.VARIABLE)], [a.code, String(v)]];
              else if (nb) node.inputs[n] = [3, addBool(nb, id), [a.code, String(v)]];
              else node.inputs[n] = [1, [a.code, String(v)]];
              break;
            }
            case 'bslot': { const nb = b.in && b.in[n]; if (nb) node.inputs[n] = [2, addBool(nb, id)]; break; }
            case 'menu': {
              const sid = PQ.uid('s');
              const f = {}; f[a.field] = [String(v), null];
              blocks[sid] = { opcode: a.shadow, next: null, parent: id, inputs: {}, fields: f, shadow: true, topLevel: false };
              node.inputs[n] = [1, sid]; break;
            }
            case 'field': node.fields[n] = a.menu === 'var' ? [String(v), varId(v)] : [String(v), null]; break;
            case 'bfield': node.fields[n] = [String(v), msgId(String(v))]; break;
            case 'bin': node.inputs[n] = [1, [11, String(v), msgId(String(v))]]; break;
          }
        });
        if (spec.cond && b.cond) node.inputs.CONDITION = [2, addBool(b.cond, id)];
        if (spec.kind === 'c') {
          const s1 = addStack(b.sub, id);
          if (s1) node.inputs.SUBSTACK = [2, s1];
          if (spec.two) { const s2 = addStack(b.sub2, id); if (s2) node.inputs.SUBSTACK2 = [2, s2]; }
        }
        if (spec.ext) exts[spec.ext] = true;
        if (b.op === 'control_stop') node.mutation = { tagName: 'mutation', children: [], hasnext: 'false' };
        return node;
      }
      function addStack(arr, parent, pos) {
        if (!arr || !arr.length) return null;
        const ids = arr.map(() => PQ.uid('b'));
        arr.forEach((b, i) => {
          blocks[ids[i]] = makeNode(b, ids[i], i === 0 ? parent : ids[i - 1], ids[i + 1] || null,
            !!pos && i === 0, pos ? pos.x : 0, pos ? pos.y : 0);
        });
        return ids[0];
      }
      (t.scripts || []).forEach((s) => { addStack(s.blocks, null, { x: s.x, y: s.y }); });

      const out = {
        isStage: !!t.isStage, name: t.isStage ? 'Stage' : t.name, variables: {}, lists: {}, broadcasts: {},
        blocks, comments: {}, currentCostume: Math.min(t.current || 0, Math.max(0, costumes.length - 1)),
        costumes, sounds, volume: 100, layerOrder: layer
      };
      if (t.isStage) {
        (project.vars || []).forEach((v) => { out.variables[varId(v.name)] = [v.name, typeof v.value === 'number' ? v.value : (v.value === undefined ? 0 : v.value)]; });
        out.tempo = 60; out.videoTransparency = 50; out.videoState = 'on'; out.textToSpeechLanguage = null;
      } else {
        out.visible = !!t.visible; out.x = Math.round(t.x * 100) / 100; out.y = Math.round(t.y * 100) / 100;
        out.size = t.size; out.direction = t.direction; out.draggable = false; out.rotationStyle = t.rotationStyle || 'all around';
      }
      return out;
    }

    // recoger todos los mensajes usados
    PQ.allTargets(project).forEach((t) => {
      (function walk(arr) {
        (arr || []).forEach((b) => {
          Object.keys(B[b.op].args).forEach((n) => {
            const a = B[b.op].args[n];
            if ((a.k === 'bfield' || a.k === 'bin') && b.f[n]) msgId(String(b.f[n]));
          });
          walk(b.sub); walk(b.sub2);
        });
      })([].concat.apply([], (t.scripts || []).map((s) => s.blocks)));
    });

    const targets = [exportTarget(project.stage, 0)];
    project.sprites.forEach((s, i) => targets.push(exportTarget(s, i + 1)));
    const bc = {};
    Object.keys(bmap).forEach((n) => { bc[bmap[n]] = n; });
    targets[0].broadcasts = bc;

    const json = {
      targets, monitors: (project.vars || []).filter((v) => v.show).map((v, i) => ({ id: 'var' + PQ.md5(PQ.enc(String(v.name))).slice(0, 16), mode: 'default', opcode: 'data_variable', params: { VARIABLE: v.name }, spriteName: null, value: v.value === undefined ? 0 : v.value, width: 0, height: 0, x: 5, y: 5 + i * 27, visible: true, sliderMin: 0, sliderMax: 100, isDiscrete: true })), extensions: Object.keys(exts),
      meta: { semver: '3.0.0', vm: '0.2.0', agent: 'PequeBloques - diseñado por David OZC' }
    };
    const list = [{ name: 'project.json', data: PQ.enc(JSON.stringify(json)) }];
    Object.keys(files).forEach((n) => list.push({ name: n, data: files[n] }));
    return PQ.zip(list);
  };

  /* ------------------------------------------------------------------
   * IMPORTAR .sb3
   * ------------------------------------------------------------------ */
  function normSvg(text) {
    if (typeof DOMParser === 'undefined') return text;
    try {
      const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
      const svg = doc.documentElement;
      if (!svg || svg.nodeName.toLowerCase() !== 'svg' || doc.getElementsByTagName('parsererror').length) return text;
      let w = parseFloat(svg.getAttribute('width')), h = parseFloat(svg.getAttribute('height'));
      if (w > 0 && h > 0) return text;
      const vb = (svg.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(parseFloat);
      if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) {
        svg.setAttribute('width', String(vb[2])); svg.setAttribute('height', String(vb[3]));
        return new XMLSerializer().serializeToString(svg);
      }
    } catch (e) { /* se deja tal cual */ }
    return text;
  }
  PQ.normSvg = normSvg;

  PQ.importSb3 = async function (buf, title) {
    const files = await PQ.unzip(buf);
    const pjBytes = files['project.json'];
    if (!pjBytes) throw new Error('No se encuentra project.json: ¿es un proyecto de Scratch 3 (.sb3)?');
    let pj;
    try { pj = JSON.parse(PQ.dec(pjBytes)); } catch (e) { throw new Error('El archivo project.json está dañado.'); }
    if (!pj.targets || !Array.isArray(pj.targets)) {
      throw new Error('Este proyecto es de una versión antigua de Scratch (.sb2 / .sb). Ábrelo en Scratch 3 y guárdalo de nuevo como .sb3.');
    }
    const report = { skipped: 0, ops: {}, targets: 0, missing: 0 };
    const stageT = pj.targets.find((t) => t.isStage);
    const project = PQ.newProject();
    project.title = title || 'Mi proyecto';
    const msgNames = {};
    if (stageT && stageT.broadcasts) Object.keys(stageT.broadcasts).forEach((id) => { msgNames[id] = stageT.broadcasts[id]; });
    pj.targets.forEach((t) => { if (t.broadcasts) Object.keys(t.broadcasts).forEach((id) => { msgNames[id] = t.broadcasts[id]; }); });
    const varNames = {};
    const taken = [];
    function addVar(id, name, value) {
      if (varNames[id] !== undefined) return;
      const nm = PQ.uniqueName(String(name), taken); taken.push(nm); varNames[id] = nm;
      project.vars.push({ name: nm, value: value === undefined ? 0 : value, show: false });
    }
    pj.targets.forEach((t) => { Object.keys(t.variables || {}).forEach((id) => addVar(id, t.variables[id][0], t.variables[id][1])); });
    (pj.monitors || []).forEach((m) => {
      if (m.opcode === 'data_variable' && m.visible && varNames[m.id] !== undefined) { const v = project.vars.find((x) => x.name === varNames[m.id]); if (v) v.show = true; }
    });
    const msgSet = [];
    const addMsg = (n) => { if (n && msgSet.indexOf(n) < 0) msgSet.push(n); };
    Object.keys(msgNames).forEach((id) => addMsg(msgNames[id]));

    function convertTarget(t) {
      const tgt = PQ.newTarget(t.isStage ? 'Escenario' : t.name, t.isStage);
      (t.costumes || []).forEach((c) => {
        const ext = (c.dataFormat || '').toLowerCase();
        const fn = c.md5ext || (c.assetId + '.' + c.dataFormat);
        let bytes = files[fn];
        if (!bytes) { report.missing++; return; }
        let rcx = c.rotationCenterX, rcy = c.rotationCenterY;
        if (ext === 'svg') {
          const txt = PQ.dec(bytes), n = normSvg(txt);
          if (n !== txt) bytes = PQ.enc(n);
        }
        tgt.costumes.push({ name: c.name || 'disfraz', fmt: ext === 'jpeg' ? 'jpg' : ext, bytes,
          rcx: typeof rcx === 'number' ? rcx : 0, rcy: typeof rcy === 'number' ? rcy : 0,
          res: ext === 'svg' ? 1 : (c.bitmapResolution || 1) });
      });
      if (!tgt.costumes.length) tgt.costumes.push(PQ.mkCostume(t.isStage ? 'fondo1' : 'disfraz1', BLANK_SVG, 'svg', 1, 1, 1));
      tgt.current = PQ.clamp(t.currentCostume || 0, 0, tgt.costumes.length - 1);
      (t.sounds || []).forEach((s) => {
        const fn = s.md5ext || (s.assetId + '.' + s.dataFormat);
        const bytes = files[fn];
        if (!bytes) { report.missing++; return; }
        tgt.sounds.push({ name: s.name || 'sonido', fmt: (s.dataFormat || 'wav').toLowerCase(), bytes, rate: s.rate || 22050, count: s.sampleCount || 0 });
      });
      if (!t.isStage) {
        tgt.x = +t.x || 0; tgt.y = +t.y || 0; tgt.size = +t.size || 100;
        tgt.direction = t.direction === undefined ? 90 : +t.direction;
        tgt.visible = t.visible !== false; tgt.rotationStyle = t.rotationStyle || 'all around';
      }
      tgt.scripts = convertBlocks(t.blocks || {});
      return tgt;
    }

    function litOf(inp, dict) {
      if (!inp) return undefined;
      let v = inp[1];
      if (typeof v === 'string') {                 // bloque (reportero) -> usar sombra si existe
        if (inp[0] === 3 && inp[2] !== undefined) v = inp[2]; else {
          const sb = dict[v];
          if (sb && sb.shadow) { const f0 = Object.keys(sb.fields)[0]; return f0 ? String(sb.fields[f0][0]) : undefined; }
          return undefined;
        }
      }
      if (typeof v === 'string') { const sb = dict[v]; if (sb) { const f0 = Object.keys(sb.fields)[0]; return f0 ? String(sb.fields[f0][0]) : undefined; } return undefined; }
      if (Array.isArray(v)) {
        if (v[0] === 11) return v[1];
        return v[1] === undefined || v[1] === null ? undefined : String(v[1]);
      }
      return v === undefined || v === null ? undefined : String(v);
    }
    function menuOf(inp, dict) {
      if (!inp) return undefined;
      let v = inp[1];
      if (inp[0] === 3 && inp[2] !== undefined) v = inp[2];
      if (typeof v === 'string') {
        const sb = dict[v];
        if (sb && sb.fields) { const f0 = Object.keys(sb.fields)[0]; if (f0) return String(sb.fields[f0][0]); }
        return undefined;
      }
      if (Array.isArray(v)) return v[0] === 11 ? v[1] : String(v[1]);
      return undefined;
    }

    function convertBlocks(dict) {
      const scripts = [];
      function convert(blk) {
        const spec = B[blk.opcode];
        if (!spec) { report.skipped++; report.ops[blk.opcode] = (report.ops[blk.opcode] || 0) + 1; return null; }
        const b = { op: blk.opcode, f: {} };
        Object.keys(spec.args).forEach((n) => {
          const a = spec.args[n];
          let v;
          if (a.k === 'bslot') {
            const bi = blk.inputs && blk.inputs[n];
            if (bi && typeof bi[1] === 'string' && dict[bi[1]]) { const nb = convert(dict[bi[1]]); if (nb) (b.in = b.in || {})[n] = nb; }
            return;
          }
          if (a.k === 'prim') {
            const pi = blk.inputs && blk.inputs[n];
            v = litOf(pi, dict);
            if (pi && pi.length >= 2) {
              const first = pi[1];
              if (Array.isArray(first) && first[0] === 12) (b.in = b.in || {})[n] = { op: 'data_variable', f: { VARIABLE: varNames[first[2]] || String(first[1]) } };
              else if (Array.isArray(first) && first[0] === 13) { report.skipped++; report.ops.lista = (report.ops.lista || 0) + 1; }
              else if (typeof first === 'string' && dict[first] && !dict[first].shadow) {
                const nb = convert(dict[first]); if (nb) (b.in = b.in || {})[n] = nb;
              }
            }
          }
          else if (a.k === 'menu') v = menuOf(blk.inputs && blk.inputs[n], dict);
          else if (a.k === 'field') {
            const fv = blk.fields && blk.fields[n];
            v = fv ? String(a.menu === 'var' && fv[1] && varNames[fv[1]] !== undefined ? varNames[fv[1]] : fv[0]) : undefined;
          }
          else if (a.k === 'bfield') {
            const fv = blk.fields && blk.fields[n];
            v = fv ? (msgNames[fv[1]] || String(fv[0])) : undefined;
          } else if (a.k === 'bin') {
            v = menuOf(blk.inputs && blk.inputs[n], dict);
            if (v !== undefined && msgNames[v]) v = msgNames[v];
          }
          if (v === undefined) v = a.d === undefined ? '' : a.d;
          if (a.k === 'prim' && a.t === 'num' && v !== '' && isNaN(Number(v))) v = a.d === undefined ? '' : a.d;
          if (n === 'STOP_OPTION' && v !== 'all' && v !== 'this script') v = 'all';
          if (a.k === 'bfield' || a.k === 'bin') addMsg(v);
          b.f[n] = v;
        });
        if (spec.kind === 'c') {
          b.sub = chain(blk.inputs && blk.inputs.SUBSTACK ? blk.inputs.SUBSTACK[1] : null);
          if (spec.two) b.sub2 = chain(blk.inputs && blk.inputs.SUBSTACK2 ? blk.inputs.SUBSTACK2[1] : null);
        }
        if (spec.cond) {
          b.cond = null;
          const ci = blk.inputs && blk.inputs.CONDITION;
          if (ci && typeof ci[1] === 'string' && dict[ci[1]]) {
            const cb = dict[ci[1]];
            if (B[cb.opcode] && B[cb.opcode].kind === 'bool') b.cond = convert(cb);
            else { report.skipped++; report.ops[cb.opcode] = (report.ops[cb.opcode] || 0) + 1; }
          }
        }
        return b;
      }
      function chain(id) {
        const arr = [];
        let guard = 0;
        while (id && dict[id] && guard++ < 100000) {
          const blk = dict[id];
          const n = convert(blk);
          if (n) arr.push(n);
          id = blk.next;
        }
        return arr;
      }
      Object.keys(dict).forEach((id) => {
        const blk = dict[id];
        if (!blk || Array.isArray(blk) || !blk.topLevel || blk.shadow) return;
        const arr = chain(id);
        if (arr.length) scripts.push({ x: 0, y: 0, _ox: blk.x || 0, _oy: blk.y || 0, blocks: arr });
        else if (!B[blk.opcode]) { /* ya contado */ }
      });
      PQ.layoutScripts(scripts);
      scripts.forEach((s) => { delete s._ox; delete s._oy; });
      return scripts;
    }

    project.stage = convertTarget(stageT || { isStage: true, costumes: [], sounds: [], blocks: {} });
    pj.targets.filter((t) => !t.isStage).sort((a, b) => (a.layerOrder || 0) - (b.layerOrder || 0)).forEach((t) => {
      project.sprites.push(convertTarget(t)); report.targets++;
    });
    const names = [];
    project.sprites.forEach((s) => { s.name = PQ.uniqueName(s.name, names); names.push(s.name); });
    project.messages = msgSet.length ? msgSet : ['mensaje1'];
    project.vars.forEach((v) => { if (v.value !== '' && typeof v.value === 'string' && v.value.trim() !== '' && !isNaN(Number(v.value))) v.value = Number(v.value); });
    return { project, report };
  };

  /* ¿Qué nivel de paleta necesita un proyecto? */
  PQ.projectLevel = function (p) {
    let lvl = 1;
    PQ.allTargets(p).forEach((t) => {
      (function walk(arr) {
        (arr || []).forEach((b) => {
          if (B[b.op].lvl > lvl) lvl = B[b.op].lvl;
          if (b.cond) { if (B[b.cond.op].lvl > lvl) lvl = B[b.cond.op].lvl; walk([b.cond]); }
          if (b.in) walk(Object.keys(b.in).map((k) => b.in[k]));
          walk(b.sub); walk(b.sub2);
        });
      })([].concat.apply([], (t.scripts || []).map((s) => s.blocks)));
    });
    return lvl;
  };
})(typeof window !== 'undefined' ? window : globalThis);
