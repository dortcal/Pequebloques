import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width':1400,'height':900}, accept_downloads=True); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.goto('file://' + os.path.abspath('../index.html')); await pg.wait_for_timeout(500)
        ops = "PQ.S.target.scripts.map(s=>s.blocks.map(b=>b.op.replace(/^[a-z]+_/,'')).join(','))"
        await pg.evaluate('PQ.openExample("canario-viajero")'); await pg.wait_for_timeout(400)
        print('ini', await pg.evaluate(ops))
        # seleccionar el 2.º bloque del primer script (clic real) y borrar solo ese
        el = pg.locator('#wsin .script').first.locator('.block').nth(1)
        await el.click(position={'x':8,'y':8}); await pg.wait_for_timeout(300)
        print('sel', await pg.evaluate("document.querySelectorAll('#wsin .block.sel').length"))
        await pg.keyboard.press('Delete'); await pg.wait_for_timeout(300)
        print('tras Supr', await pg.evaluate(ops))
        el = pg.locator('#wsin .script').first.locator('.block').nth(1)
        await el.click(position={'x':8,'y':8}); await pg.keyboard.press('Shift+Delete'); await pg.wait_for_timeout(300)
        print('tras Mayús+Supr', await pg.evaluate(ops))
        await pg.keyboard.press('Control+z'); await pg.wait_for_timeout(300); print('undo', await pg.evaluate(ops))
        # evento escenario
        await pg.evaluate('PQ.selectTarget(PQ.S.project.stage)'); await pg.wait_for_timeout(300)
        print('palette stage', await pg.evaluate("[...document.querySelectorAll('#pal .block')].some(e=>e._b&&e._b.op==='event_whenstageclicked')"))
        await pg.evaluate('''(()=>{const P=PQ.S.project; const st=P.stage;
          st.scripts=[{x:20,y:20,blocks:[PQ.mkBlock('event_whenstageclicked'),PQ.mkBlock('event_broadcast',{BROADCAST_INPUT:'mensaje1'})]}];
          const s=P.sprites[0]; s.scripts=[{x:20,y:20,blocks:[PQ.mkBlock('event_whenbroadcastreceived',{BROADCAST_OPTION:'mensaje1'}),PQ.mkBlock('motion_gotoxy',{X:77,Y:55})]}]; P.messages=['mensaje1']; PQ.RT.setProject(P);})()''')
        box = await pg.locator('#stage').bounding_box()
        await pg.mouse.click(box['x']+box['width']*0.5, box['y']+box['height']*0.08); await pg.wait_for_timeout(600)
        print('stage click ->', await pg.evaluate('[PQ.S.project.sprites[0].x,PQ.S.project.sprites[0].y]'))
        await pg.evaluate('PQ.selectTarget(PQ.S.project.sprites[0])'); await pg.wait_for_timeout(300)
        print('palette sprite has it', await pg.evaluate("[...document.querySelectorAll('#pal .block')].some(e=>e._b&&e._b.op==='event_whenstageclicked')"))
        # exportar y validar
        await pg.evaluate('PQ.selectTarget(PQ.S.project.stage)')
        async with pg.expect_download() as d: await pg.click('#btnSave')
        await (await d.value).save_as('/tmp/stageclick.sb3'); print(errs)
        await b.close()
asyncio.run(main())
