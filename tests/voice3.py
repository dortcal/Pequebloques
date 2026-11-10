"""Fase 3 · voz: qué motor se usa de verdad y aviso cuando no hay voces grabadas."""
import asyncio, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from playwright.async_api import async_playwright
from pchelp import STUB
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..'))
SAY="async()=>{const TXT='¡Hola! Soy Pipo. Así suena mi voz.';const w=(ms)=>new Promise(r=>setTimeout(r,ms));PQ.say(TXT,true);await w(900);const a={engine:PQ._lastUtter&&PQ._lastUtter.engine,status:PQ.tts.status(),toasts:[...document.querySelectorAll('.toast span')].map(e=>e.textContent),spoken:(window.__spoken||[]).length,title:document.getElementById('btnVoice').title};PQ.say(TXT,true);await w(700);a.toasts2=document.querySelectorAll('.toast').length;a.engine2=PQ._lastUtter.engine;return a}"
async def case(label, url, block_audio=False, block_manifest=False, stub=True):
    p=await async_playwright().start(); b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required']); pg=await b.new_page(viewport={'width':1200,'height':800}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    if stub: await pg.add_init_script(STUB)
    else: await pg.add_init_script("Object.defineProperty(window,'speechSynthesis',{value:undefined,configurable:true});window.SpeechSynthesisUtterance=undefined;")
    if block_audio: await pg.route('**/*.mp3', lambda r: r.abort())
    if block_manifest: await pg.route('**/manifest.js', lambda r: r.abort())
    await pg.goto(url); await pg.wait_for_timeout(700)
    await pg.evaluate('document.querySelectorAll(".toast").forEach(t=>t.remove())')
    r=await pg.evaluate(SAY)
    print('==',label); print('  ',r); print('   errs',errs)
    await b.close(); await p.stop()
async def main():
    u='file://'+ROOT+'/index.html'
    await case('con carpeta audio (motor grabadas)', u+'?x=1')
    await case('sin manifest (como el artefacto de un solo HTML)', u, block_manifest=True)
    await case('manifest presente pero mp3 inaccesibles', u, block_audio=True)
    await case('sin manifest y sin voz del dispositivo', u, block_manifest=True, stub=False)
asyncio.run(main())
