import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width':1400,'height':900}); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.goto('file://' + os.path.abspath('../index.html')); await pg.wait_for_timeout(500)
        st = lambda: pg.evaluate('PQ.S.project.sprites.map(s=>[s.name,Math.round(s.x),Math.round(s.y)])')
        await pg.evaluate('PQ.openExample("atrapa-platanos")'); await pg.wait_for_timeout(300); await pg.click('#btnFlag'); await pg.wait_for_timeout(300)
        print(await st())
        await pg.keyboard.down('ArrowRight'); await pg.wait_for_timeout(1500); await pg.keyboard.up('ArrowRight')
        print('tras 1.5 s derecha', await st())
        await pg.keyboard.down('ArrowUp'); await pg.wait_for_timeout(800); await pg.keyboard.up('ArrowUp')
        print(await st(), await pg.evaluate('JSON.stringify(PQ.S.project.vars)'))
        # mando táctil
        await pg.click('#btnPad'); box = await pg.locator('#pad .left').bounding_box()
        await pg.mouse.move(box['x']+10, box['y']+10); await pg.mouse.down(); await pg.wait_for_timeout(1000); await pg.mouse.up()
        print('mando izquierda', await st())
        # mercado y luna
        await pg.evaluate('PQ.openExample("mercado-sano")'); await pg.wait_for_timeout(300); await pg.click('#btnFlag'); await pg.wait_for_timeout(300)
        await pg.evaluate('PQ.S.project.vars.find(v=>v.name==="paso").value=1')
        await pg.keyboard.down('ArrowLeft'); await pg.wait_for_timeout(800); await pg.keyboard.up('ArrowLeft'); print('mercado', await pg.evaluate('PQ.S.project.sprites[0].x'))
        await pg.click('#btnStories'); await pg.wait_for_timeout(300); await pg.click('.tabsm button:has-text("Juegos")'); await pg.wait_for_timeout(300)
        print(await pg.evaluate('[...document.querySelectorAll(".story h3")].map(e=>e.textContent)'), errs)
        await pg.screenshot(path='/tmp/juegos.png')
        await b.close()
asyncio.run(main())
