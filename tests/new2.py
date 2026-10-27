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

        async def key(k, n=1):
            for _ in range(n): await pg.keyboard.press(k); await pg.wait_for_timeout(60)
        async def shot(n): await pg.screenshot(path=f'/tmp/{n}.png', clip={'x':850,'y':170,'width':540,'height':410})
        # ---- tesoro
        await open_('tesoro-teide'); await pg.wait_for_timeout(5500); print('A1', await st(), await vars_()); await shot('A1')
        await click('Yeray'); await pg.wait_for_timeout(5500); print('A2', await st(), await vars_()); await shot('A2')
        await click('Perro'); await pg.wait_for_timeout(1200); await shot('A2b')
        await pg.wait_for_timeout(5500); print('A3', await st(), await vars_()); await shot('A3')
        await key('Space'); await pg.wait_for_timeout(4500); print('A4', await st(), await vars_()); await shot('A4')
        await click('Cofre'); await pg.wait_for_timeout(6000); print('A5', await st(), await vars_()); await shot('A5')
        await pg.wait_for_timeout(5000); await shot('A6'); print('spoken', len(await pg.evaluate('window.__spoken')))
        # ---- luna
        await open_('viaje-luna'); await pg.wait_for_timeout(5000); print('B1', await st(), await vars_()); await shot('B1')
        await click('Robot'); await pg.wait_for_timeout(5000); print('B2', await st(), await vars_()); await shot('B2')
        for i in range(3): await click('Cohete'); await pg.wait_for_timeout(900)
        await pg.wait_for_timeout(5000); print('B3', await st(), await vars_()); await shot('B3')
        for i in range(3):
            await click('Estrella'); await pg.wait_for_timeout(700)
        await pg.wait_for_timeout(9000); print('B4', await st(), await vars_()); await shot('B4')
        await key('ArrowLeft', 11); await pg.wait_for_timeout(3000); print('B5', await st(), await vars_()); await shot('B5')
        await pg.wait_for_timeout(2500); await shot('B6')
        # ---- mercado
        await open_('mercado-sano'); await pg.wait_for_timeout(3500); print('C1', await st(), await vars_()); await shot('C1')
        await key('ArrowLeft', 4); await key('ArrowUp', 5); await pg.wait_for_timeout(400); print('C2', await st()); await shot('C2')
        await pg.wait_for_timeout(2500); print('C2b', await vars_())
        await key('ArrowRight', 6); await key('ArrowDown', 1);  await pg.wait_for_timeout(400); await shot('C3'); print('C3', await st(), await vars_())
        await pg.wait_for_timeout(2500)
        await pg.evaluate('(()=>{const l=PQ.S.project.sprites.find(s=>s.name==="Lucía");l.x=130;l.y=-125})()'); await pg.wait_for_timeout(3500)
        await pg.evaluate('(()=>{const l=PQ.S.project.sprites.find(s=>s.name==="Lucía");l.x=0;l.y=-60})()'); await pg.wait_for_timeout(3000)
        await pg.evaluate('(()=>{const l=PQ.S.project.sprites.find(s=>s.name==="Lucía");l.x=-80;l.y=-85})()'); await pg.wait_for_timeout(3000)
        print('C4', await st(), await vars_()); await shot('C4')
        await pg.evaluate('(()=>{const l=PQ.S.project.sprites.find(s=>s.name==="Lucía");l.x=60;l.y=-50})()'); await pg.wait_for_timeout(3000)
        await pg.evaluate('(()=>{const l=PQ.S.project.sprites.find(s=>s.name==="Lucía");l.x=-170;l.y=-60})()'); await pg.wait_for_timeout(3500)
        print('C5', await st(), await vars_()); await shot('C5')
        await pg.evaluate('(()=>{const l=PQ.S.project.sprites.find(s=>s.name==="Lucía");l.x=150;l.y=0})()'); await pg.wait_for_timeout(4500)
        print('C6', await st(), await vars_()); await shot('C6')
        await pg.evaluate('(()=>{const l=PQ.S.project.sprites.find(s=>s.name==="Lucía");l.x=130;l.y=-70})()'); await pg.wait_for_timeout(3000); await shot('C7')
        await pg.wait_for_timeout(9000); print('C8', await st(), await vars_()); await shot('C8')
        # ---- penalti
        await open_('penalti'); await pg.wait_for_timeout(3000); print('D1', await st(), await vars_()); await shot('D1')
        for r in range(5):
            await key('ArrowLeft' if r%2 else 'ArrowRight'); await key('Space'); await pg.wait_for_timeout(700); 
            if r==0: await shot('D2')
            await pg.wait_for_timeout(2500)
            print('D', r, await st(), await vars_())
        await pg.wait_for_timeout(2500); await shot('D3'); print('spokenD', (await pg.evaluate('window.__spoken'))[-3:])
        # ---- platanos
        await open_('atrapa-platanos'); await pg.wait_for_timeout(500); await shot('E1')
        for i in range(30):
            await pg.evaluate('(()=>{const l=PQ.S.project.sprites[0],p=PQ.S.project.sprites[1];l.x=p.x;l.y=p.y})()'); await pg.wait_for_timeout(500)
        print('E', await st(), await vars_()); await shot('E2')
        print('errs', errs)
        await b.close()
asyncio.run(main())
