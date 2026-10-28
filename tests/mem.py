import asyncio, os, sys
from playwright.async_api import async_playwright
STUB = "window.__spoken=[];(function(){const synth={speaking:false,getVoices(){return [{lang:'es-ES',name:'T'}]},cancel(){},speak(u){window.__spoken.push(u.text);setTimeout(()=>u.onend&&u.onend(),250)}};Object.defineProperty(window,'speechSynthesis',{value:synth,configurable:true});window.SpeechSynthesisUtterance=function(t){this.text=t};})();"
FLAG = sys.argv[1]=='flag' if len(sys.argv)>1 else True
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1200,'height':800}); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.add_init_script(STUB)
        await pg.goto('file://'+os.path.abspath('../index.html')); await pg.wait_for_timeout(500)
        await pg.evaluate('PQ.openExample("memoria-canarias")'); await pg.wait_for_timeout(500)
        if FLAG: await pg.click('#btnFlag'); await pg.wait_for_timeout(int(sys.argv[2]) if len(sys.argv)>2 else 300)
        vd=lambda: pg.evaluate('Object.fromEntries(PQ.S.project.vars.map(v=>[v.name,v.value]))')
        print('antes',{k:v for k,v in (await vd()).items() if k in('bloqueo','abiertas','f1','e1')})
        # click on card 1 on stage
        box=await pg.evaluate('(()=>{const r=document.querySelector("#stagewrap canvas, #stage canvas, #stagewrap").getBoundingClientRect();return [r.left,r.top,r.width,r.height]})()')
        x=box[0]+box[2]*(240-165)/480; y=box[1]+box[3]*(180-55)/360
        await pg.mouse.click(x,y); await pg.wait_for_timeout(700)
        s=await pg.evaluate('(()=>{const s=PQ.S.project.sprites.find(s=>s.name=="Casilla 1");return JSON.stringify(Object.keys(s).filter(k=>/cost/i.test(k)).map(k=>[k,typeof s[k]=="object"?(s[k].name||s[k].length):s[k]]))})()')
        print('despues',{k:v for k,v in (await vd()).items() if k in('bloqueo','abiertas','f1','e1')},'traje',s,'hablado',await pg.evaluate('window.__spoken'),errs)
        await b.close()
asyncio.run(main())
