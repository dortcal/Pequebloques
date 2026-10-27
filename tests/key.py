import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width':1280,'height':800}); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.goto('file://' + __import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html')) + ''); await pg.wait_for_timeout(500)
        await pg.evaluate('PQ.openExample("guagua-isla")'); await pg.wait_for_timeout(300)
        await pg.click('#btnFlag'); await pg.wait_for_timeout(200)
        x0=await pg.evaluate('PQ.S.target.x')
        await pg.keyboard.press('ArrowRight'); await pg.keyboard.press('ArrowRight'); await pg.wait_for_timeout(300)
        print('key move', x0, await pg.evaluate('PQ.S.target.x'))
        await pg.keyboard.press('Space'); await pg.wait_for_timeout(300)
        # sprite click -> lagarto example
        await pg.evaluate('PQ.openExample("lagarto-goloso")'); await pg.wait_for_timeout(300); await pg.click('#btnFlag'); await pg.wait_for_timeout(300)
        bb=await pg.locator('#stage').bounding_box()
        await pg.mouse.click(bb['x']+(70+240)/480*bb['width'], bb['y']+(180+60)/360*bb['height']); await pg.wait_for_timeout(1500)
        print('platano visible', await pg.evaluate('PQ.S.project.sprites[1].visible'))
        # level toggle + undo
        await pg.click('#btnLevel'); print('blocks lvl2', await pg.locator('#pal .block').count())
        await pg.click('#btnLevel'); print('blocks lvl1', await pg.locator('#pal .block').count())
        # new project and last
        await pg.click('#btnNew'); await pg.wait_for_timeout(200)
        print('modal', await pg.locator('.modal').count())
        await pg.locator('.modal .btn.ok').click(); await pg.wait_for_timeout(300)
        print('btnLast visible', await pg.locator('#btnLast').is_visible(), errs); await b.close()
asyncio.run(main())
