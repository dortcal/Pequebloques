import asyncio
from pchelp import *
async def main():
    p,b,pg,g,errs=await session('pc-reciclaje-infantil')
    await pg.click('#btnFlag'); await g.waitvar('fase',1,60); await g.waitvar('bloqueo',0,30); await pg.wait_for_timeout(300)
    await pg.screenshot(path='/tmp/p1a.png')
    await g.click('Botella'); await g.waitvar('sel',1,10); await g.click('Contenedor amarillo'); await g.waitvar('fase',2,40); await pg.wait_for_timeout(1500)
    await g.click('Periódico'); await pg.wait_for_timeout(300); await pg.screenshot(path='/tmp/p1b.png')
    for name,cont in [('Lata','Contenedor amarillo'),('Periódico','Contenedor azul'),('Tarro','Contenedor verde'),('Caja','Contenedor azul'),('Brik','Contenedor amarillo')]:
        await g.waitvar('bloqueo',0,20); await g.click(name); await pg.wait_for_timeout(200); await g.waitvar('bloqueo',0,10); await g.click(cont); await pg.wait_for_timeout(700)
    await g.waitvar('fase',3,40); await g.waitvar('resp',1,40); await pg.wait_for_timeout(500); await pg.screenshot(path='/tmp/p1c.png')
    await g.waitvar('bloqueo',0,20); await g.click('Contenedor amarillo'); await g.waitvar('resp',3,60); await pg.wait_for_timeout(500); await pg.screenshot(path='/tmp/p1d.png')
    await g.waitvar('bloqueo',0,20); await g.click('Contenedor verde'); await g.waitvar('fase',4,60); await pg.wait_for_timeout(2500); await pg.screenshot(path='/tmp/p1e.png')
    await b.close(); await p.stop()
asyncio.run(main())
