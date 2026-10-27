import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width':1280,'height':800}, accept_downloads=True)
        pg = await ctx.new_page(); errs=[]
        pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
        await pg.goto('file://' + __import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html')) + ''); await pg.wait_for_timeout(600)
        ids = await pg.evaluate('PQ.EX.map(e=>e.id)')
        for i,id in enumerate(ids):
            await pg.evaluate(f'PQ.openExample("{id}")'); await pg.wait_for_timeout(300)
            await pg.click('#btnFlag'); await pg.wait_for_timeout(2500)
            await pg.screenshot(path=f'/tmp/ex{i}.png')
            async with pg.expect_download() as d: await pg.click('#btnSave')
            await (await d.value).save_as(f'/tmp/ex{i}.sb3')
            print(id, await pg.evaluate('PQ.S.project.sprites.map(s=>[s.name,Math.round(s.x),Math.round(s.y),s.current])'))
        # tutorials
        for tid in ['primer-paso','habla-gira','anima-canario']:
            await pg.evaluate(f'PQ.Tut.start("{tid}")'); await pg.wait_for_timeout(300)
            print(tid, await pg.inner_text('#guide'))
        await pg.screenshot(path='/tmp/tut.png')
        print('errs', errs); await b.close()
asyncio.run(main())
