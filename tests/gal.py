import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width':1280,'height':900}); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.goto('file://' + os.path.abspath('../dist/PequeBloques.html')); await pg.wait_for_timeout(600)
        await pg.click('#btnStories'); await pg.wait_for_timeout(500)
        print(await pg.evaluate('document.querySelectorAll(".modal .card, .modal [class*=card]").length'))
        await pg.screenshot(path='/tmp/gallery.png', full_page=False)
        await pg.evaluate('PQ.openExample("penalti")'); await pg.wait_for_timeout(500)
        print(await pg.evaluate('PQ.S.project.title'), errs)
        await b.close()
asyncio.run(main())
