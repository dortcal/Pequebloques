"""Verificación final sobre el HTML único: todos los ejemplos arrancan y se ejecutan sin errores, ida y vuelta .sb3 sin pérdidas,
recorrido básico sin errores de consola y sin animaciones con prefers-reduced-motion."""
import asyncio, os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from playwright.async_api import async_playwright
from pchelp import STUB
DIST='file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','dist','PequeBloques.html'))+'?voz=dispositivo'
NORM = r"""
(p) => {
  const blk = (b) => b ? { op: b.op, f: b.f, in: b.in ? Object.fromEntries(Object.keys(b.in).filter((k) => b.in[k]).sort().map((k) => [k, blk(b.in[k])])) : {}, cond: blk(b.cond), sub: (b.sub || []).map(blk), sub2: (b.sub2 || []).map(blk) } : null;
  const tgt = (t) => ({ name: t.name, x: t.x, y: t.y, size: t.size, dir: t.direction, vis: t.visible, cur: t.current, rot: t.rotationStyle,
    costumes: t.costumes.map((c) => [c.name, c.fmt, c.bytes ? c.bytes.length : 0]), sounds: t.sounds.map((s) => [s.name, s.bytes ? s.bytes.length : 0]),
    scripts: t.scripts.map((s) => s.blocks.map(blk)) });
  return JSON.stringify({ stage: tgt(p.stage), sprites: p.sprites.map(tgt), vars: (p.vars || []).map((v) => [v.name, v.value, !!v.show]).sort(), msgs: (p.messages || []).slice().sort() });
}
"""
async def main():
    p=await async_playwright().start(); b=await p.chromium.launch(); bad=0
    pg=await b.new_page(viewport={'width':1200,'height':800}); errs=[]; cons=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('console',lambda m: cons.append(m.text) if m.type=='error' else None)
    await pg.add_init_script(STUB); await pg.goto(DIST); await pg.wait_for_timeout(700)
    await pg.evaluate("(()=>{window.__terr=[];const o=PQ.onThreadError;PQ.onThreadError=(i)=>{window.__terr.push(String(i.error));o(i)}})()")
    ids=await pg.evaluate('PQ.EX.map(e=>e.id)'); print('ejemplos:',len(ids),'tutoriales:',await pg.evaluate('PQ.TUT.list.length'))
    # 1) cada ejemplo: abrir, bandera, tocar personajes y escenario, flechas; sin errores
    for i in ids:
        await pg.evaluate('PQ.openExample("%s")'%i); await pg.wait_for_timeout(250)
        await pg.evaluate('document.querySelectorAll(".toast,#pipo").forEach(t=>t.remove())')
        await pg.evaluate('PQ.RT.greenFlag()'); await pg.wait_for_timeout(1300)
        await pg.evaluate("PQ.S.project.sprites.forEach(s=>{if(s.visible)PQ.RT.spriteClicked(s)});PQ.RT.stageClicked();['right arrow','left arrow','up arrow','space'].forEach(k=>PQ.RT.keyEvent(k))")
        await pg.wait_for_timeout(900)
        st=await pg.evaluate('({th:PQ.RT.threads.length,terr:window.__terr.length})')
        await pg.evaluate('PQ.RT.stopAll()')
        if errs or st['terr']: print('  !!',i,errs,st); bad+=1; errs.clear(); await pg.evaluate('window.__terr=[]')
    print('1) ejemplos ejecutados sin errores:', len(ids)-bad, 'de', len(ids), '| console.error:', len(cons))
    # 2) ida y vuelta .sb3 de todos los ejemplos (dos vueltas: exportar→importar→exportar→importar debe ser estable)
    await pg.evaluate('(()=>{window.__norm='+NORM+'})()')
    lost=0; diff=[]
    for i in ids:
        r=await pg.evaluate("""async(id)=>{const ex=PQ.EX.find(e=>e.id===id);const p0=ex.build();p0.title=ex.title;
          const r1=await PQ.importSb3(PQ.exportSb3(p0),ex.title);const r2=await PQ.importSb3(PQ.exportSb3(r1.project),ex.title);
          const a=window.__norm(p0),b=window.__norm(r1.project),c=window.__norm(r2.project);
          const cnt=(s)=>(s.match(/"op":/g)||[]).length;
          let d='';if(a!==b){let k=0;while(k<a.length&&a[k]===b[k])k++;d=a.slice(Math.max(0,k-60),k+60)+' <> '+b.slice(Math.max(0,k-60),k+60)}
          return {same01:a===b,same12:b===c,blocks:[cnt(a),cnt(b),cnt(c)],skipped:r1.report.skipped,missing:r1.report.missing,d}}""", i)
        if not (r['same12'] and r['blocks'][0]==r['blocks'][1] and not r['skipped']): lost+=1; print('  !! sb3',i,r)
        elif not r['same01']: diff.append((i,r['d']))
    print('2) ida y vuelta .sb3 sin pérdidas:', len(ids)-lost, 'de', len(ids), '| idénticos al original campo a campo:', len(ids)-lost-len(diff))
    for x in diff[:3]: print('    dif', x[0], x[1][:260])
    # 3) recorrido básico con ratón: arrastrar, ejecutar, parar, deshacer, guardar
    cons.clear(); errs.clear()
    await pg.evaluate("PQ.loadProject(PQ.defaultProject(),{noAuto:true})"); await pg.wait_for_timeout(300)
    async def drag(op, dx, dy):
        src=await pg.evaluate("(op)=>{const e=document.querySelector('#pal .block[data-op=\"'+op+'\"]');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return [r.left+14,r.top+r.height/2]}",op)
        await pg.mouse.move(*src); await pg.mouse.down(); await pg.mouse.move(src[0]+40,src[1],steps=3); await pg.mouse.move(dx,dy,steps=10); await pg.mouse.up(); await pg.wait_for_timeout(150)
    await drag('event_whenflagclicked', 520, 260)
    r=await pg.evaluate("(()=>{const r=document.querySelector('#wsin .script .block').getBoundingClientRect();return [r.left+14,r.bottom+14]})()")
    await pg.evaluate("document.querySelector('#cats .cat[data-cat=\"motion\"]').click()"); await pg.wait_for_timeout(150)
    await drag('motion_movesteps', r[0], r[1])
    await pg.click('#btnFlag'); await pg.wait_for_timeout(500); await pg.click('#btnStop'); await pg.click('#btnUndo'); await pg.wait_for_timeout(150); await pg.click('#btnRedo')
    async with pg.expect_download() as dl: await pg.click('#btnSave')
    d=await dl.value; path=await d.path(); sz=os.path.getsize(path)
    print('3) recorrido básico: bloques', await pg.evaluate("PQ.S.project.sprites[0].scripts.map(s=>s.blocks.map(b=>b.op))"), '| guardado', d.suggested_filename, sz, 'bytes | pageerrors', errs, '| console.error', cons)
    if errs or cons: bad+=1
    await b.close()
    # 4) prefers-reduced-motion: ninguna animación CSS en marcha en el recorrido
    b=await p.chromium.launch(); cx=await b.new_context(viewport={'width':1200,'height':800}, reduced_motion='reduce'); pg=await cx.new_page()
    await pg.add_init_script(STUB); await pg.goto(DIST); await pg.wait_for_timeout(600)
    n0=await pg.evaluate("document.getAnimations().length")
    await pg.evaluate("PQ.Tut.start('primer-paso')"); await pg.wait_for_timeout(300); n1=await pg.evaluate("document.getAnimations().length")
    await pg.evaluate("PQ.ui.celebrate('¡Bien!')"); await pg.wait_for_timeout(200); n2=await pg.evaluate("document.getAnimations().length"); cf=await pg.evaluate("document.querySelectorAll('.confetti').length")
    await pg.evaluate("PQ.openStories()"); await pg.wait_for_timeout(300); n3=await pg.evaluate("document.getAnimations().length")
    await pg.evaluate("PQ.RT.greenFlag()"); n4=await pg.evaluate("document.getAnimations().length")
    print('4) reduced-motion: animaciones CSS activas al arrancar/tutorial/celebración/ventana/ejecución:', [n0,n1,n2,n3,n4], '| confeti:', cf)
    if n0+n1+n2+n3+n4+cf: bad+=1
    await b.close(); await p.stop()
    print('PROBLEMAS:', bad+lost); sys.exit(1 if bad+lost else 0)
asyncio.run(main())
