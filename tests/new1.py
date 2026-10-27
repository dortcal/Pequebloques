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
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width':1400,'height':900}); pg = await ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.add_init_script(STUB)
        await pg.goto('file://' + os.path.abspath(os.path.join(os.path.dirname(__file__),'..','index.html'))); await pg.wait_for_timeout(500)
        async def st(): return await pg.evaluate('PQ.S.project.sprites.map(s=>s.name+":"+Math.round(s.x)+","+Math.round(s.y)+(s.visible?"":"(h)")).join(" | ")')
        async def vars_(): return await pg.evaluate('JSON.stringify(PQ.S.project.vars.map(v=>[v.name,v.value]))')
        async def click(n): await pg.evaluate(f'PQ.RT.spriteClicked(PQ.S.project.sprites.find(s=>s.name==="{n}"))')
        async def open_(i):
            await pg.evaluate(f'window.__spoken=[]; PQ.openExample("{i}")'); await pg.wait_for_timeout(300)
            await pg.click('#btnFlag')
        # carrera
        await open_('carrera'); await pg.wait_for_timeout(600); await pg.screenshot(path='/tmp/n_carrera0.png'); print('carrera', await st())
        await pg.wait_for_timeout(7000); await pg.screenshot(path='/tmp/n_carrera1.png')
        # robot
        await open_('robot-estrella')
        for k in range(8):
            await pg.wait_for_timeout(1500); print('robot', k, await st())
            if k in (1,4,6): await pg.screenshot(path=f'/tmp/n_robot{k}.png')
        print('errs', errs)
        await b.close()
asyncio.run(main())
