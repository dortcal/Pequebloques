import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        for (w,h,name) in [(1280,800,'pc'),(1024,768,'ipad'),(844,390,'movil')]:
            pg = await b.new_page(viewport={'width':w,'height':h}); pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto('file://'+os.path.abspath('../dist/PequeBloques.html')); await pg.wait_for_timeout(500)
            await pg.evaluate('PQ.openExample("pc-reciclaje-infantil")'); await pg.wait_for_timeout(700)
            r = await pg.evaluate('[...document.querySelectorAll("#starthint .hint")].map(d=>{const r=d.getBoundingClientRect();return [d.textContent,Math.round(r.left),Math.round(r.top),Math.round(r.right),d.hidden]})')
            print(name, r, 'vw', w)
            await pg.screenshot(path=f'/tmp/hint_{name}.png')
            await pg.click('#btnFlag'); await pg.wait_for_timeout(300)
            print(' tras bandera:', await pg.evaluate('!!document.getElementById("starthint")'), await pg.evaluate('document.querySelectorAll(".blink").length'))
            await pg.evaluate('PQ.openExample("lagarto-goloso")'); await pg.wait_for_timeout(300)
            print(' ejemplo sin voz:', await pg.evaluate('!!document.getElementById("starthint")'))
            await pg.close()
        print('errs',errs); await b.close()
asyncio.run(main())
