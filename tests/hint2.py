import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        pg = await b.new_page(viewport={'width':1280,'height':800}); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://'+os.path.abspath('../dist/PequeBloques.html') + '?voz=dispositivo'); await pg.wait_for_timeout(600)
        for tab,card in [('Pensamiento computacional','Misión Marte'),('Cuentos','Canario'),('Retos',None),('Juegos',None)]:
            await pg.click('#btnStories'); await pg.wait_for_timeout(300)
            await pg.get_by_role('button', name=tab, exact=True).first.click() if tab!='Cuentos' else await pg.get_by_text('Cuentos',exact=True).first.click()
            await pg.wait_for_timeout(200)
            await pg.locator('.story').first.click() if not card else await pg.locator('.story', has_text=card).first.click()
            await pg.wait_for_timeout(600)
            print(tab, 'aviso:', await pg.evaluate('!!document.querySelector("#starthint .hint")'), await pg.evaluate('document.querySelectorAll("#starthint .hint:not([hidden])").length'))
            if tab=='Pensamiento computacional': await pg.screenshot(path='/tmp/hint_ui.png')
        print(errs); await b.close()
asyncio.run(main())
