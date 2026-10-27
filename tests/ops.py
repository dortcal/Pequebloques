import asyncio
from playwright.async_api import async_playwright
exec(open('func.py').read().split('async def main')[0])
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width':1400,'height':900}, accept_downloads=True); pg = await ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.goto('file://' + __import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html')) + ''); await pg.wait_for_timeout(500)
        await pg.click('#btnLevel'); await pg.wait_for_timeout(200)
        print('cats', await pg.evaluate("[...document.querySelectorAll('#cats .cat')].map(c=>c.textContent)"))
        await pg.locator('.mkvar').click(); await pg.wait_for_timeout(200)
        await pg.fill('.modal input.big','puntos'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(300)
        print('vars', await pg.evaluate('PQ.S.project.vars'))
        ws = await pg.locator('#ws').bounding_box(); x0,y0=ws['x']+60,ws['y']+60
        await drag(pg,'event_whenflagclicked',x0,y0)
        await drag(pg,'data_setvariableto',x0+10,y0+60)
        await drag(pg,'looks_sayforsecs',x0+10,y0+110)
        # operator into say message slot
        slot = pg.locator('#wsin .block[data-op="looks_sayforsecs"] .islot').first
        sb = await slot.bounding_box()
        await drag(pg,'operator_add',sb['x']+8,sb['y']+sb['height']/2)
        await drag(pg,'data_variable',0,0) if False else None
        print(await pg.evaluate("JSON.stringify(PQ.S.target.scripts[0].blocks.map(b=>[b.op,b.in&&Object.keys(b.in)]))"))
        await pg.screenshot(path='/tmp/ops1.png')
        # fill in the add: set NUM1 via model for speed, then run
        await pg.evaluate("(()=>{const sb=PQ.S.target.scripts[0].blocks[2]; sb.in.MESSAGE.f.NUM1=3; sb.in.MESSAGE.f.NUM2=4; const v=PQ.S.target.scripts[0].blocks[1]; v.f.VALUE='7'; ; PQ.ed.renderWorkspace();})()")
        await pg.click('#btnFlag'); await pg.wait_for_timeout(700)
        print('bubble', await pg.evaluate("PQ.S.target._say && PQ.S.target._say.text"), await pg.evaluate('PQ.S.project.vars'))
        async with pg.expect_download() as d: await pg.click('#btnSave')
        await (await d.value).save_as('/tmp/ops.sb3')
        # re-import
        await pg.set_input_files('#fileOpen','/tmp/ops.sb3'); await pg.wait_for_timeout(1000)
        print('reimport', await pg.evaluate("JSON.stringify(PQ.S.project.sprites[0].scripts[0].blocks.map(b=>[b.op,b.in&&b.in.MESSAGE&&b.in.MESSAGE.op,b.f.VARIABLE,b.f.VALUE]))"), await pg.evaluate('PQ.S.project.vars'))
        print(errs); await b.close()
asyncio.run(main())
