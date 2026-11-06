import asyncio, sys
sys.path.insert(0, __file__.rsplit('/',1)[0])
from pchelp import session
async def main():
    p,b,pg,g,errs = await session('mercado-sano')
    await pg.evaluate('PQ.RT.greenFlag()'); await g.waitvar('paso',1,60)
    await pg.evaluate("PQ.S.project.vars.find(v=>v.name=='Explorado').value=5"); await pg.keyboard.down('ArrowUp')
    await pg.wait_for_timeout(2500)
    await pg.locator('#stagewrap').screenshot(path=sys.argv[1]+'_a.png')
    await pg.evaluate("(()=>{const l=PQ.S.project.sprites.find(s=>s.name=='Lucía'); l.x=0; l.y=40;})()"); await pg.wait_for_timeout(3000)
    await pg.locator('#stagewrap').screenshot(path=sys.argv[1]+'_b.png')
    print(errs); await b.close(); await p.stop()
asyncio.run(main())
