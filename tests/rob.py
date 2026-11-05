import asyncio
from pchelp import *
async def main():
    p,b,pg,g,errs=await session('pc-cole-primaria',1200,800)
    await pg.click('#btnFlag'); await pg.wait_for_timeout(1500)
    print('intro', await g.pos('Robot')); await pg.screenshot(path='/tmp/rob.png')
    await g.waitvar('fase',1,60); await pg.wait_for_timeout(500); print('F1', await g.pos('Robot'))
    print(errs); await b.close(); await p.stop()
asyncio.run(main())
