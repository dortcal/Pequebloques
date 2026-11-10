import asyncio, sys, pchelp
sys.path.insert(0, __file__.rsplit('/',1)[0])
VOCES = {
 'natural': "[{lang:'es-ES',name:'Microsoft Helena - Spanish (Spain)',localService:true},{lang:'es-ES',name:'Microsoft Elvira Online (Natural) - Spanish (Spain)',localService:false},{lang:'es-ES',name:'Microsoft Alvaro Online (Natural) - Spanish (Spain)',localService:false}]",
 'mac': "[{lang:'es-ES',name:'Mónica',localService:true},{lang:'es-ES',name:'Eddy (español (España))',localService:true},{lang:'es-ES',name:'Flo (español (España))',localService:true},{lang:'es-ES',name:'Grandpa (español (España))',localService:true},{lang:'es-ES',name:'Reed (español (España))',localService:true},{lang:'es-ES',name:'Rocko (español (España))',localService:true},{lang:'es-ES',name:'Sandy (español (España))',localService:true},{lang:'es-MX',name:'Paulina',localService:true}]",
 'plana': "[{lang:'es-ES',name:'Microsoft Helena - Spanish (Spain)',localService:true},{lang:'es-ES',name:'Microsoft Pablo - Spanish (Spain)',localService:true}]",
}
ORIG = pchelp.STUB
async def caso(nombre, engine):
    pchelp.STUB = ORIG.replace("return [{lang:'es-ES',name:'T'}]", "return "+VOCES[nombre])
    p,b,pg,g,errs = await pchelp.session('carrera')
    if engine: await pg.evaluate("PQ.voiceCfg.engine=%r"%engine)
    r = await pg.evaluate("""()=>{
      PQ.utter('Hola, soy Lucía.','KITTEN'); const a=PQ._lastUtter; PQ.stopVoice&&PQ.stopVoice();
      PQ.utter('Hola, soy Yeray.','ALTO'); const c=PQ._lastUtter; const o={};['SQUEAK','GIANT','TENOR','PIPO'].forEach(k=>{PQ.stopVoice&&PQ.stopVoice();PQ.utter('Hola, soy un personaje nuevo.',k);o[k]=[PQ._lastUtter.engine,PQ._lastUtter.voice,PQ._lastUtter.pitch]});
      return {neural:PQ.tts.neuralReady(), natural:!!PQ.tts.naturalDevice(), kitten:[a.engine,a.voice,a.pitch], alto:[c.engine,c.voice,c.pitch],otros:o}}""")
    print(nombre, engine, r, 'errs', errs)
    await b.close(); await p.stop()
async def main():
    await caso('natural', None); await caso('natural','clips'); await caso('natural','device'); await caso('plana', None); await caso('mac', None)
asyncio.run(main())
