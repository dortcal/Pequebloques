import asyncio, os, json
from playwright.async_api import async_playwright
STUB = '''
(()=>{ window.__log=[]; const V=[{name:'Microsoft Helena - Spanish (Spain)',lang:'es-ES'},{name:'Microsoft Pablo - Spanish (Spain)',lang:'es-ES'}];
 class U{constructor(t){this.text=t;this.pitch=1;this.rate=1;this.volume=1;this.voice=null;this.lang='';}}
 window.SpeechSynthesisUtterance=U;
 let q=[],cur=null;
 const next=()=>{ if(cur||!q.length)return; cur=q.shift(); const u=cur; window.__log.push([Math.round(performance.now()),u.text,+u.pitch.toFixed(2),+u.rate.toFixed(2),+u.volume.toFixed(2),u.voice&&u.voice.name.split(' ')[1]]);
   u._t=setTimeout(()=>{cur=null; u.onend&&u.onend({}); next();}, 120+u.text.length*12); };
 const s={get speaking(){return !!cur},get pending(){return q.length>0},getVoices:()=>V,
   cancel(){ q=[]; if(cur){clearTimeout(cur._t); const u=cur; cur=null; u.onerror&&u.onerror({error:'canceled'});} },
   speak(u){q.push(u); next();}};
 Object.defineProperty(window,'speechSynthesis',{value:s,configurable:true});
})();'''
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width':1100,'height':800})
        await ctx.add_init_script(STUB)
        pg = await ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://'+os.path.abspath('../dist/PequeBloques.html')); await pg.wait_for_timeout(500)
        # 1) reproducción secuencial completa con pausas
        await pg.evaluate("window.__log=[]; window.__h=PQ.utter('¡Increíble! Lo has conseguido. ¿Estás preparado para comenzar?','KITTEN')")
        await pg.wait_for_timeout(300); print('done a los 300ms:', await pg.evaluate('__h.done'))
        await pg.wait_for_timeout(3000); print('done a los 3.3s:', await pg.evaluate('__h.done'))
        for r in await pg.evaluate('__log'): print('  ',r)
        t=[r[0] for r in await pg.evaluate('__log')]; print('  huecos entre trozos (ms):',[t[i+1]-t[i] for i in range(len(t)-1)])
        # 2) cancelación externa a mitad
        await pg.evaluate("window.__log=[]; window.__h=PQ.utter('Primero debes observar la imagen y después responder. Luego pulsa la bandera verde para empezar.','ALTO')")
        await pg.wait_for_timeout(250); await pg.evaluate('speechSynthesis.cancel()'); await pg.wait_for_timeout(1500)
        print('cancelado -> done:', await pg.evaluate('__h.done'), 'trozos dichos:', len(await pg.evaluate('__log')), '(no debe seguir hablando)')
        # 3) tres locuciones seguidas: se descartan las atrasadas
        await pg.evaluate("window.__log=[]; window.__a=PQ.utter('Uno dos tres cuatro cinco.','ALTO'); window.__b=PQ.utter('Segunda frase larga para esperar.','ALTO'); window.__c=PQ.utter('Tercera.','ALTO')")
        await pg.wait_for_timeout(2500)
        print('flags', await pg.evaluate('[__a.done,__b.done,__c.done]'), 'dichas:', [r[1] for r in await pg.evaluate('__log')])
        # 4) comparativa antes/después en las 8 frases
        frases=['Hoy vamos a aprender algo nuevo.','¿Estás preparado para comenzar?','¡Increíble! Lo has conseguido.','No estoy completamente seguro de que sea así...','¿De verdad has conseguido terminarlo tan rápido?','Primero debes observar la imagen y después responder.','¡Qué buena idea!','¿Sabes qué es lo más interesante de todo esto?']
        res = await pg.evaluate('''(fr)=>fr.map(t=>{ PQ.utter(t,'KITTEN'); const u=PQ._lastUtter.units; speechSynthesis.cancel();
          return {t, kinds:u.map(x=>x.kind), segs:u.reduce((n,x)=>n+x.segs.length,0), pitches:[...new Set(u.flatMap(x=>x.segs.map(s=>s.p.toFixed(2))))].join('/'), rates:[...new Set(u.flatMap(x=>x.segs.map(s=>s.r.toFixed(2))))].join('/')} })''', frases)
        print('\nANTES: 1 trozo, pitch 1.00, rate 1.00, sin pausas, igual para todas')
        for r in res: print('  ',r['kinds'],r['segs'],'trozos | tonos',r['pitches'],'| vel.',r['rates'],'|',r['t'])
        print('errs',errs); await b.close()
asyncio.run(main())
