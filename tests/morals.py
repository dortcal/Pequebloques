import asyncio, sys
sys.path.insert(0, __file__.rsplit('/',1)[0])
from pchelp import session
# id, acción, fragmento de la moraleja, espera (s), voz
CASES = [
 ('canario-viajero','flag','muy lejos',30,False),
 ('lagarto-goloso','click:Plátano','todo se consigue',6,False),
 ('aventura-mar','flag','más divertido',14,False),
 ('lucia-yeray','flag','buenos amigos',14,False),
 ('carrera','flag','hasta el final',30,True),
 ('ballena-amiga','flag','nuevos amigos',14,True),
 ('robot-estrella','flag','sueños se cumplen',20,True),
 ('tesoro-teide','msg:adios','vale no es el oro',10,True),
 ('viaje-luna','msg:f2','hasta la Luna',10,True),
 ('mercado-sano','msg:fin','cuidarnos a nosotros',10,True),
 ('rescate-mar','msg:final','cambiar el mundo',14,True),
 ('huerto-lucia','msg:fin','todo crece',10,True),
 ('secreto-laurisilva','msg:fin','ella nos cuida',10,True),
]
async def main():
    bad=0
    for id,act,frag,wait,voiced in CASES:
        p,b,pg,g,errs = await session(id)
        await pg.evaluate('window.__spoken=[]')
        if act=='flag': await pg.evaluate('PQ.RT.greenFlag()')
        elif act.startswith('msg:'): await pg.evaluate('PQ.RT.broadcast(%r)'%act[4:])
        else:
            await pg.evaluate('PQ.RT.greenFlag()'); await pg.wait_for_timeout(100)
            await pg.evaluate('document.querySelectorAll(".toast").forEach(t=>t.remove())')
            sp=act.split(':')[1]; await pg.wait_for_timeout(4500); 
            try: await g.click(sp)
            except Exception as e: print('  click fallo',e)
        bub=[]
        import time; t=time.time(); ok=False
        while time.time()-t<wait:
            sp_=await g.spoken()
            txt=' '.join(sp_)
            b2=await pg.evaluate('PQ.S.project.sprites.map(s=>(s._say&&s._say.text)||"").join(" | ")')
            bub.append(b2)
            if frag.lower() in (txt+' '+' | '.join(bub)).lower(): ok=True; break
            await pg.wait_for_timeout(250)
        print('OK ' if ok else 'FALLA', id, 'errs',errs)
        if not ok: bad+=1; print('   dicho:', (await g.spoken())[-4:], bub[-1:])
        await b.close(); await p.stop()
    print('fallos',bad)
asyncio.run(main())
