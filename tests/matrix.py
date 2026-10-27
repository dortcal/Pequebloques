import asyncio, os, json, sys
from playwright.async_api import async_playwright
UA_WIN='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
UA_MAC='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15'
UA_LIN='Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0'
UA_IPAD=UA_MAC
UA_AND='Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
P=[ # nombre, w, h, touch, ua, dpr
 ('Win 1920x1080',1920,1080,0,UA_WIN,1),('Win 1366x768',1366,768,0,UA_WIN,1),('Win 1280x720 (150%)',1280,720,0,UA_WIN,1.5),('Win 1024x600',1024,600,0,UA_WIN,1),
 ('Mac 1440x900',1440,900,0,UA_MAC,2),('Mac 1280x800',1280,800,0,UA_MAC,2),('Linux 1600x900',1600,900,0,UA_LIN,1),('Linux 1280x1024',1280,1024,0,UA_LIN,1),('Pantalla 4K 3840x2160',3840,2160,0,UA_WIN,1),
 ('iPad 1024x768',1024,768,1,UA_IPAD,2),('iPad 10 1180x820',1180,820,1,UA_IPAD,2),('iPad mini 1133x744',1133,744,1,UA_IPAD,2),('iPad Pro 1366x1024',1366,1024,1,UA_IPAD,2),
 ('Android tab 1280x800',1280,800,1,UA_AND,1.5),('Android tab 1024x600',1024,600,1,UA_AND,1.5),('Android tab 960x540',960,540,1,UA_AND,2),('Chromebook 1366x768 tactil',1366,768,1,UA_AND,1),
 ('iPad vertical 820x1180',820,1180,1,UA_IPAD,2),('Android tab vertical 800x1280',800,1280,1,UA_AND,1.5),
]
JS_STATE='''(()=>{
 const vis=(s)=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();const cs=getComputedStyle(e);return {w:Math.round(r.width),h:Math.round(r.height),l:Math.round(r.left),t:Math.round(r.top),r:Math.round(r.right),b:Math.round(r.bottom),shown:cs.display!=='none'&&cs.visibility!=='hidden'}};
 const ids=['#menubar','#btnFlag','#btnStop','#stagewrap','#pal','#ws','#spritelist','#legal','#btnStories','#btnSave'];
 const o={};ids.forEach(i=>o[i]=vis(i));
 const btns=[...document.querySelectorAll('button')].filter(b=>{const r=b.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(b).visibility!=='hidden'&&!b.closest('#pad')&&!b.closest('#rotate')});
 o.minBtn=Math.round(Math.min(...btns.map(b=>Math.min(b.getBoundingClientRect().width,b.getBoundingClientRect().height))));
 o.doc=[document.documentElement.scrollWidth,document.documentElement.scrollHeight,innerWidth,innerHeight];
 o.rotate=getComputedStyle(document.querySelector('#rotate')).display;
 return o})()'''
