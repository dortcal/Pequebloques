import asyncio, time
from pchelp import *
async def main():
    p,b,pg,g,errs=await session('pc-energia-primaria')
    t0=time.time(); await pg.click('#btnFlag')
    await g.waitvar('fase',1,60); await g.waitvar('modo',0,30)
    async def setrule(name,var,target):
        for _ in range(4):
            if (await g.var(var))==target: return
            await g.click(name); await pg.wait_for_timeout(300)
    await setrule('Fuente 1','rs',1); await setrule('Fuente 2','rv',3)
    await g.click('Botón Probar'); await g.waitvar('modo',0,60); print('fallo 1: hecho',await g.var('hecho'),'fallos',await g.var('fallos'))
    await pg.screenshot(path='/tmp/p6a.png')
    await setrule('Fuente 2','rv',2)
    await g.click('Botón Probar'); await g.waitvar('hecho',1,60); print('fase1 ok energia',await g.var('energia'))
    await g.waitvar('fase',2,60); await g.waitvar('modo',0,60)
    await setrule('Fuente 1','rs',1); await setrule('Fuente 2','rv',2); await setrule('Fuente 3','rn',3)
    await pg.screenshot(path='/tmp/p6b.png')
    await g.click('Botón Probar'); await g.waitvar('hecho',1,80); print('fase2 ok energia',await g.var('energia'))
    await g.waitvar('fase',3,60); await g.waitvar('modo',0,60)
    await g.click('Botón Probar'); await g.waitvar('modo',0,80); print('fase3 fallos',await g.var('fallos'))
    await setrule('Fuente 1','rs',1); await setrule('Fuente 2','rv',2)
    await pg.screenshot(path='/tmp/p6c.png')
    await g.click('Botón Probar'); await g.waitvar('hecho',1,80)
    await g.until(lambda: pg.evaluate('!PQ.RT.threads.length'),90,'fin')
    print('fin %.1fs'%(time.time()-t0), errs); await b.close(); await p.stop()
asyncio.run(main())
