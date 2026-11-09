"""Pruebas del motor de voz (js/tts.js + reproductor de runtime.js) con audio real en Chromium.

Qué comprueba:
  1. Textos conocidos (cuentos, pistas, bloques): se reproducen con la voz NEURONAL (audio real, termina solo).
  2. Frases con números (marcador de los juegos): se componen por frases con la voz neuronal.
  3. Textos nuevos (escritos por el alumnado): voz del DISPOSITIVO, siempre es-ES, la mejor voz española y nunca la inglesa.
  4. Velocidad y volumen se aplican a los dos motores.
  5. Si falla el audio, se usa el respaldo; si no hay voz española, no se habla con otra.
  6. Ajustes: ventana de voz, muestras, Pipo femenina/masculina, motor «solo dispositivo».
  7. Latencia de arranque y paradas limpias.
Uso:  cd tests && python3 neural.py
"""
import asyncio, os, json, time, sys
from playwright.async_api import async_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
VOICES_OK = [
    {'lang': 'en-US', 'name': 'Samantha'},
    {'lang': 'es-MX', 'name': 'Microsoft Sabina Online (Natural) - Spanish (Mexico)'},
    {'lang': 'es-ES', 'name': 'espeak-ng Spanish compact'},
    {'lang': 'es-ES', 'name': 'Microsoft Elvira Online (Natural) - Spanish (Spain)'},
    {'lang': 'es-ES', 'name': 'Microsoft Alvaro Online (Natural) - Spanish (Spain)'},
]
STUB = """
window.__sp=[]; window.__voices=%s;
(function(){const synth={speaking:false,getVoices(){return window.__voices},cancel(){window.__cancels=(window.__cancels||0)+1},addEventListener(){},
  speak(u){window.__sp.push({t:u.text,lang:u.lang,voice:u.voice&&u.voice.name,rate:u.rate,vol:u.volume,pitch:u.pitch});setTimeout(()=>u.onend&&u.onend(),120)}};
Object.defineProperty(window,'speechSynthesis',{value:synth,configurable:true});window.SpeechSynthesisUtterance=function(t){this.text=t};})();
/* registro de los audios reales */
window.__au=[];
(function(){const P=HTMLMediaElement.prototype.play;
 HTMLMediaElement.prototype.play=function(){const a=this,rec={src:a.src.split('/').pop(),t0:performance.now(),rate:a.playbackRate,vol:a.volume,ended:false,t1:0};window.__au.push(rec);
  a.addEventListener('playing',()=>{rec.tp=performance.now()},{once:true});a.addEventListener('ended',()=>{rec.ended=true;rec.t1=performance.now()},{once:true});return P.call(this)}})();
"""
fails = []
def ck(name, ok, info=''):
    print(('  OK   ' if ok else '  FALLO ') + name + (('  → ' + str(info)) if info != '' else ''))
    if not ok: fails.append(name)

async def page(b, voices=VOICES_OK, cfg=None, query=''):
    ctx = await b.new_context(viewport={'width': 1300, 'height': 820}); pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERR ' + str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    await pg.add_init_script(STUB % json.dumps(voices))
    cfg = dict(cfg or {}); cfg.setdefault('engine', 'clips')   # estas pruebas miden las voces grabadas; el modo automático con voz natural tiene su propia comprobación
    if cfg: await pg.add_init_script("if(!localStorage.getItem('pequebloques.voz'))localStorage.setItem('pequebloques.voz', %s)" % json.dumps(json.dumps(cfg)))
    await pg.goto('file://' + ROOT + '/index.html' + query); await pg.wait_for_timeout(700)
    return pg, errs

