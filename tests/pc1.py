import asyncio, time
from pchelp import *
async def main():
    p,b,pg,g,errs=await session('pc-reciclaje-infantil')
    t0=time.time()
    await pg.click('#btnFlag')
    await g.waitvar('fase',1,60); await g.waitvar('bloqueo',0,30)
    print('fase1 en %.1fs'%(time.time()-t0))
    await g.until(lambda: g.var('sel') if False else asyncio.sleep(0) , 1) if False else None
    await g.click('Botella'); await g.waitvar('sel',1,10)
    await g.click('Contenedor amarillo'); await g.waitvar('fase',2,40)
    print('fase2 en %.1fs'%(time.time()-t0), await g.var('restan'))
    # mal: tarro al amarillo
    await g.waitvar('bloqueo',0,20)
    for name,cont in [('Tarro','Contenedor amarillo'),('Tarro','Contenedor verde'),('Lata','Contenedor amarillo'),('Periódico','Contenedor azul'),('Caja','Contenedor azul'),('Brik','Contenedor amarillo')]:
        await g.waitvar('bloqueo',0,20)
        await g.click(name); await pg.wait_for_timeout(200); await g.waitvar('bloqueo',0,10)
        await g.click(cont); await pg.wait_for_timeout(700)
    await g.waitvar('fase',3,40); print('fase3 en %.1fs'%(time.time()-t0), await g.var('restan'))
    await g.waitvar('resp',1,40); await g.waitvar('bloqueo',0,20)
    await g.click('Contenedor azul'); await pg.wait_for_timeout(700); print('hecho tras fallo',await g.var('hecho'))
    await g.click('Contenedor amarillo'); await g.waitvar('resp',3,60); await g.waitvar('bloqueo',0,20)
    await g.click('Contenedor verde'); await g.waitvar('fase',4,60)
    await g.waitvar('bloqueo',0,20); await pg.wait_for_timeout(1500)
    await g.click('Brik'); await pg.wait_for_timeout(800); print('brik sel',await g.var('sel'))
    await g.click('Lata'); await g.waitvar('sel',1,10); await g.click('Contenedor amarillo')
    await g.waitvar('restan',0,20)
    await g.until(lambda: pg.evaluate('!PQ.RT.threads.length'),60,'fin')
    print('fin en %.1fs'%(time.time()-t0), errs); print((await g.spoken())[-3:])
    await pg.screenshot(path='/tmp/pc1.png'); await b.close(); await p.stop()
asyncio.run(main())
