import asyncio, sys
sys.path.insert(0, __file__.rsplit('/',1)[0])
from pchelp import session
async def tesoro(how):
    p,b,pg,g,errs = await session('tesoro-teide')
    await pg.evaluate('PQ.RT.greenFlag()')
    await g.waitvar('paso',1,60); await g.click('Yeray')
    await g.waitvar('paso',3,60); await g.click('Perro')
    await g.waitvar('paso',5,90)
    if how=='stage':
        bb=await pg.locator('#stagewrap').bounding_box()
        await pg.mouse.click(bb['x']+bb['width']*0.5, bb['y']+bb['height']*0.45)
    else: await g.click(how)
    await g.waitvar('paso',7,60); await g.click('Cofre'); await g.waitvar('paso',8,20)
    print('tesoro OK con',how,'errs',errs); await b.close(); await p.stop()
async def penalti():
    p,b,pg,g,errs = await session('penalti'); await pg.evaluate('PQ.RT.greenFlag()')
    await g.waitvar('listo',1,60)
    await g.click('Mira'); x=await pg.evaluate("PQ.S.project.sprites.find(s=>s.name=='Mira').x")
    await g.click('Balón'); await g.waitvar('Tiros',4,20)
    print('penalti OK mira x tras tocar:',x,'errs',errs); await b.close(); await p.stop()
async def main():
    await penalti()
asyncio.run(main())
