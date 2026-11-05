import asyncio
from pchelp import *
async def main():
    p,b,pg,g,errs=await session('pc-cole-primaria',1200,800)
    print('icono', await pg.evaluate('!!document.getElementById("readbtn")'))
    await pg.click('#btnFlag'); await g.waitvar('fase',1,60); await pg.wait_for_timeout(800)
    await pg.click('#readbtn'); await pg.wait_for_timeout(600)
    print(await pg.evaluate('document.querySelector("#readpanel .rtxt").textContent'))
    await pg.screenshot(path='/tmp/rd2.png'); print(errs); await b.close(); await p.stop()
asyncio.run(main())
