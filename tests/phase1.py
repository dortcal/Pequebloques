"""Fase 1: glide/forever/repeat_until siguen funcionando, interpolación, touching correcto, aviso de hilo roto."""
import asyncio, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from playwright.async_api import async_playwright
from pchelp import STUB
JS = r"""
async () => {
  const out = {}; const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const RT = PQ.RT;
  PQ.loadProject(PQ.defaultProject(), { noAuto: true }); await wait(500);
  const p = PQ.S.project, t = p.sprites[0];
  const mk = (op, f) => PQ.mkBlock(op, f || null, { project: p, target: t });
  // 1) glide: dura lo que dice y llega exactamente
  t.x = -100; t.y = 0; t.scripts = [{ x: 0, y: 0, blocks: [mk('event_whenflagclicked'), mk('motion_glidesecstoxy', { SECS: 1, X: 100, Y: 50 })] }];
  let t0 = performance.now(); RT.greenFlag();
  // posiciones dibujadas (interpoladas) durante el deslizamiento
  const xs = []; const tr = RT.ctx.translate.bind(RT.ctx); let idx = 0; const rend = RT.render;
  RT.render = function () { idx = 0; return rend.apply(this, arguments); };
  RT.ctx.translate = function (x, y) { if (idx === 1) xs.push(x); idx++; return tr(x, y); };
  while (RT.running()) await wait(10);
  out.glide = { ms: Math.round(performance.now() - t0), x: t.x, y: t.y, dibujadas: new Set(xs.map((v) => v.toFixed(2))).size, monotona: xs.every((v, i) => i === 0 || v >= xs[i - 1] - 1e-6) };
  // el modelo no queda alterado por el dibujo interpolado
  // 2) repeat 10 { mover 10 } = 100 pasos, 10 pasos lógicos (~1/3 s)
  t.x = -100; t.y = 0; t.direction = 90;
  const rp = mk('control_repeat', { TIMES: 10 }); rp.sub.push(mk('motion_movesteps', { STEPS: 10 }));
  t.scripts = [{ x: 0, y: 0, blocks: [mk('event_whenflagclicked'), rp] }];
  t0 = performance.now(); RT.greenFlag(); while (RT.running()) await wait(5);
  out.repeat = { ms: Math.round(performance.now() - t0), x: t.x };
  // 3) repeat_until x > 50 { cambiar x por 7 }
  t.x = 0; const ru = mk('control_repeat_until'); const gt = mk('operator_gt', { OPERAND2: 50 }); gt.in = { OPERAND1: mk('motion_xposition') }; ru.cond = gt; ru.sub.push(mk('motion_changexby', { DX: 7 }));
  t.scripts = [{ x: 0, y: 0, blocks: [mk('event_whenflagclicked'), ru] }];
  RT.greenFlag(); while (RT.running()) await wait(5);
  out.repeat_until_x = t.x;
  // 4) forever + stop
  t.x = 0; const fo = mk('control_forever'); fo.sub.push(mk('motion_changexby', { DX: 1 }));
  t.scripts = [{ x: 0, y: 0, blocks: [mk('event_whenflagclicked'), fo] }];
  RT.greenFlag(); await wait(500); const xf = t.x; RT.stopAll(); await wait(100);
  out.forever = { x_tras_medio_segundo: xf, parado: !RT.running() && t.x === xf || t.x };
  // 5) salto grande: no se interpola (no aparece a medio camino)
  t.x = -200; xs.length = 0;
  const fo2 = mk('control_forever'); fo2.sub.push(mk('motion_gotoxy', { X: 200, Y: 0 }), mk('control_wait', { DURATION: 0.2 }), mk('motion_gotoxy', { X: -200, Y: 0 }), mk('control_wait', { DURATION: 0.2 }));
  t.scripts = [{ x: 0, y: 0, blocks: [mk('event_whenflagclicked'), fo2] }];
  RT.greenFlag(); await wait(900); RT.stopAll();
  const fence = new Set(xs.map((v) => Math.round(v))); out.salto_posiciones = [...fence].sort((a, b) => a - b);
  // 6) touching: comparación con el método antiguo (muestreo directo con hit) en 300 posiciones al azar
  const o = PQ.makeSprite('tortuga', p); p.sprites.push(o); await wait(600);
  const { prep, hit, bounds } = PQ._rt;
  const old = (a, b) => { const A = bounds(a), B = bounds(b); const l = Math.max(A.left, B.left), r = Math.min(A.right, B.right), bt = Math.max(A.bottom, B.bottom), tp = Math.min(A.top, B.top); if (l > r || bt > tp) return false; const pa = prep(a), pb = prep(b); for (let y = bt; y <= tp; y += 1) for (let x = l; x <= r; x += 1) if (hit(pa, x, y) && hit(pb, x, y)) return true; return false; };
  let dif = 0, yes = 0, falsePos = 0; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  t.rotationStyle = 'all around';
  for (let i = 0; i < 300; i++) {
    t.x = rnd() * 160 - 80; t.y = rnd() * 120 - 60; t.direction = Math.round(rnd() * 360 - 180); t.size = 60 + rnd() * 140; o.x = rnd() * 160 - 80; o.y = rnd() * 120 - 60; o.size = 60 + rnd() * 140;
    const a = RT.touching(t, o.name), b = old(t, o); if (a) yes++; if (a !== b) { dif++; if (a && !b) falsePos++; }
  }
  out.touching = { pruebas: 300, tocan: yes, diferencias_con_muestreo_fino: dif, falsos_positivos: falsePos };
  // memo: no vuelve a muestrear si nada cambia
  RT.stats.sampled = 0; for (let i = 0; i < 100; i++) RT.touching(t, o.name); out.memo_muestreos_en_100_consultas = RT.stats.sampled;
  // 7) hilo roto: aviso de Pipo y el resto sigue
  p.sprites.pop(); t.x = 0; t.size = 100; t.direction = 90;
  const bad = mk('motion_goto');                                  // bloque estropeado a propósito
  const fo3 = mk('control_forever'); fo3.sub.push(mk('motion_changexby', { DX: 1 }));
  t.scripts = [{ x: 20, y: 20, blocks: [mk('event_whenflagclicked'), mk('motion_movesteps', { STEPS: 10 }), bad] }, { x: 20, y: 200, blocks: [mk('event_whenflagclicked'), fo3] }];
  PQ.ed.refreshAll(); bad.f = null;
  RT.greenFlag(); await wait(600);
  const box = document.querySelector('#pipo');
  out.error = { globo: box ? box.querySelector('p').textContent : null, role: box && box.getAttribute('role'), marcado: document.querySelectorAll('#wsin .block.failed').length, otros_hilos_vivos: RT.threads.length, x: t.x > 10 };
  RT.stopAll();
  return out;
}
"""
async def main():
    p=await async_playwright().start(); b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1200,'height':800}); errs=[]; cons=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('console',lambda m: cons.append(m.text) if m.type=='error' else None)
    await pg.add_init_script(STUB)
    await pg.goto('file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','index.html'))+'?voz=dispositivo'); await pg.wait_for_timeout(600)
    r=await pg.evaluate(JS)
    for k,v in r.items(): print(k, v)
    await pg.screenshot(path='/tmp/claude-0/-home-claude/ca5a60ab-d678-5fd1-82c1-780dbf3d7572/scratchpad/p1_error.png')
    print('pageerrors',errs,'console.error',len(cons))
    await b.close(); await p.stop()
asyncio.run(main())
