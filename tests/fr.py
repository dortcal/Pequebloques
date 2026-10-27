import asyncio, os
from playwright.async_api import async_playwright
STUB = """window.__spoken=[];(function(){const synth={speaking:false,getVoices(){return [{lang:'es-ES',name:'T'}]},cancel(){},speak(u){window.__spoken.push(u.text);setTimeout(()=>u.onend&&u.onend(),1500)}};Object.defineProperty(window,'speechSynthesis',{value:synth,configurable:true});window.SpeechSynthesisUtterance=function(t){this.text=t};})();"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width':1400,'height':900}); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script(STUB)
        await pg.goto('file://' + os.path.abspath('../index.html')); await pg.wait_for_timeout(500)
        await pg.click('#btnStories'); await pg.wait_for_timeout(300)
        for t in ['Cuentos con voz','Cuentos','Juegos']:
            await pg.click(f'.tabsm button:has-text("{t}")'); await pg.wait_for_timeout(200)
            print(t, await pg.evaluate('[...document.querySelectorAll(".story h3")].map(e=>e.textContent)'))
        await pg.screenshot(path='/tmp/tabs.png')
        await pg.keyboard.press('Escape'); await pg.click('.modal .btn:has-text("Cerrar")') if await pg.locator('.modal .btn:has-text("Cerrar")').count() else None
        await pg.evaluate('PQ.openExample("frutas-si")'); await pg.wait_for_timeout(300); await pg.click('#btnFlag'); await pg.wait_for_timeout(300)
        for i in range(60):
            await pg.evaluate('(()=>{const P=PQ.S.project;const l=P.sprites[0];const m=P.sprites[2];l.x=m.x;l.y=m.y})()'); await pg.wait_for_timeout(200)
            if await pg.evaluate('PQ.S.project.vars[0].value')>=20: break
        print('puntos', await pg.evaluate('JSON.stringify(PQ.S.project.vars.map(v=>[v.name,v.value]))'))
        await pg.wait_for_timeout(1800); await pg.screenshot(path='/tmp/premio.png', clip={'x':850,'y':170,'width':540,'height':410})
        await pg.wait_for_timeout(3500); print((await pg.evaluate('window.__spoken'))[-1], await pg.evaluate('PQ.RT.threads.length'), errs)
        await b.close()
asyncio.run(main())
