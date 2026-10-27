import asyncio, os, json
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
        st = lambda: pg.evaluate('PQ.S.project.sprites.map(s=>s.name+":"+Math.round(s.x)+","+Math.round(s.y)+(s.visible?"":"(h)")).join(" | ")')
        vs = lambda: pg.evaluate('JSON.stringify(PQ.S.project.vars.filter(v=>!/^[ef]\\d$/.test(v.name)).map(v=>[v.name,v.value]))')
        vd = lambda: pg.evaluate('Object.fromEntries(PQ.S.project.vars.map(v=>[v.name,v.value]))')
        sp = lambda: pg.evaluate('window.__spoken.splice(0).join(" / ")')
        async def click(n): await pg.evaluate(f'PQ.RT.spriteClicked(PQ.S.project.sprites.find(s=>s.name==="{n}"))')
        async def shot(n): await pg.screenshot(path=f'/tmp/{n}.png', clip={'x':850,'y':170,'width':540,'height':410})
        async def open_(i): await pg.evaluate(f'PQ.openExample("{i}")'); await pg.wait_for_timeout(300); await pg.click('#btnFlag')
        # ---------- laurisilva ----------
        await open_('secreto-laurisilva'); await pg.wait_for_timeout(1500); await click('Paloma'); await pg.wait_for_timeout(300)
        print('L0 (clic antes de tiempo, no debe contar)', await vs())
        await pg.wait_for_timeout(5500); print('L1', await st(), await vs()); await shot('L1'); print(await sp())
        await click('Paloma'); await pg.wait_for_timeout(300); await click('Canario'); await pg.wait_for_timeout(900)
        print('L1b (ocupado: Canario no cuenta aún)', await vs())
        await pg.wait_for_timeout(600)
        for n in ['Canario','Mariposa','Lagarto']:
            await click(n); await pg.wait_for_timeout(1200)
        await click('Paloma'); await pg.wait_for_timeout(900)
        print('L2', await vs()); await pg.wait_for_timeout(5000); print('L3', await st(), await vs()); await shot('L3')
        await click('Botella'); await pg.wait_for_timeout(3000); print('L4', await st(), await vs()); await shot('L4')
        await click('Contenedor azul'); await pg.wait_for_timeout(1500); print('L5 azul', await vs(), await sp())
        await click('Contenedor amarillo'); await pg.wait_for_timeout(2000); print('L6', await st(), await vs()); await shot('L6')
        await pg.wait_for_timeout(9000); print('L7', await st(), await vs()); await shot('L7'); print(await sp())
        # ---------- memoria ----------
        await open_('memoria-canarias'); await pg.wait_for_timeout(3500); d = await vd(); print('M0', d['bloqueo'], [d['f%d'%i] for i in range(1,9)])
        f = [d['f%d'%i] for i in range(1,9)]
        i = 0; j = next(k for k in range(8) if f[k] != f[0])
        await click('Casilla %d'%(i+1)); await pg.wait_for_timeout(700); await click('Casilla %d'%(j+1)); await pg.wait_for_timeout(700); await shot('M1')
        await click('Casilla 3'); await pg.wait_for_timeout(100)
        await pg.wait_for_timeout(2500); d = await vd(); print('M2 tras fallo', d['bloqueo'], d['abiertas'], [d['e%d'%i] for i in range(1,9)], await pg.evaluate('PQ.S.project.sprites.filter(s=>s.name.startsWith("Casilla")).map(s=>s.current)'))
        for face in [1,2,3,4]:
            a,b2 = [k for k in range(8) if f[k]==face]
            await click('Casilla %d'%(a+1)); await pg.wait_for_timeout(700); await click('Casilla %d'%(b2+1)); await pg.wait_for_timeout(1800)
            if face==2: await shot('M3')
            d = await vd(); print('M face', face, 'Parejas', d['Parejas'], 'bloqueo', d['bloqueo'])
        await pg.wait_for_timeout(3000); await shot('M4'); print('M fin', await st(), await sp())
        # ---------- ritmo ----------
        await open_('ritmo-robot'); await pg.wait_for_timeout(1500); await shot('R0')
        keys = ['ArrowLeft','ArrowUp','ArrowDown','ArrowRight']
        names = ['Flecha izquierda','Flecha arriba','Flecha abajo','Flecha derecha']
        shots = 0; n=0
        for step in range(300):
            s = await pg.evaluate('PQ.S.project.sprites.filter(s=>s.name.startsWith("Flecha")).map(s=>[Math.round(s.y), s.visible])')
            v = await vd()
            for k,(y,vis) in enumerate(s):
                if vis and -135 < y < -85 and v['activo%d'%(k+1)] == 1:
                    n+=1
                    if n % 5 == 0: await click(names[k])
                    else:
                        await pg.keyboard.down(keys[k]); await pg.wait_for_timeout(90); await pg.keyboard.up(keys[k])
            if step == 60 and not shots: await shot('R1'); shots=1
            await pg.wait_for_timeout(60)
            if await pg.evaluate('!PQ.RT.running && !PQ.RT.threads.length'): break
        d = await vd(); print('R fin', d['Puntos'], 'intentos', n, await st(), await sp()); await shot('R2')
        await pg.wait_for_timeout(1500); await shot('R3')
        print('errs', errs); await b.close()
asyncio.run(main())
