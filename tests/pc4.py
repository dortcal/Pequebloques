import asyncio, time, sys
from pchelp import *
EX=sys.argv[1] if len(sys.argv)>1 else 'pc-reciclaje-primaria'
async def main():
    p,b,pg,g,errs=await session(EX)
    t0=time.time()
    await pg.click('#btnFlag')
    async def card(*names):
        for n in names:
            await g.click(n); await pg.wait_for_timeout(250)
    async def run():
        await g.waitvar('modo',0,60); await g.click('Botón Ir'); await pg.wait_for_timeout(500)
    await g.waitvar('modo',0,60)
    print('nivel1 n=',await g.var('n'))
    # nivel 1: mal (se sale), luego bien
    await card('Flecha izquierda'); await run(); await g.waitvar('modo',0,30); print('salida fallo ok, n',await g.var('n'))
    await g.click('Botón Borrar'); await pg.wait_for_timeout(300)
    await card('Flecha derecha','Flecha derecha','Flecha derecha','Flecha derecha')
    await pg.screenshot(path='/tmp/p4a.png')
    await run(); await g.waitvar('hecho',1,40); print('nivel1 hecho %.1fs'%(time.time()-t0),'items',await g.var('items'))
    await g.waitvar('nivel',2,60); await g.waitvar('n',6,10)
    await run(); await g.waitvar('modo',0,40); print('n2 tras fallo',await g.var('n'), await g.var('hecho'))
    await g.click('Botón Quitar'); await g.click('Botón Quitar'); await pg.wait_for_timeout(300)
    await card('Flecha derecha','Flecha derecha')
    await pg.screenshot(path='/tmp/p4b.png')
    await run(); await g.waitvar('hecho',1,40); print('nivel2 hecho','items',await g.var('items'))
    await g.waitvar('nivel',3,60); await g.waitvar('max',6,10)
    await card('Flecha derecha','Flecha derecha','Flecha derecha','Flecha derecha','Flecha derecha','Flecha derecha','Flecha derecha')
    print('n tras 7 en cap 6',await g.var('n'))
    await g.click('Botón Borrar'); await pg.wait_for_timeout(300)
    await card('Flecha derecha','Repetir','Flecha derecha','Flecha arriba','Repetir','Flecha arriba')
    await pg.screenshot(path='/tmp/p4c.png')
    await run(); await g.waitvar('hecho',1,60); print('nivel3 hecho','items',await g.var('items'))
    await g.until(lambda: pg.evaluate('!PQ.RT.threads.length'),90,'fin')
    print('fin %.1fs'%(time.time()-t0), errs); print((await g.spoken())[-2:]); await b.close(); await p.stop()
asyncio.run(main())
