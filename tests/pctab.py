import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width':1280,'height':800}); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://'+os.path.abspath('../dist/PequeBloques.html') + '?voz=dispositivo'); await pg.wait_for_timeout(700)
        await pg.click('#btnStories'); await pg.wait_for_timeout(400)
        await pg.get_by_text('Pensamiento computacional').first.click(); await pg.wait_for_timeout(400)
        await pg.screenshot(path='/tmp/pctab.png'); print(await pg.evaluate('document.querySelectorAll(".story").length'), errs)
        await b.close()
asyncio.run(main())
