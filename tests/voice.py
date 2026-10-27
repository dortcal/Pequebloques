import asyncio
from playwright.async_api import async_playwright
STUB = """
window.__spoken=[];
(function(){
  const synth={speaking:false,getVoices(){return [{lang:'es-ES',name:'Test ES'},{lang:'es-MX',name:'Test MX'}]},cancel(){},speak(u){window.__spoken.push([u.text,u.pitch,u.rate]);setTimeout(()=>u.onend&&u.onend(),300)}};
  Object.defineProperty(window,'speechSynthesis',{value:synth,configurable:true});
  window.SpeechSynthesisUtterance=function(t){this.text=t};
})();
"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width':1400,'height':900}); pg = await ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.add_init_script(STUB)
        await pg.goto('file://' + __import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html')) + ''); await pg.wait_for_timeout(500)
        for i,id in enumerate(['carrera','ballena-amiga','robot-estrella']):
            await pg.evaluate(f'window.__spoken=[]; PQ.openExample("{id}")'); await pg.wait_for_timeout(300)
            await pg.click('#btnFlag'); await pg.wait_for_timeout(9000)
            sp = await pg.evaluate('window.__spoken')
            print(id, len(sp)); [print('   ',x) for x in sp]
            await pg.screenshot(path=f'/tmp/voice{i}.png')
        # ayuda
        await pg.evaluate('PQ.loadProject(PQ.defaultProject())'); await pg.wait_for_timeout(200)
        await pg.click('#btnHelp'); await pg.wait_for_timeout(300)
        print('help1', await pg.inner_text('#guide'))
        await pg.screenshot(path='/tmp/help1.png')
        await pg.click('#guide .btn:has-text("Enséñame")'); await pg.wait_for_timeout(1500); await pg.screenshot(path='/tmp/help2.png')
        await pg.click('#guide .btn:has-text("Otra pista")'); await pg.wait_for_timeout(300); print('help2', (await pg.inner_text('#guide')).split('\n')[2])
        await pg.click('#guide .btn:has-text("Cerrar")'); print('closed', await pg.evaluate("document.querySelector('#guide').hidden"))
        print(errs); await b.close()
asyncio.run(main())
