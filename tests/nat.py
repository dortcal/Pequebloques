import asyncio
from pchelp import *
async def main():
    p,b,pg,g,errs=await session('pc-cole-primaria',1200,800)
    await pg.click('#btnFlag'); await g.waitvar('fase',1,60); await pg.wait_for_timeout(1500)
    print('natural', await pg.evaluate('PQ.voiceNatural'))
    u=await pg.evaluate('PQ._lastUtter'); print({k:u[k] for k in ('key','pitch')}, 'segs por unidad', [len(x['segs']) for x in u['units']])
    sp=await g.spoken(); print(sp[-4:])
    # voces falsas: comprobar elección por calidad
    r=await pg.evaluate('''()=>{const V=[{lang:'es-ES',name:'eSpeak Spanish'},{lang:'es-ES',name:'Microsoft Helena - Spanish'},{lang:'es-ES',name:'Microsoft Elvira Online (Natural) - Spanish (Spain)'},{lang:'es-ES',name:'Microsoft Alvaro Online (Natural) - Spanish (Spain)'}];
      speechSynthesis.getVoices=()=>V; PQ.utter('Hola, soy Lucía.','KITTEN'); const a=PQ._lastUtter.voice; speechSynthesis.cancel(); PQ.utter('Hola, soy Yeray.','ALTO'); return [a,PQ._lastUtter.voice]}''')
    print(r)
    await pg.evaluate('PQ.openExample("pc-reciclaje-primaria")'); await pg.wait_for_timeout(300); print('natural en otra', await pg.evaluate('PQ.voiceNatural'))
    print(errs); await b.close(); await p.stop()
asyncio.run(main())
