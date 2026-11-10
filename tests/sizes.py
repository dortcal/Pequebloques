import asyncio, os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from playwright.async_api import async_playwright
from pchelp import STUB
URL='file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','index.html'))+'?voz=dispositivo'
JS=r"""()=>{const q=(sel)=>[...document.querySelectorAll(sel)].filter(e=>e.offsetParent!==null).map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)]});
 const mins=(sel)=>{const a=q(sel);return a.length?{n:a.length,minW:Math.min(...a.map(x=>x[0])),minH:Math.min(...a.map(x=>x[1]))}:null};
 const o={};['#pal .palitem > .block','#cats .cat','.mbtn','.sbtn','#btnHelp','.tab','#btnAddSprite','#btnAddBackdrop','#wstools button','.stile','.mkvar','#btnShow','#btnHide'].forEach(s=>o[s]=mins(s));
 o.scrollX=document.documentElement.scrollWidth>innerWidth; return o}"""
async def main():
    p=await async_playwright().start(); b=await p.chromium.launch()
    for name,vp in [('tableta 1024x768',(1024,768)),('PDI/portátil táctil 1366x768',(1366,768)),('tableta vertical 820x1180',(820,1180)),('móvil apaisado 844x390',(844,390))]:
        cx=await b.new_context(viewport={'width':vp[0],'height':vp[1]}, has_touch=True, is_mobile=True); pg=await cx.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.add_init_script(STUB); await pg.goto(URL); await pg.wait_for_timeout(700)
        await pg.evaluate('document.querySelectorAll(".toast").forEach(t=>t.remove())')
        coarse=await pg.evaluate("matchMedia('(pointer:coarse)').matches")
        r=await pg.evaluate(JS); print('==',name,'coarse',coarse); 
        for k,v in r.items(): print('   ',k,v)
        await pg.screenshot(path='/tmp/claude-0/-home-claude/ca5a60ab-d678-5fd1-82c1-780dbf3d7572/scratchpad/sz_%dx%d.png'%vp)
        await cx.close()
    await b.close(); await p.stop()
asyncio.run(main())
