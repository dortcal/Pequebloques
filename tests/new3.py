import asyncio, os
from playwright.async_api import async_playwright
STUB = """
window.__spoken=[];
(function(){
  const synth={speaking:false,getVoices(){return [{lang:'es-ES',name:'Test ES'}]},cancel(){},speak(u){window.__spoken.push(u.text);setTimeout(()=>u.onend&&u.onend(),6000)}};
  Object.defineProperty(window,'speechSynthesis',{value:synth,configurable:true});
  window.SpeechSynthesisUtterance=function(t){this.text=t};
})();
"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width':1400,'height':900}); pg = await ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
        await pg.add_init_script(STUB)
        await pg.goto('file://' + os.path.abspath(os.path.join(os.path.dirname(__file__),'..','index.html'))); await pg.wait_for_timeout(500)
        async def shot(n): await pg.screenshot(path=f'/tmp/{n}.png', clip={'x':850,'y':170,'width':540,'height':410})
        async def open_(i):
            await pg.evaluate(f'PQ.openExample("{i}")'); await pg.wait_for_timeout(300); await pg.click('#btnFlag')
        await open_('tesoro-teide'); await pg.wait_for_timeout(1500); await shot('F1')
        await open_('mercado-sano'); await pg.wait_for_timeout(500)
        await pg.evaluate('PQ.RT.stopAll()'); await pg.click('#btnFlag'); await pg.wait_for_timeout(300)
        await pg.evaluate('PQ.S.project.vars.find(v=>v.name==="paso").value=1')
        await pg.evaluate('(()=>{const l=PQ.S.project.sprites[0];l.x=-170;l.y=-60})()'); await pg.wait_for_timeout(1500); await shot('F2')
        await open_('penalti'); await pg.wait_for_timeout(600); await shot('F3')
        # mando
        await pg.click('#btnPad'); await pg.wait_for_timeout(200); await shot('F4')
        print(await pg.evaluate('document.getElementById("pad").hidden'), errs)
        await b.close()
asyncio.run(main())
