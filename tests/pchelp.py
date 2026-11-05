import asyncio, os, time
from playwright.async_api import async_playwright
STUB = "window.__spoken=[];(function(){const synth={speaking:false,pending:false,getVoices(){return [{lang:'es-ES',name:'T'}]},cancel(){},speak(u){window.__spoken.push(u.text);setTimeout(()=>u.onend&&u.onend(),180)}};Object.defineProperty(window,'speechSynthesis',{value:synth,configurable:true});window.SpeechSynthesisUtterance=function(t){this.text=t};})();"
class G:
    def __init__(s,pg): s.pg=pg
    async def vars(s): return await s.pg.evaluate('Object.fromEntries(PQ.S.project.vars.map(v=>[v.name,v.value]))')
    async def var(s,n): return (await s.vars())[n]
    async def pos(s,name): return await s.pg.evaluate('(n)=>{const t=PQ.S.project.sprites.find(s=>s.name==n);return t?[t.x,t.y,t.visible,t.size,t.costume!==undefined?t.costume:null]:null}',name)
    async def click(s,name):
        p=await s.pos(name)
        assert p, name
        assert p[2], 'oculto '+name
        box=await s.pg.evaluate('(()=>{const r=document.querySelector("#stagewrap").getBoundingClientRect();return [r.left,r.top,r.width,r.height]})()')
        await s.pg.mouse.click(box[0]+box[2]*(240+p[0])/480, box[1]+box[3]*(180-p[1])/360)
        await s.pg.wait_for_timeout(120)
    async def until(s,fn,timeout=40,msg=''):
        t=time.time()
        while time.time()-t<timeout:
            if await fn(): return True
            await s.pg.wait_for_timeout(100)
        raise Exception('timeout '+msg)
    async def waitvar(s,n,val,timeout=40):
        async def f(): return (await s.var(n))==val
        await s.until(f,timeout,n+'=='+str(val))
    async def waitgt(s,n,val,timeout=40):
        async def f(): return (await s.var(n))>val
        await s.until(f,timeout,n+'>'+str(val))
    async def spoken(s): return await s.pg.evaluate('window.__spoken')
async def session(example, w=1200, h=800):
    p=await async_playwright().start(); b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':w,'height':h}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script(STUB)
    await pg.goto('file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','index.html')) + '?voz=dispositivo'); await pg.wait_for_timeout(500)
    await pg.evaluate('PQ.openExample("%s")'%example); await pg.wait_for_timeout(400)
    await pg.evaluate('document.querySelectorAll(".toast").forEach(t=>t.remove())')
    return p,b,pg,G(pg),errs
