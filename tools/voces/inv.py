import asyncio, os, json, re
from playwright.async_api import async_playwright
ROOT='/home/claude/pequebloques'
STUB="""
window.__sp=[];
(function(){const synth={speaking:false,getVoices(){return [{lang:'es-ES',name:'Test ES'}]},cancel(){},speak(u){setTimeout(()=>u.onend&&u.onend(),50)}};
Object.defineProperty(window,'speechSynthesis',{value:synth,configurable:true});window.SpeechSynthesisUtterance=function(t){this.text=t};})();
"""
JS = r"""
() => {
  const out = [];  // [texto, voz, origen]
  const add = (t, v, o) => { if (typeof t === 'string' && t.trim()) out.push([t, v, o]); };
  // 1) ejemplos: recorrer los scripts de todos los personajes
  PQ.EX.forEach((ex) => {
    PQ.openExample(ex.id);
    add(ex.challenge, 'SQUEAK', 'reto:' + ex.id);
    PQ.allTargets(PQ.S.project).forEach((t) => {
      const base = (t._voice) || PQ.defaultVoice(t);
      t.scripts.forEach((s) => {
        let voice = base;
        (function walk(arr) {
          (arr || []).forEach((b) => {
            if (b.op === 'text2speech_setVoice') voice = String(b.f.VOICE);
            if (b.op === 'text2speech_speakAndWait') {
              if (b.in && b.in.WORDS) {
                (function lit(x){ if (!x) return; if (x.f) Object.keys(x.f).forEach(k => { if (typeof x.f[k]==='string' && x.f[k].length>3) add(x.f[k], voice, 'trozo:' + ex.id); }); if (x.in) Object.keys(x.in).forEach(k => lit(x.in[k])); })(b.in.WORDS);
              } else add(b.f.WORDS, voice, 'ej:' + ex.id);
            }
            if (b.op === 'looks_say' || b.op === 'looks_sayforsecs') add(b.f.MESSAGE, voice, 'say:' + ex.id);
            if (b.in) Object.keys(b.in).forEach((k) => walk([b.in[k]]));
            if (b.cond) walk([b.cond]); walk(b.sub); walk(b.sub2);
          });
        })(s.blocks);
      });
    });
  });
  // 2) textos de los bloques al tocarlos
  Object.keys(PQ.BLOCKS).forEach((op) => { try { add(PQ.blockText(PQ.mkBlock(op)), 'KITTEN', 'bloque:' + op); } catch (e) {} });
  return out;
}
"""
async def main():
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={'width':1300,'height':800})).new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script(STUB)
        await pg.goto('file://'+ROOT+'/index.html'); await pg.wait_for_timeout(600)
        res = await pg.evaluate(JS)
        json.dump(res, open('/tmp/inv/dyn.json','w'), ensure_ascii=False)
        print(len(res), 'textos dinámicos', 'errs', errs[:3])
        await b.close()
asyncio.run(main())
