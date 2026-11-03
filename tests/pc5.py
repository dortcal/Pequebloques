import asyncio, time
from pchelp import *
async def main():
    p,b,pg,g,errs=await session('pc-universo-primaria')
    t0=time.time(); await pg.click('#btnFlag')
    async def card(*names):
        for n in names: await g.click(n); await pg.wait_for_timeout(250)
    async def run():
        await g.waitvar('modo',0,60); await g.click('Botón Ir'); await pg.wait_for_timeout(500)
    R,U,Rp='Flecha derecha','Flecha arriba','Repetir'
    await g.waitvar('modo',0,60)
    await card(R,R,R,R,U,U); await pg.screenshot(path='/tmp/p5a.png'); await run(); await g.waitvar('hecho',1,40); print('n1 ok items',await g.var('items'))
    await g.waitvar('nivel',2,60); await g.waitvar('n',0,10)
    await card(R,R); await run(); await g.waitvar('modo',0,40); print('choque ok hecho',await g.var('hecho'))
    await g.click('Botón Borrar'); await card(U,U,R,R,R,R,U,U); await pg.screenshot(path='/tmp/p5b.png'); await run(); await g.waitvar('hecho',1,40); print('n2 ok items',await g.var('items'))
    await g.waitvar('nivel',3,60); await g.waitvar('max',6,10)
    await card(R,Rp,R,U,Rp,U); await pg.screenshot(path='/tmp/p5c.png'); await run(); await g.waitvar('hecho',1,60); print('n3 ok items',await g.var('items'))
    await g.until(lambda: pg.evaluate('!PQ.RT.threads.length'),90,'fin')
    print('fin %.1fs'%(time.time()-t0), errs); await b.close(); await p.stop()
asyncio.run(main())
