import asyncio, json
from playwright.async_api import async_playwright
async def drag(pg, op, tx, ty, nth=0):
    el = pg.locator(f'#pal .block[data-op="{op}"]').nth(nth)
    await el.scroll_into_view_if_needed()
    bb = await el.bounding_box()
    await pg.mouse.move(bb['x']+14, bb['y']+bb['height']/2)
    await pg.mouse.down()
    await pg.mouse.move(bb['x']+40, bb['y']+20, steps=4)
    await pg.mouse.move(tx, ty, steps=8)
    await pg.mouse.up()
    await pg.wait_for_timeout(150)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width':1280,'height':800}, accept_downloads=True)
        pg = await ctx.new_page()
        errs=[]
        pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
        await pg.goto('file://' + __import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html')) + '')
        await pg.wait_for_timeout(800)
        ws = await pg.locator('#ws').bounding_box()
        x0,y0 = ws['x']+60, ws['y']+60
        await drag(pg,'event_whenflagclicked',x0,y0)
        # snap below hat
        await drag(pg,'motion_movesteps',x0+10,y0+60)
        await drag(pg,'looks_sayforsecs',x0+10,y0+110)
        await drag(pg,'control_repeat',x0+10,y0+160)
        n = await pg.evaluate('PQ.S.target.scripts.map(s=>s.blocks.map(b=>b.op))')
        print('scripts', n)
        await pg.screenshot(path='/tmp/shot2.png')
        # run
        x_before = await pg.evaluate('PQ.S.target.x')
        await pg.click('#btnFlag')
        await pg.wait_for_timeout(3500)
        print('x', x_before, await pg.evaluate('PQ.S.target.x'))
        # export
        async with pg.expect_download() as d:
            await pg.click('#btnSave')
        dl = await d.value
        await dl.save_as('/tmp/out.sb3'); print('saved', dl.suggested_filename)
        print('errs', errs)
        await b.close()
asyncio.run(main())
