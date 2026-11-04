import asyncio, os, json
from playwright.async_api import async_playwright
STUB = '''
(()=>{ window.__u=[]; const mk=(n,l)=>({name:n,lang:l,voiceURI:n,default:false,localService:true});
 const V = window.__VOICES = JSON.parse(localStorage.getItem('__v')||'[]').map(x=>mk(x[0],x[1]));
 class U{constructor(t){this.text=t;this.pitch=1;this.rate=1;this.voice=null;this.lang='';}}
 window.SpeechSynthesisUtterance=U;
 const s={speaking:false,pending:false,getVoices:()=>V,cancel(){},speak(u){window.__u.push([u.text,u.pitch.toFixed(2),u.rate.toFixed(2),u.voice&&u.voice.name]);setTimeout(()=>u.onend&&u.onend(),120);}};
 Object.defineProperty(window,'speechSynthesis',{value:s,configurable:true});
})();'''
async def run(b, voices, label):
    ctx = await b.new_context(viewport={'width':1100,'height':800})
    await ctx.add_init_script("localStorage.setItem('__v', %s)" % json.dumps(json.dumps(voices)))
    await ctx.add_init_script(STUB)
    pg = await ctx.new_page(); errs=[]
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.goto('file://'+os.path.abspath('../dist/PequeBloques.html')); await pg.wait_for_timeout(500)
    res = await pg.evaluate('''()=>{ const out={}; PQ.utter('Hola',"KITTEN");
      const f=(k,t)=>{PQ.utter(t||'Hola',k); return PQ._lastUtter;};
      ['KITTEN','ALTO','TENOR','SQUEAK','GIANT'].forEach(k=>out[k]=f(k)); out.Lagarto=f('SQUEAK','Lagarto'); out.Canario=f('SQUEAK','Canario'); out.Mariposa=f('SQUEAK','Mariposa');
      out.def=['Lucía','Yeray','Robot','Ballena','Cangrejo','Pez','Casilla 1','Estrella'].map(n=>n+'='+PQ.defaultVoice({name:n})).join(' '); return out; }''')
    print('==',label); [print(' ',k,res[k]) for k in res]; print(' errs',errs); await ctx.close()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        await run(b, [['Google español','es-ES'],['Microsoft Pablo - Spanish (Spain)','es-ES'],['Microsoft Helena - Spanish (Spain)','es-ES']], 'Windows/Chrome con voz F y M')
        await run(b, [['Google español','es-ES']], 'una sola voz (Google español)')
        await run(b, [['Jorge','es-ES'],['Diego','es-AR']], 'solo voces masculinas')
        await run(b, [], 'sin voces es')
        await b.close()
asyncio.run(main())
