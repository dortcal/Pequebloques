import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width':1280,'height':800}, accept_downloads=True)
        pg = await ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.goto('file://' + __import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html')) + ''); await pg.wait_for_timeout(500)
        # import roundtrip
        await pg.set_input_files('#fileOpen','/tmp/ex2.sb3'); await pg.wait_for_timeout(1200)
        print('import', await pg.evaluate('[PQ.S.project.sprites.map(s=>s.name+":"+s.scripts.length), PQ.S.project.stage.costumes.length, PQ.S.project.messages]'))
        await pg.screenshot(path='/tmp/imp.png')
        # run imported
        await pg.click('#btnFlag'); await pg.wait_for_timeout(2500)
        print('pez x', await pg.evaluate('PQ.S.project.sprites[0].x'))
        # stories modal
        await pg.click('#btnStories'); await pg.wait_for_timeout(400)
        await pg.screenshot(path='/tmp/stories.png')
        await pg.keyboard.press('Escape')
        # costumes tab
        await pg.click('#tabbtn-cost'); await pg.wait_for_timeout(300); await pg.screenshot(path='/tmp/cost.png')
        await pg.click('#pane-cost .editcol .btn.yel'); await pg.wait_for_timeout(400)
        cv = await pg.locator('#paintCv').bounding_box()
        await pg.mouse.move(cv['x']+60,cv['y']+60); await pg.mouse.down(); await pg.mouse.move(cv['x']+160,cv['y']+120,steps=6); await pg.mouse.up()
        await pg.screenshot(path='/tmp/paint.png')
        await pg.locator('.modal .mf .btn.ok').click(); await pg.wait_for_timeout(400)
        print('costume fmt', await pg.evaluate('PQ.S.target.costumes.map(c=>c.fmt)'))
        await pg.click('#tabbtn-sound'); await pg.wait_for_timeout(300); await pg.screenshot(path='/tmp/snd.png')
        # add sprite via library
        await pg.click('#tabbtn-code'); await pg.click('#btnAddSprite'); await pg.click('.ctxmenu button >> nth=0'); await pg.wait_for_timeout(300)
        await pg.screenshot(path='/tmp/lib.png')
        await pg.locator('.modal .card').nth(3).click(); await pg.wait_for_timeout(300)
        print('sprites', await pg.evaluate('PQ.S.project.sprites.map(s=>s.name)'))
        # export again & reimport count
        async with pg.expect_download() as d: await pg.click('#btnSave')
        await (await d.value).save_as('/tmp/rt.sb3')
        # mobile
        await pg.set_viewport_size({'width':390,'height':800}); await pg.wait_for_timeout(400); await pg.screenshot(path='/tmp/mob.png')
        await pg.set_viewport_size({'width':820,'height':1100}); await pg.wait_for_timeout(400); await pg.screenshot(path='/tmp/tab.png')
        print(errs); await b.close()
asyncio.run(main())