async def run(p,prof):
    name,w,h,touch,ua,dpr=prof; res={'perfil':name}
    b=await p.chromium.launch()
    ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=bool(touch),is_mobile=bool(touch) and w<1100,user_agent=ua,device_scale_factor=dpr,accept_downloads=True)
    pg=await ctx.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    await pg.goto('file://'+os.path.abspath('../index.html')); await pg.wait_for_timeout(600)
    await pg.evaluate('document.querySelectorAll(".toast").forEach(t=>t.remove())')
    st=await pg.evaluate(JS_STATE); res['st']=st
    issues=[]
    if st['rotate']!='none': res['vertical']=True; await pg.screenshot(path=f'/tmp/m_{len(name)}{w}.png'); res['issues']=['aviso de girar (esperado en vertical táctil)']; res['errs']=errs; await b.close(); return res
    d=st['doc']
    if d[0]>d[2]+1 or d[1]>d[3]+1: issues.append(f'desborda {d}')
    for k in ['#btnFlag','#btnStop','#stagewrap','#pal','#ws','#spritelist','#legal','#btnStories','#btnSave']:
        e=st[k]
        if not e or not e['shown'] or e['w']<20 or e['h']<20: issues.append(f'{k} no visible/diminuto {e}')
        elif e['r']>w+1 or e['b']>h+1 or e['l']<-1 or e['t']<-1: issues.append(f'{k} fuera de pantalla {e}')
    sw=st['#stagewrap']; res['escenario']=f"{sw['w']}x{sw['h']}"
    if touch and st['minBtn']<34: issues.append(f"botón táctil pequeño {st['minBtn']}px")
    # ejemplo + bandera
    await pg.evaluate('PQ.openExample("tesoro-teide")'); await pg.wait_for_timeout(400); await pg.evaluate('document.querySelectorAll(".toast").forEach(t=>t.remove())')
    await pg.click('#btnFlag'); await pg.wait_for_timeout(1500)
    if not await pg.evaluate('PQ.RT.threads.length>0'): issues.append('la bandera no arrancó')
    await pg.click('#btnStop'); await pg.wait_for_timeout(200)
    # arrastrar
    await pg.evaluate('PQ.newProject&&0')
    cnt=lambda: pg.evaluate('PQ.S.target.scripts.reduce((n,s)=>n+s.blocks.length,0)')
    n0=await cnt()
    r=await pg.evaluate('(()=>{const b=document.querySelector("#pal .block");const r=b.getBoundingClientRect();const w=document.querySelector("#ws").getBoundingClientRect();return [r.left+20,r.top+r.height/2,w.left+w.width*0.3,w.top+w.height*0.5]})()')
    if touch:
        cdp=await ctx.new_cdp_session(pg)
        await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':r[0],'y':r[1]}]})
        for i in range(1,13):
            await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':r[0]+(r[2]-r[0])*i/12,'y':r[1]+(r[3]-r[1])*i/12}]}); await pg.wait_for_timeout(16)
        await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
    else:
        await pg.mouse.move(r[0],r[1]); await pg.mouse.down(); await pg.mouse.move(r[2],r[3],steps=12); await pg.mouse.up()
    await pg.wait_for_timeout(300)
    if await cnt()<=n0: issues.append('arrastrar bloque no funciona')
    # atajos
    mod='Meta' if 'Macintosh' in ua and not touch else 'Control'
    await pg.keyboard.press(f'{mod}+z'); await pg.wait_for_timeout(200)
    if await cnt()!=n0 and not touch: issues.append(f'{mod}+Z no deshizo')
    # guardar y reabrir
    async with pg.expect_download() as dl: await pg.click('#btnSave')
    f=await dl.value; path=f'/tmp/m_{w}x{h}.sb3'; await f.save_as(path)
    await pg.evaluate('PQ.openExample("lagarto-goloso")'); await pg.wait_for_timeout(300)
    await pg.set_input_files('#fileOpen',path); await pg.wait_for_timeout(500)
    try: await pg.click('text=Sí, abrir',timeout=1500)
    except Exception: pass
    await pg.wait_for_timeout(900)
    ok=await pg.evaluate('PQ.S.project.sprites.length')
    if not ok: issues.append('no reabre el .sb3')
    # pantalla completa del escenario
    await pg.click('#btnFull'); await pg.wait_for_timeout(300)
    fs=await pg.evaluate('!!document.fullscreenElement||document.querySelector("#stagebox").classList.contains("pfull")')
    if not fs: issues.append('pantalla completa del escenario no se activa')
    await pg.click('#btnFull'); await pg.wait_for_timeout(300)
    await pg.screenshot(path=f'/tmp/m_{name.replace(" ","_").replace("(","").replace(")","").replace("%","")}.png')
    res['issues']=issues; res['errs']=errs; await b.close(); return res
async def main():
    async with async_playwright() as p:
        out=[]
        for prof in [x for x in P if not os.environ.get("ONLY") or os.environ["ONLY"] in x[0]]:
            try: out.append(await run(p,prof))
            except Exception as e: out.append({'perfil':prof[0],'issues':['EXCEPCIÓN '+str(e)[:200]],'errs':[]})
            print(json.dumps({k:v for k,v in out[-1].items() if k!='st'},ensure_ascii=False),flush=True)
asyncio.run(main())
