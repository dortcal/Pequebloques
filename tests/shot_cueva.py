import asyncio, sys
sys.path.insert(0, __file__.rsplit('/',1)[0])
from pchelp import session
async def main():
    p,b,pg,g,errs = await session('tesoro-teide')
    await pg.evaluate('PQ.RT.greenFlag()'); await pg.wait_for_timeout(300)
    await pg.evaluate("PQ.RT.broadcast('bosque')"); await pg.wait_for_timeout(1500)
    await pg.evaluate("PQ.RT.broadcast('teide')"); await pg.wait_for_timeout(1500)
    await pg.evaluate("PQ.RT.broadcast('cueva')"); await pg.wait_for_timeout(2500)
    print(await pg.evaluate("PQ.S.project.sprites.map(s=>[s.name,s.x,s.y,s.size,s.visible])"))
    await pg.locator('#stagewrap').screenshot(path=sys.argv[1])
    print(errs); await b.close(); await p.stop()
asyncio.run(main())
