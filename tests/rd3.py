import asyncio, os
from playwright.async_api import async_playwright
from pchelp import STUB
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1200,'height':800}); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.add_init_script(STUB)
        await pg.goto('file://'+os.path.abspath('../dist/PequeBloques.html')); await pg.wait_for_timeout(600)
        await pg.evaluate('PQ.openExample("pc-cole-primaria")'); await pg.wait_for_timeout(300)
        await pg.click('#btnFlag'); await pg.wait_for_timeout(5000)
        print('log',await pg.evaluate('PQ._log'), 'last', await pg.evaluate('PQ._lastUtter&&PQ._lastUtter.engine'))
        await pg.click('#readbtn'); await pg.wait_for_timeout(700)
        print('panel:',await pg.evaluate('document.querySelector("#readpanel .rtxt").textContent'))
        print(errs); await b.close()
asyncio.run(main())
