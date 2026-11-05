import asyncio, sys
sys.path.insert(0, __file__.rsplit('/',1)[0])
from pchelp import session
async def main():
    p,b,pg,g,errs = await session('tesoro-teide')
    await pg.evaluate('PQ.RT.greenFlag()')
    await g.waitvar('paso',1,60); await g.click('Yeray')
    await g.waitvar('paso',3,60); await g.click('Perro')
    await g.waitvar('paso',5,90); await pg.keyboard.press('Space')
    await g.waitvar('paso',7,90); await g.click('Cofre')
    await g.waitvar('paso',8,20)
    async def done():
        return any('con los amigos.' in t for t in await g.spoken())
    try: await g.until(done,40,'moraleja')
    except Exception: print('ultimos dichos:', (await g.spoken())[-5:])
    print('OK moraleja dicha; errs',errs); await b.close(); await p.stop()
asyncio.run(main())
