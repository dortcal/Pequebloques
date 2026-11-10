"""Fase 2: halo, fundido de disfraz, bocadillos animados, rebote al encajar, celebración de retos, modo tranquilo y reduced-motion."""
import asyncio, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from playwright.async_api import async_playwright
from pchelp import STUB
SP='/tmp/claude-0/-home-claude/ca5a60ab-d678-5fd1-82c1-780dbf3d7572/scratchpad/'
URL='file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','index.html'))+'?voz=dispositivo'
FADE = r"""
async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms)); const RT = PQ.RT; const out = {};
  PQ.loadProject(PQ.defaultProject(), { noAuto: true }); await wait(500);
  const p = PQ.S.project, t = p.sprites[0]; const mk = (op, f) => PQ.mkBlock(op, f || null, { project: p, target: t });
  // alfas usadas al dibujar el personaje durante un cambio de disfraz
  const alphas = []; const di = RT.ctx.drawImage.bind(RT.ctx);
  RT.ctx.drawImage = function () { alphas.push(+RT.ctx.globalAlpha.toFixed(2)); return di.apply(null, arguments); };
  t.scripts = [{ x: 0, y: 0, blocks: [mk('event_whenflagclicked'), mk('looks_nextcostume'), mk('control_wait', { DURATION: 0.5 })] }];
  alphas.length = 0; RT.greenFlag(); await wait(700);
  out.fundido = { alfas_parciales: alphas.filter((a) => a < 1).length, fx_fin: t._fx === null || t._fx === undefined, disfraz: t.current };
  // animación rápida (cada 0.1 s): no debe haber fundido
  const rp = mk('control_repeat', { TIMES: 6 }); rp.sub.push(mk('looks_nextcostume'), mk('control_wait', { DURATION: 0.1 }));
  t.scripts = [{ x: 0, y: 0, blocks: [mk('event_whenflagclicked'), rp] }];
  await wait(300); alphas.length = 0; RT.greenFlag(); await wait(200); alphas.length = 0; await wait(700);
  out.animacion_rapida_alfas_parciales = alphas.filter((a) => a < 1).length;
  // bocadillo: escalas usadas al entrar y al salir
  const scales = []; const sc = RT.ctx.scale.bind(RT.ctx); RT.ctx.scale = function (a, b) { scales.push(+a.toFixed(2)); return sc(a, b); };
  t.scripts = [{ x: 0, y: 0, blocks: [mk('event_whenflagclicked'), mk('looks_sayforsecs', { MESSAGE: '¡Hola!', SECS: 0.5 })] }];
  PQ.settings.voice = false; scales.length = 0; RT.greenFlag(); await wait(1100);
  const bub = scales.filter((v) => v !== 1 && v < 1.2 && v > 0.3);
  out.bocadillo = { escalas_distintas: new Set(bub).size, min: Math.min.apply(null, bub), max: Math.max.apply(null, bub), queda: !!t._say || !!t._sayOut };
  out.tras_animar_no_redibuja = await (async () => { let n = 0; const r = RT.render; RT.render = function () { n++; return r.apply(this, arguments); }; await wait(400); RT.render = r; return n; })();
  return out;
}
"""
async def run(ctxopts, label, calm=False):
    p=await async_playwright().start(); b=await p.chromium.launch(); cx=await b.new_context(viewport={'width':1200,'height':800}, **ctxopts); pg=await cx.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script(STUB)
    if calm: await pg.add_init_script("try{localStorage.setItem('pequebloques.ajustes', JSON.stringify({calm:true}))}catch(e){}")
    await pg.goto(URL); await pg.wait_for_timeout(600)
    await pg.evaluate('document.querySelectorAll(".toast").forEach(t=>t.remove())')
    print('==', label)
    r=await pg.evaluate(FADE)
    for k,v in r.items(): print('  ',k,v)
    # halo: sin filter y con pseudo-elemento
    r=await pg.evaluate("""async()=>{const wait=(ms)=>new Promise(r=>setTimeout(r,ms));const p=PQ.S.project,t=p.sprites[0];const mk=(op,f)=>PQ.mkBlock(op,f||null,{project:p,target:t});
      const fo=mk('control_forever');fo.sub.push(mk('motion_turnright'));t.scripts=[{x:60,y:60,blocks:[mk('event_whenflagclicked'),fo]}];PQ.ed.refreshAll();PQ.RT.greenFlag();await wait(300);
      const el=document.querySelector('#wsin .script.running');const cs=el?getComputedStyle(el):null,ps=el?getComputedStyle(el,'::after'):null;
      const o={running:!!el,filter:cs&&cs.filter,after_shadow:ps&&ps.boxShadow!=='none',after_anim:ps&&ps.animationName};PQ.RT.stopAll();return o}""")
    print('   halo',r)
    # rebote al encajar: arrastre real de «mover» bajo el sombrero
    await pg.evaluate("""()=>{const p=PQ.S.project,t=p.sprites[0];t.scripts=[{x:80,y:80,blocks:[PQ.mkBlock('event_whenflagclicked',null,{project:p,target:t})]}];PQ.ed.refreshAll();document.querySelector('#cats .cat[data-cat="motion"]').click()}""")
    await pg.wait_for_timeout(200)
    src=await pg.evaluate("(()=>{const r=document.querySelector('#pal .block[data-op=\"motion_movesteps\"]').getBoundingClientRect();return [r.left+14,r.top+r.height/2]})()")
    dst=await pg.evaluate("(()=>{const r=document.querySelector('#wsin .script .block').getBoundingClientRect();return [r.left+14,r.bottom+14]})()")
    await pg.mouse.move(*src); await pg.mouse.down(); await pg.mouse.move(src[0]+30,src[1]+10,steps=4); await pg.mouse.move(dst[0],dst[1],steps=12); await pg.wait_for_timeout(80)
    line=await pg.evaluate("(()=>{const l=document.querySelector('.snapline');if(!l)return null;const c=getComputedStyle(l);return {display:c.display,h:c.height,anim:c.animationName}})()")
    await pg.screenshot(path=SP+'p2_snap_%s.png'%label)
    await pg.mouse.up(); await pg.wait_for_timeout(40)
    sn=await pg.evaluate("(()=>{const e=document.querySelector('#wsin .block.snapped');return {snapped:!!e,anim:e?getComputedStyle(e).animationName:null,bloques:PQ.S.project.sprites[0].scripts[0].blocks.map(b=>b.op)}})()")
    print('   destino',line,'| encajado',sn)
    # reto: cuenta atrás → cambiar a 5 y probar
    await pg.evaluate('PQ.openExample("cuenta-atras")'); await pg.wait_for_timeout(500)
    r=await pg.evaluate("""async()=>{const wait=(ms)=>new Promise(r=>setTimeout(r,ms));const p=PQ.S.project,t=p.sprites.find(s=>s.name==='Cohete');const sc=t.scripts.find(s=>s.blocks[0].op==='event_whenflagclicked');
      const o={antes:PQ.retoState()&&PQ.retoState().ex.done(p)};PQ.RT.greenFlag();await wait(1500);o.sin_cambio_celebra=!!document.querySelector('#pipo.win');PQ.RT.stopAll();
      const i=sc.blocks.findIndex(b=>b.op==='looks_sayforsecs');const mk=(m)=>PQ.mkBlock('looks_sayforsecs',{MESSAGE:m,SECS:0.2},{project:p,target:t});sc.blocks.splice(i,0,mk('5'),mk('4'));sc.blocks.forEach(b=>{if(b.op==='looks_sayforsecs')b.f.SECS=0.2});
      PQ.ed.refreshAll();PQ.ed.changed();await wait(900);o.ok_tras_cambio=PQ.retoState().ex.done(p);o.celebra_antes_de_probar=!!document.querySelector('#pipo.win');
      document.querySelector('#btnFlag').click();
      for(let k=0;k<120&&!document.querySelector('#pipo.win');k++)await wait(100);
      const b=document.querySelector('#pipo.win');o.celebra=b?b.querySelector('p').textContent:null;o.confeti=document.querySelectorAll('.confetti').length;o.banner_done=document.querySelector('#banner').classList.contains('done');
      await wait(120);const m=document.querySelector('#pipo .mascot');o.gesto=m?getComputedStyle(m).animationName:null;return o}""")
    print('   reto',r)
    await pg.screenshot(path=SP+'p2_reto_%s.png'%label)
    # los otros retos: la comprobación es falsa al abrir
    for rid in ['baile-robot','guagua-isla','arregla-cuento']:
        await pg.evaluate('PQ.openExample("%s")'%rid); await pg.wait_for_timeout(300)
        print('   ',rid,'conseguido al abrir:',await pg.evaluate('PQ.retoState().ex.done(PQ.S.project)'))
    r=await pg.evaluate("""()=>{const p=PQ.S.project,t=p.sprites.find(s=>s.name==='Perro');const sc=t.scripts.find(s=>s.blocks[0].op==='event_whenflagclicked');
      (function w(a){a.forEach(b=>{if(b.op==='motion_movesteps')b.f.STEPS=10;if(b.op==='looks_sayforsecs')b.f.SECS=2;w(b.sub||[])})})(sc.blocks);return PQ.retoState().ex.done(p)}""")
    print('    arregla-cuento arreglado:',r)
    print('   pageerrors',errs)
    await b.close(); await p.stop()
async def main():
    await run({}, 'normal')
    await run({'reduced_motion':'reduce'}, 'reduced')
    await run({}, 'tranquilo', calm=True)
asyncio.run(main())
