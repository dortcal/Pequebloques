import asyncio
from playwright.async_api import async_playwright
exec(open('func.py').read().split('async def main')[0])
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={'width':1280,'height':800})).new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.goto('file://' + __import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html')) + ''); await pg.wait_for_timeout(500)
        await pg.evaluate('PQ.Tut.start("primer-paso")'); await pg.wait_for_timeout(300)
        ws = await pg.locator('#ws').bounding_box(); x0,y0=ws['x']+60,ws['y']+60
        async def step(): return (await pg.inner_text('#guide')).split('\n')[0]
        print(await step())
        await drag(pg,'event_whenflagclicked',x0,y0); print(await step())
        await drag(pg,'motion_movesteps',x0+10,y0+60); print(await step())
        await pg.screenshot(path='/tmp/tut.png')
        await pg.locator('#wsin .block[data-op="motion_movesteps"] .fld.num').first.click(); await pg.wait_for_timeout(250)
        await pg.screenshot(path='/tmp/keypad.png')
        print(await pg.evaluate("Array.from(document.querySelectorAll('.keypad button, #keypad button')).map(b=>b.textContent).join('|')"))
        for k in ['1','0','0']:
            await pg.locator('.keypad button, #keypad button', has_text=k).first.click()
        await pg.keyboard.press('Enter')
        await pg.wait_for_timeout(200)
        print(await pg.evaluate('PQ.S.target.scripts[0].blocks[1].f.STEPS'), await step())
        await pg.click('#btnFlag'); await pg.wait_for_timeout(600)
        print(await step()); await pg.screenshot(path='/tmp/tut.png')
        print(errs); await b.close()
asyncio.run(main())
