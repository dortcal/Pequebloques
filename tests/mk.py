import asyncio, os
from playwright.async_api import async_playwright
STUB = """window.__spoken=[];(function(){const synth={speaking:false,getVoices(){return [{lang:'es-ES',name:'T'}]},cancel(){},speak(u){window.__spoken.push([u.text,u.pitch]);setTimeout(()=>u.onend&&u.onend(),200)}};Object.defineProperty(window,'speechSynthesis',{value:synth,configurable:true});window.SpeechSynthesisUtterance=function(t){this.text=t};})();"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width':1400,'height':900}); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script(STUB)
        await pg.goto('file://' + os.path.abspath('../index.html')); await pg.wait_for_timeout(500)
        vs = lambda: pg.evaluate('JSON.stringify(PQ.S.project.vars.map(v=>[v.name,v.value]))')
        setL = lambda x,y: pg.evaluate(f'(()=>{{const l=PQ.S.project.sprites[0];l.x={x};l.y={y}}})()')
        await pg.evaluate('PQ.openExample("mercado-sano")'); await pg.wait_for_timeout(300); await pg.click('#btnFlag'); await pg.wait_for_timeout(2500)
        print('inicio', await vs())
        # recorrer el pasillo central de izquierda a derecha sin tocar nada
        for x in range(-190,191,10):
            await setL(x,-92); await pg.wait_for_timeout(60)
        await pg.wait_for_timeout(300); print('pasillo', await vs())
        # explorar de uno en uno
        for (x,y) in [(-150,-35),(-75,-150),(0,-35),(75,-150)]:
            await setL(x,y); await pg.wait_for_timeout(2500); await setL(-110,-92); await pg.wait_for_timeout(300)
        print('4 explorados', await vs(), await pg.evaluate('PQ.S.project.sprites.find(s=>s.name==="Manzana mágica").visible'))
        await setL(-110,-92); await pg.wait_for_timeout(500); await setL(150,-35); await pg.wait_for_timeout(3500)
        print('5 explorados', await vs(), await pg.evaluate('PQ.S.project.sprites.find(s=>s.name==="Manzana mágica").visible'))
        await pg.screenshot(path='/tmp/mk.png', clip={'x':850,'y':170,'width':540,'height':410})
        print(errs); await b.close()
asyncio.run(main())
