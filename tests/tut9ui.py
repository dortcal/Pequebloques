import asyncio, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from playwright.async_api import async_playwright
from pchelp import STUB
async def main():
    p=await async_playwright().start(); b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1200,'height':800}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script(STUB)
    await pg.goto('file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','index.html'))+'?voz=dispositivo'); await pg.wait_for_timeout(600)
    await pg.evaluate('document.querySelectorAll(".toast").forEach(t=>t.remove())')
    await pg.evaluate("PQ.openStories('tut')"); await pg.wait_for_timeout(500)
    await pg.screenshot(path='/tmp/tut_list.png')
    n=await pg.evaluate("document.querySelectorAll('.story').length"); print('tarjetas', n)
    # empezar «variables» desde la lista (clic real en la tarjeta)
    cards=await pg.query_selector_all('.story h3')
    for c in cards:
        if (await c.inner_text())=='Cuenta puntos': await c.click(); break
    await pg.wait_for_timeout(700)
    print(await pg.evaluate("document.querySelector('#guide .gs').textContent"), await pg.evaluate("document.querySelectorAll('.pulse-ui').length"), await pg.evaluate("document.querySelector('#levelLabel').textContent"))
    await pg.screenshot(path='/tmp/tut_var1.png')
    await pg.click('.mkvar'); await pg.wait_for_timeout(300)
    await pg.keyboard.press('Control+A'); await pg.keyboard.type('puntos'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(1000)
    print(await pg.evaluate("document.querySelector('#guide .gs').textContent"))
    await pg.screenshot(path='/tmp/tut_var2.png')
    print('errs',errs)
    await b.close(); await p.stop()
asyncio.run(main())
