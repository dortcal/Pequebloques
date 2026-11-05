import asyncio
from pchelp import *
async def main():
    p,b,pg,g,errs=await session('pc-reciclaje-primaria',1200,800)
    await pg.click('#btnFlag'); await g.waitvar('modo',0,60)
    print('icono', await pg.evaluate('!!document.getElementById("readbtn")'), 'panel oculto', await pg.evaluate('document.getElementById("readpanel").hidden'))
    await pg.click('#readbtn'); await pg.wait_for_timeout(600)
    print('panel visible', not await pg.evaluate('document.getElementById("readpanel").hidden'))
    print(await pg.evaluate('document.querySelector("#readpanel .rtxt").textContent'))
    await pg.screenshot(path='/tmp/read1.png')
    n=len(await g.spoken()); await pg.click('#readpanel .rear'); await pg.wait_for_timeout(500); print('releida', len(await g.spoken())>n)
    await pg.click('#readpanel .rtxt'); print('cerrado', await pg.evaluate('document.getElementById("readpanel").hidden'))
    await pg.evaluate('PQ.openExample("conejo")') if False else None
    ids=await pg.evaluate('PQ.EX.filter(e=>!e.pc).map(e=>e.id)'); await pg.evaluate(f'PQ.openExample("{ids[0]}")'); await pg.wait_for_timeout(400)
    print('en otro ejemplo hay icono:', await pg.evaluate('!!document.getElementById("readbtn")'))
    print(errs); await b.close(); await p.stop()
asyncio.run(main())
