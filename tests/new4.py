import asyncio, os
from playwright.async_api import async_playwright
STUB = """
window.__spoken=[];
(function(){
  const synth={speaking:false,getVoices(){return [{lang:'es-ES',name:'Test ES'}]},cancel(){},speak(u){window.__spoken.push(u.text);setTimeout(()=>u.onend&&u.onend(),250)}};
  Object.defineProperty(window,'speechSynthesis',{value:synth,configurable:true});
  window.SpeechSynthesisUtterance=function(t){this.text=t};
})();
"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width':1400,'height':900}); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.add_init_script(STUB)
        await pg.goto('file://' + os.path.abspath('../index.html')); await pg.wait_for_timeout(500)
        st = lambda: pg.evaluate('PQ.S.project.sprites.map(s=>s.name+":"+Math.round(s.x)+","+Math.round(s.y)+","+Math.round(s.size)+(s.visible?"":"(h)")).join(" | ")')
        vs = lambda: pg.evaluate('JSON.stringify(PQ.S.project.vars.map(v=>[v.name,v.value]))')
        async def click(n): await pg.evaluate(f'PQ.RT.spriteClicked(PQ.S.project.sprites.find(s=>s.name==="{n}"))')
        async def shot(n): await pg.screenshot(path=f'/tmp/{n}.png', clip={'x':850,'y':170,'width':540,'height':410})
        async def open_(i): await pg.evaluate(f'PQ.openExample("{i}")'); await pg.wait_for_timeout(300); await pg.click('#btnFlag')
        # rescate
        await open_('rescate-mar'); await pg.wait_for_timeout(4500); print('R1', await st(), await vs()); await shot('R1')
        for i in range(3): await click('Botella'); await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(4500); print('R2', await st(), await vs()); await shot('R2')
        await click('Tortuga'); await pg.wait_for_timeout(2500); await shot('R3')
        await pg.wait_for_timeout(6000); print('R4', await st(), await vs()); await shot('R4')
        # huerto
        await open_('huerto-lucia'); await pg.wait_for_timeout(4000); print('H1', await st(), await vs()); await shot('H1')
        await click('Semilla'); await pg.wait_for_timeout(3000); print('H2', await st(), await vs())
        for i in range(3): await click('Vaso de agua'); await pg.wait_for_timeout(700)
        await pg.wait_for_timeout(3000); await shot('H3'); print('H3', await st(), await vs())
        await click('Sol'); await pg.wait_for_timeout(3500); print('H4', await st(), await vs()); await shot('H4')
        await click('Zanahoria'); await pg.wait_for_timeout(5000); print('H5', await st(), await vs()); await shot('H5')
        # frutas
        await open_('frutas-si'); await pg.wait_for_timeout(1500); await shot('G1')
        await pg.keyboard.down('ArrowLeft'); await pg.wait_for_timeout(1200); await pg.keyboard.up('ArrowLeft')
        print('G', await st(), await vs())
        # simular: forzar puntos y comprobar fin
        for i in range(25):
            await pg.evaluate('(()=>{const P=PQ.S.project;const l=P.sprites[0];const m=P.sprites[1];l.x=m.x;l.y=m.y})()'); await pg.wait_for_timeout(250)
        print('G fin', await vs(), (await pg.evaluate('window.__spoken'))[-1:])
        await shot('G2')
        # pez
        await open_('atrapa-pez'); await pg.wait_for_timeout(800)
        for i in range(4): await click('Pez'); await pg.wait_for_timeout(200)
        await pg.wait_for_timeout(1000); await shot('P1'); print('P', await vs())
        await pg.wait_for_timeout(20500); print('P fin', await vs(), (await pg.evaluate('window.__spoken'))[-1:])
        print(errs); await b.close()
asyncio.run(main())
