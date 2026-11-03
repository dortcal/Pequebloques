import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width':1280,'height':800}, accept_downloads=True)
        pg = await ctx.new_page(); errs=[]
        pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
        await pg.goto('file://'+os.path.abspath('../dist/PequeBloques.html')); await pg.wait_for_timeout(700)
        ids = await pg.evaluate('PQ.EX.filter(e=>e.pc).map(e=>e.id)')
        os.makedirs('/tmp/sb3',exist_ok=True)
        for id in ids:
            await pg.evaluate(f'PQ.openExample("{id}")'); await pg.wait_for_timeout(300)
            async with pg.expect_download() as d: await pg.click('#btnSave')
            await (await d.value).save_as(f'/tmp/sb3/{id}.sb3'); print('guardado',id)
        await pg.evaluate('document.getElementById("btnStories") && document.getElementById("btnStories").click()')
        await pg.wait_for_timeout(300)
        print('errs', errs); await b.close()
asyncio.run(main())
