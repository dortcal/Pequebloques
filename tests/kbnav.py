"""Fase 3 · teclado en el área de programación: recorrer, coger, mover, soltar, cancelar, borrar; anuncios aria-live."""
import asyncio, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from playwright.async_api import async_playwright
from pchelp import STUB
SP='/tmp/claude-0/-home-claude/ca5a60ab-d678-5fd1-82c1-780dbf3d7572/scratchpad/'
async def main():
    p=await async_playwright().start(); b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1200,'height':800}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script(STUB)
    await pg.goto('file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','index.html'))+'?voz=dispositivo'); await pg.wait_for_timeout(600)
    await pg.evaluate('document.querySelectorAll(".toast").forEach(t=>t.remove())')
    await pg.evaluate("""()=>{const p=PQ.S.project,t=p.sprites[0];const mk=(op,f)=>PQ.mkBlock(op,f||null,{project:p,target:t});
      const rp=mk('control_repeat');rp.sub.push(mk('motion_turnright'),mk('looks_nextcostume'));
      t.scripts=[{x:40,y:40,blocks:[mk('event_whenflagclicked'),mk('motion_movesteps'),rp,mk('looks_sayforsecs')]},{x:40,y:330,blocks:[mk('event_whenthisspriteclicked'),mk('sound_play')]}];PQ.ed.refreshAll()}""")
    live=lambda: pg.evaluate("document.querySelector('#wslive').textContent")
    ops=lambda: pg.evaluate("JSON.stringify(PQ.S.project.sprites[0].scripts.map(s=>(function w(a){return a.map(b=>b.op.split('_')[1]+(b.sub?'['+w(b.sub)+']':''))})(s.blocks)))")
    sel=lambda: pg.evaluate("(()=>{const e=document.querySelector('#wsin .block.sel');return e?e.dataset.op:null})()")
    async def key(k): await pg.keyboard.press(k); await pg.wait_for_timeout(90)
    # llegar con el tabulador hasta el área
    await pg.evaluate("document.querySelector('#pal').setAttribute('tabindex','-1')")
    for i in range(80):
        await pg.keyboard.press('Tab')
        if await pg.evaluate("document.activeElement && document.activeElement.id==='ws'"): break
    print('foco en ws tras', i+1, 'tabuladores; nav:', await pg.evaluate("document.querySelector('#ws').classList.contains('kbnav')"))
    await pg.wait_for_timeout(100); print(' >', await live())
    for k in ['ArrowDown','ArrowDown','ArrowDown','ArrowDown','ArrowRight','ArrowLeft','End','Home']:
        await key(k); print('  ',k,'→',await sel(),'|',await live())
    x0=await pg.evaluate('PQ.S.project.sprites[0].x')
    # coger «mover» y bajarlo dos sitios
    await key('ArrowDown'); await key('Enter'); print('  coger →', await live())
    await pg.screenshot(path=SP+'p3_kb.png')
    await key('ArrowDown'); print('   ↓', await live(), await ops())
    await key('ArrowDown'); print('   ↓', await live(), await ops())
    await key('Enter'); print('  soltar →', await live(), await ops())
    await key('Enter'); await key('ArrowUp'); await key('Escape'); print('  coger, subir, Escape →', await live(), await ops())
    await pg.keyboard.press('Control+z'); await pg.wait_for_timeout(100); print('  deshacer →', await ops())
    # sombrero: no se mueve
    await key('Home'); await key('Enter'); print('  sombrero →', await live())
    # borrar
    await key('End'); await key('Delete'); print('  borrar →', await live(), await ops())
    # las flechas no han movido al personaje ni han lanzado teclas del escenario
    print('  x del canario sin cambios:', x0==await pg.evaluate('PQ.S.project.sprites[0].x'), '| teclas escenario:', await pg.evaluate('JSON.stringify(PQ.RT.keys)'))
    await key('Escape'); print('  Escape → foco fuera:', await pg.evaluate("document.activeElement.id!=='ws'"))
    # con ratón: clic en el área y flechas → siguen siendo teclas del escenario
    await pg.mouse.click(600,500); await pg.keyboard.down('ArrowRight'); k=await pg.evaluate('JSON.stringify(PQ.RT.keys)'); await pg.keyboard.up('ArrowRight')
    print('  tras clic con ratón, flecha → tecla de escenario:', k, '| nav:', await pg.evaluate("document.querySelector('#ws').classList.contains('kbnav')"))
    print('errs', errs)
    await b.close(); await p.stop()
asyncio.run(main())
