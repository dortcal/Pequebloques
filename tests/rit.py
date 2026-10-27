import asyncio, os
from playwright.async_api import async_playwright
STUB = "window.__spoken=[];(function(){const synth={speaking:false,getVoices(){return [{lang:'es-ES',name:'T'}]},cancel(){},speak(u){window.__spoken.push(u.text);setTimeout(()=>u.onend&&u.onend(),250)}};Object.defineProperty(window,'speechSynthesis',{value:synth,configurable:true});window.SpeechSynthesisUtterance=function(t){this.text=t};})();"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1200,'height':800}); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
        await pg.add_init_script(STUB)
        await pg.goto('file://'+os.path.abspath('../index.html')); await pg.wait_for_timeout(500)
        await pg.evaluate('PQ.openExample("ritmo-robot")'); await pg.wait_for_timeout(300); await pg.click('#btnFlag')
        keys=['ArrowLeft','ArrowUp','ArrowDown','ArrowRight']; n=0
        for step in range(400):
            s=await pg.evaluate('PQ.S.project.sprites.filter(s=>s.name.startsWith("Flecha")).map(s=>[Math.round(s.y),s.visible])')
            d=await pg.evaluate('Object.fromEntries(PQ.S.project.vars.map(v=>[v.name,v.value]))')
            for k,(y,vis) in enumerate(s):
                if vis and -135<y<-85 and d['activo%d'%(k+1)]==1:
                    n+=1; await pg.keyboard.down(keys[k]); await pg.wait_for_timeout(90); await pg.keyboard.up(keys[k])
            await pg.wait_for_timeout(50)
            if await pg.evaluate('!PQ.RT.threads.length') and step>40: break
        d=await pg.evaluate('Object.fromEntries(PQ.S.project.vars.map(v=>[v.name,v.value]))')
        print('Puntos',d['Puntos'],'intentos',n,'pasos',step, await pg.evaluate('window.__spoken.slice(-1)[0]'), errs); await b.close()
asyncio.run(main())
