"""Banco de pruebas de rendimiento: touching con 10 personajes grandes + fluidez (posiciones distintas dibujadas por segundo)."""
import asyncio, os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from playwright.async_api import async_playwright
from pchelp import STUB
JS = r"""
async () => {
  const p = PQ.newProject(); p.stage.costumes.push(PQ.makeBackdrop('mar'));
  const ids = ['ballena','tortuga','guagua','robot','cohete','ballena','tortuga','guagua','robot','cohete'];
  ids.forEach((id, i) => { const s = PQ.makeSprite(id, p); s.name = id + i; s.size = 220; s.x = -160 + (i % 5) * 70; s.y = i < 5 ? 40 : -40; p.sprites.push(s); });
  PQ.loadProject(p, { noAuto: true });
  await new Promise((r) => setTimeout(r, 900));           // carga de imágenes
  const sp = PQ.S.project.sprites, RT = PQ.RT;
  const all = () => { let n = 0; for (const a of sp) for (const b of sp) if (a !== b && RT.touching(a, b.name)) n++; return n; };
  all();
  // A) personajes quietos (90 consultas por pasada)
  let t0 = performance.now(), hits = 0; for (let k = 0; k < 60; k++) hits = all(); const still = (performance.now() - t0) / 60;
  // B) personajes moviéndose en cada pasada
  t0 = performance.now(); for (let k = 0; k < 60; k++) { sp.forEach((s, i) => { s.x += (i % 2 ? 1 : -1) * 0.7; s.direction = 90; }); hits = all(); } const moving = (performance.now() - t0) / 60;
  // D) peor caso: cajas solapadas en la esquina pero sin tocarse de verdad (hay que recorrer todo el solape)
  const A = sp[0], Bq = sp[5]; const ax = A.x, ay = A.y, bx = Bq.x, by = Bq.y;
  A.x = -60; A.y = 40; const ba = RT.bounds(A); const wA = ba.right - ba.left, hA = ba.top - ba.bottom;
  Bq.x = A.x + wA * 0.8; Bq.y = A.y - hA * 0.8;
  let corner = false; t0 = performance.now(); for (let k = 0; k < 200; k++) { Bq.x += (k % 2 ? 0.01 : -0.01); corner = RT.touching(A, Bq.name); } const cornerMs = (performance.now() - t0) / 200;
  A.x = ax; A.y = ay; Bq.x = bx; Bq.y = by;
  // C) programa real: cada personaje con «por siempre: mover, rebotar, si ¿tocando? siguiente disfraz» (10 hilos)
  const mk = (op, f) => PQ.mkBlock(op, f || null, { project: p, target: sp[0] });
  sp.forEach((s, i) => {
    const iff = mk('control_if'); iff.cond = mk('sensing_touchingobject', { TOUCHINGOBJECTMENU: sp[(i + 1) % sp.length].name }); iff.sub.push(mk('looks_nextcostume'));
    const fo = mk('control_forever'); fo.sub.push(mk('motion_movesteps', { STEPS: 3 }), mk('motion_ifonedgebounce'), iff);
    s.direction = 30 + i * 33; s.rotationStyle = 'left-right';
    s.scripts.push({ x: 20, y: 20, blocks: [mk('event_whenflagclicked'), fo] });
  });
  // posiciones distintas dibujadas por segundo del primer personaje (fluidez visible)
  const seen = new Set(); let frames = 0;
  const tr = RT.ctx.translate.bind(RT.ctx); let idx = 0;
  const rend = RT.render; RT.render = function () { idx = 0; frames++; return rend.apply(this, arguments); };
  RT.ctx.translate = function (x, y) { if (idx === 1) seen.add(x.toFixed(3) + ',' + y.toFixed(3)); idx++; return tr(x, y); };
  let stepMs = 0, steps = 0; const st = RT.step; RT.step = function () { const a = performance.now(); st.apply(this, arguments); stepMs += performance.now() - a; steps++; };
  RT.greenFlag();
  let raf = 0; const cnt = () => { raf++; requestAnimationFrame(cnt); }; requestAnimationFrame(cnt);
  await new Promise((r) => setTimeout(r, 4000));
  const res = { consultas: 90, quietos_ms: +still.toFixed(3), moviendose_ms: +moving.toFixed(3), choques: hits, esquina_ms: +cornerMs.toFixed(4), esquina_toca: corner, rAF_por_s: raf / 4, renders_por_s: frames / 4, posiciones_distintas_por_s: seen.size / 4, paso_logico_ms: +(stepMs / steps).toFixed(3), pasos_por_s: steps / 4 };
  RT.stopAll(); return res;
}
"""
async def main():
    p=await async_playwright().start(); b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1200,'height':800}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script(STUB)
    await pg.goto('file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','index.html'))+'?voz=dispositivo'); await pg.wait_for_timeout(600)
    r=await pg.evaluate(JS); print(json.dumps(r, ensure_ascii=False)); print('errs',errs)
    await b.close(); await p.stop()
asyncio.run(main())
