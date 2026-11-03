import asyncio, time
from pchelp import *
async def main():
    p,b,pg,g,errs=await session('pc-universo-infantil')
    t0=time.time()
    await pg.click('#btnFlag')
    await g.waitvar('fase',1,60); await g.waitvar('bloqueo',0,30); await pg.wait_for_timeout(300)
    await pg.screenshot(path='/tmp/p3a.png')
    # patrón A: respuesta 1 (amarilla)
    await g.click('Opción azul'); await pg.wait_for_timeout(900); print('fallo hecho',await g.var('hecho'))
    await g.click('Opción amarilla'); await g.waitvar('resp',2,40)
    await g.waitvar('bloqueo',0,20); await pg.wait_for_timeout(600)
    await g.click('Opción azul'); await g.waitvar('resp',4,40)
    await g.waitvar('bloqueo',0,20); await pg.wait_for_timeout(600)
    await g.click('Opción verde'); await g.waitvar('fase',2,60)
    await g.waitvar('bloqueo',0,20); await pg.wait_for_timeout(1500)
    await pg.screenshot(path='/tmp/p3b.png')
    await g.click('Sol grande'); await pg.wait_for_timeout(900); print('orden_n tras fallo',await g.var('orden_n'))
    for n in ['Luna','Tierra','Sol grande']:
        await g.waitvar('bloqueo',0,10); await g.click(n); await pg.wait_for_timeout(800)
    await g.waitvar('fase',3,60); await g.waitvar('bloqueo',0,30) if False else None
    await pg.wait_for_timeout(1500)
    for i in range(3):
        await g.until(lambda: pg.evaluate('PQ.S.project.vars.find(v=>v.name=="bloqueo").value==0'),30); await g.click('Cohete'); await pg.wait_for_timeout(900)
    await g.waitvar('fase',4,60); await g.waitvar('bloqueo',0,30); await pg.wait_for_timeout(800)
    await pg.screenshot(path='/tmp/p3c.png')
    async def seq(names):
        for n in names:
            await g.waitvar('bloqueo',0,15); await g.click(n); await pg.wait_for_timeout(900)
    await g.click('Flecha arriba'); await pg.wait_for_timeout(800); print('pos tras fallo',await g.var('pos'))
    await seq(['Flecha derecha','Flecha derecha','Flecha arriba','Flecha arriba'])
    await g.waitvar('hecho',1,10)
    await g.waitvar('largo',5,40); await g.waitvar('pos',0,10); await g.waitvar('bloqueo',0,20); await pg.wait_for_timeout(1500)
    await pg.screenshot(path='/tmp/p3d.png')
    await seq(['Flecha arriba','Flecha derecha','Flecha arriba','Flecha derecha','Flecha arriba'])
    await g.until(lambda: pg.evaluate('!PQ.RT.threads.length'),60,'fin')
    print('fin %.1fs'%(time.time()-t0), errs); await b.close(); await p.stop()
asyncio.run(main())