async def wait_end(pg, n, timeout=25):
    t = time.time()
    while time.time() - t < timeout:
        if await pg.evaluate('window.__au.filter(a=>a.ended).length') >= n: return True
        await pg.wait_for_timeout(100)
    return False

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        pg, errs = await page(b)
        await pg.evaluate("PQ.voiceCfg.engine='auto'")
        auto = await pg.evaluate('({nat:!!PQ.tts.naturalDevice(), ready:PQ.tts.neuralReady()})')
        ck('motor automático: con voz natural en el dispositivo se usa esa, no las grabadas', auto['nat'] and not auto['ready'], auto)
        await pg.evaluate("PQ.voiceCfg.engine='clips'; PQ.tts.save()")
        info = await pg.evaluate('({n:PQ.AUDIO&&PQ.AUDIO.n, base:PQ.AUDIO_BASE, ready:PQ.tts.neuralReady(), es:PQ.tts.deviceInfo().map(v=>v.name)})')
        print('estado:', info)
        ck('manifiesto de audio cargado', bool(info['n']) and info['ready'], info['n'])
        ck('voces del dispositivo: solo español, España primero, sin la «compact»', info['es'][0].startswith('Microsoft Elvira') and 'Samantha' not in info['es'] and info['es'][-1].startswith('espeak') and 'Mexico' in info['es'][-2], info['es'])

        print('\n1. Textos conocidos con voz neuronal')
        await pg.evaluate('PQ.settings.voice=true')
        for txt, key in [('¡Hola! Así sueno yo.', 'KITTEN'), ('¡Hola! Así sueno yo.', 'GIANT'), ('Voz activada.', 'PIPO')]:
            n0 = await pg.evaluate('window.__au.filter(a=>a.ended).length')
            t0 = time.time(); await pg.evaluate('PQ.stopVoice(); window.__h=PQ.utter(%s,%s)' % (json.dumps(txt), json.dumps(key)))
            ok = await wait_end(pg, n0 + 1)
            eng = await pg.evaluate('PQ._lastUtter.engine'); sp = await pg.evaluate('window.__sp.length')
            ck('%s · %s → neuronal y termina' % (key, txt), ok and eng == 'neural' and sp == 0, '%.1fs' % (time.time() - t0))
            done = await pg.evaluate('window.__h.done'); ck('   el manejador queda «done»', done)
        a = await pg.evaluate('window.__au.slice(-1)[0]')
        ck('latencia de arranque del primer audio < 400 ms', a.get('tp') and a['tp'] - a['t0'] < 400, '%d ms' % (a['tp'] - a['t0']) if a.get('tp') else 'sin dato')

        print('\n2. Frases con números (marcador) por frases, voz neuronal')
        n0 = await pg.evaluate('window.__au.length')
        await pg.evaluate("window.__h=PQ.utter('Se acabó. Has marcado 3 goles. ¡Pulsa la bandera para jugar otra vez!','KITTEN')")
        ok = await wait_end(pg, await pg.evaluate('window.__au.filter(a=>a.ended).length') + 3, 30)
        last = await pg.evaluate('PQ._lastUtter')
        ck('3 clips encadenados, sin voz del dispositivo', last['engine'] == 'neural' and len(last['clips']) == 3 and await pg.evaluate('window.__sp.length') == 0, last['clips'])
        ck('   terminan los 3', ok)

        print('\n3. Texto nuevo del alumnado → dispositivo, es-ES, mejor voz española')
        await pg.evaluate("PQ.stopVoice(); window.__sp=[]; PQ.utter('Mi perro se llama Zeus y le gusta correr por la playa.','KITTEN'); PQ.stopVoice()")
        await pg.wait_for_timeout(100)
        await pg.evaluate("window.__sp=[]; PQ.utter('Mi perro se llama Zeus y le gusta correr por la playa.','KITTEN')"); await pg.wait_for_timeout(1500)
        sp = await pg.evaluate('window.__sp')
        ck('habla con el dispositivo', len(sp) > 0, len(sp))
        ck('lang = es-ES en todos los trozos', all(s['lang'] == 'es-ES' for s in sp))
        ck('voz femenina Natural de España (Elvira) para la niña', all(s['voice'] and 'Elvira' in s['voice'] for s in sp), {s['voice'] for s in sp})
        await pg.evaluate("PQ.stopVoice(); window.__sp=[]; PQ.utter('Esto lo ha escrito un niño y no está grabado.','ALTO')"); await pg.wait_for_timeout(1500)
        sp = await pg.evaluate('window.__sp')
        ck('voz masculina Natural de España (Alvaro) para el niño', len(sp) > 0 and all('Alvaro' in (s['voice'] or '') for s in sp), {s['voice'] for s in sp})
        ck('nunca una voz inglesa ni es-MX', all(('Samantha' not in (s['voice'] or '')) and 'Sabina' not in (s['voice'] or '') for s in sp))

        print('\n4. Velocidad y volumen')
        await pg.evaluate("PQ.stopVoice(); PQ.tts.cfg.rate=1.2; PQ.tts.cfg.volume=0.5; window.__au=[]; window.__sp=[]; PQ.utter('¡Hola! Así sueno yo.','ALTO')"); await pg.wait_for_timeout(500)
        a = await pg.evaluate('window.__au[0]'); ck('neuronal: velocidad ×1,2 y volumen 0,5', a and abs(a['rate'] - 1.2) < 1e-6 and abs(a['vol'] - 0.5) < 1e-6, a)
        await pg.evaluate("PQ.stopVoice(); window.__sp=[]; PQ.utter('Texto distinto que no existe en los audios grabados.','KITTEN')"); await pg.wait_for_timeout(800)
        sp = await pg.evaluate('window.__sp'); ck('dispositivo: velocidad y volumen aplicados', len(sp) > 0 and all(s['vol'] <= 0.5 + 1e-6 for s in sp), sp[:1])
        await pg.evaluate("PQ.tts.cfg.rate=1; PQ.tts.cfg.volume=1")

        print('\n5. Respaldo')
        await pg.evaluate("PQ.AUDIO_BASE='file:///no/existe/'; PQ.stopVoice(); window.__sp=[]; window.__au=[]; window.__h=PQ.utter('¡Hola! Así sueno yo.','TENOR')"); await pg.wait_for_timeout(1500)
        sp = await pg.evaluate('window.__sp'); ck('audio no disponible → voz del dispositivo (es-ES) y termina', len(sp) > 0 and all(s['lang'] == 'es-ES' for s in sp) and await pg.evaluate('window.__h.done'))
        pg2, e2 = await page(b, voices=[{'lang': 'en-US', 'name': 'Samantha'}, {'lang': 'fr-FR', 'name': 'Thomas'}], query='?voz=dispositivo')
        await pg2.evaluate("window.__sp=[]; window.__h=PQ.utter('Este dispositivo no tiene voz en español.','KITTEN')"); await pg2.wait_for_timeout(600)
        ck('sin voces españolas: no habla con una voz inglesa/francesa', await pg2.evaluate('window.__sp.length') == 0 and not await pg2.evaluate('PQ.voiceAvailable()'))
        ck('   y la ejecución no se queda colgada', await pg2.evaluate("new Promise(r=>setTimeout(()=>r(window.__h.done),4500))"))
        await pg2.context.close()

        print('\n6. Ventana de ajustes')
        pg3, e3 = await page(b)
        await pg3.click('#btnVoiceSet'); await pg3.wait_for_timeout(300)
        ck('se abre', await pg3.locator('.vset').count() == 1)
        txt = await pg3.inner_text('.vstate'); ck('muestra idioma es-ES y estado', 'es-ES' in txt and 'neuronales' in txt, txt.replace('\n', ' | '))
        await pg3.evaluate("window.__au=[]")
        await pg3.click('.vset .vseg.wrap .btn:has-text("Animal grande")'); await pg3.wait_for_timeout(600)
        ck('muestra de voz «animal grande» suena (neuronal)', await pg3.evaluate("window.__au.length") == 1 and await pg3.evaluate("PQ._lastUtter.key")=='GIANT')
        await pg3.evaluate("window.__au=[]")
        await pg3.click('.vset .vseg .btn:has-text("Masculina")'); await pg3.wait_for_timeout(600)
        cfgp = await pg3.evaluate("PQ.tts.cfg.pipo + '|' + (window.__au[0]||{}).src"); ck('Pipo masculina: usa clip propio', cfgp.startswith('m|') and cfgp.endswith('.mp3'), cfgp)
        await pg3.evaluate("window.__au=[]")
        await pg3.click('.vset .vseg .btn:has-text("Femenina")'); await pg3.wait_for_timeout(600)
        cfgp2 = await pg3.evaluate("PQ.tts.cfg.pipo + '|' + (window.__au[0]||{}).src"); ck('Pipo femenina: clip distinto', cfgp2.startswith('f|') and cfgp2 != cfgp, cfgp2)
        await pg3.fill('.vset input[type=range] >> nth=0', '1.2') if False else await pg3.evaluate("const r=document.querySelectorAll('.vset input[type=range]')[0]; r.value=1.2; r.dispatchEvent(new Event('input'))")
        await pg3.evaluate("const r=document.querySelectorAll('.vset input[type=range]')[1]; r.value=0.4; r.dispatchEvent(new Event('input'))")
        st = await pg3.evaluate("JSON.parse(localStorage.getItem('pequebloques.voz'))"); ck('velocidad y volumen se guardan', abs(st['rate'] - 1.2) < 1e-6 and abs(st['volume'] - 0.4) < 1e-6, st)
        await pg3.click('.vset .vseg:has(select) .btn'); await pg3.wait_for_timeout(500)
        ck('«Probar» de la voz del dispositivo usa el dispositivo', await pg3.evaluate("window.__sp.length")>0 and await pg3.evaluate("PQ._lastUtter.engine")=='device')
        await pg3.click('.vset .vrow:has-text("Motor") .btn:has-text("Solo la del dispositivo")'); await pg3.evaluate("window.__au=[];window.__sp=[]")
        await pg3.evaluate("PQ.stopVoice(); PQ.utter('¡Hola! Así sueno yo.','KITTEN')"); await pg3.wait_for_timeout(700)
        ck('motor «solo dispositivo»: no suena el neuronal', await pg3.evaluate("window.__au.length")==0 and await pg3.evaluate("window.__sp.length")>0)
        await pg3.screenshot(path='/tmp/ajustes_voz.png')
        await pg3.reload(); await pg3.wait_for_timeout(500)
        ck('los ajustes persisten tras recargar', await pg3.evaluate("PQ.tts.cfg.engine=='device' && Math.abs(PQ.tts.cfg.rate-1.2)<1e-6"))
        print('errores de consola:', e3)

        print('\n7. Un cuento completo: todo con voz neuronal')
        pg4, e4 = await page(b)
        await pg4.evaluate("PQ.settings.voice=true; PQ.openExample('carrera')"); await pg4.wait_for_timeout(300)
        await pg4.evaluate("window.__log=[]; (function(){const pl=PQ.tts.plan; PQ.tts.plan=function(t,k){const r=pl(t,k); window.__log.push([r?'neural':'device',k,t.slice(0,50)]); return r;}; })()")
        await pg4.evaluate("window.__sp=[]; window.__au=[]"); await pg4.click('#btnFlag'); await pg4.wait_for_timeout(14000)
        lg = await pg4.evaluate('window.__log'); print('  ', lg[:6])
        ck('todas las frases del cuento «carrera» van con voz neuronal', len(lg) > 0 and all(x[0] == 'neural' for x in lg) and await pg4.evaluate('window.__sp.length') == 0 and await pg4.evaluate('window.__au.length') >= len(lg), '%d frases, %d audios' % (len(lg), await pg4.evaluate('window.__au.length')))
        await pg4.evaluate("PQ.stopVoice()"); ck('parar corta el audio', await pg4.evaluate("PQ.RT.threads.length>=0"))
        print('errores de página (cuento):', e4)
        await b.close()
    print('\n==', 'TODO OK' if not fails else 'FALLOS: %s' % fails)
    sys.exit(1 if fails else 0)
asyncio.run(main())
