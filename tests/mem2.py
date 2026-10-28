import asyncio, os, time
from playwright.async_api import async_playwright
STUB = "window.__spoken=[];(function(){const synth={speaking:false,pending:false,getVoices(){return [{lang:'es-ES',name:'T'}]},cancel(){},speak(u){window.__spoken.push([u.text,u.pitch]);setTimeout(()=>u.onend&&u.onend(),600)}};Object.defineProperty(window,'speechSynthesis',{value:synth,configurable:true});window.SpeechSynthesisUtterance=function(t){this.text=t};})();"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1200,'height':800}); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.add_init_script(STUB)
        await pg.goto('file://'+os.path.abspath('../index.html')); await pg.wait_for_timeout(500)
        await pg.evaluate('PQ.openExample("memoria-canarias")'); await pg.wait_for_timeout(500)
        vd=lambda: pg.evaluate('Object.fromEntries(PQ.S.project.vars.map(v=>[v.name,v.value]))')
        box=await pg.evaluate('(()=>{const r=document.querySelector("#stagewrap").getBoundingClientRect();return [r.left,r.top,r.width,r.height]})()')
        pos=lambda i:(box[0]+box[2]*(240+[-165,-55,55,165][i%4])/480, box[1]+box[3]*(180-[55,-55][i//4])/360)
        await pg.click('#btnFlag'); await pg.wait_for_timeout(1500)
        d=await vd(); f=[d['f%d'%i] for i in range(1,9)]; print('f',f)
        # primera y segunda distintas
        j=next(i for i in range(1,8) if f[i]!=f[0])
        await pg.mouse.click(*pos(0)); await pg.wait_for_timeout(150)
        t=time.time(); await pg.mouse.click(*pos(j))
        while (await vd())['bloqueo']==1 and time.time()-t<6: await pg.wait_for_timeout(30)
        print('fallo: desbloqueo en %.2fs'%(time.time()-t), 'e', [ (await vd())['e%d'%(i+1)] for i in (0,j)])
        await pg.wait_for_timeout(300)
        k=next(i for i in range(1,8) if f[i]==f[0])
        await pg.mouse.click(*pos(0)); await pg.wait_for_timeout(150)
        t=time.time(); await pg.mouse.click(*pos(k))
        while (await vd())['bloqueo']==1 and time.time()-t<6: await pg.wait_for_timeout(30)
        print('pareja: desbloqueo en %.2fs'%(time.time()-t),(await vd())['Parejas'])
        print(await pg.evaluate('window.__spoken'),errs); await b.close()
asyncio.run(main())
