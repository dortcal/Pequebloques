import asyncio, sys, json
sys.path.insert(0, __file__.rsplit('/',1)[0])
from pchelp import session
async def main():
    p,b,pg,g,errs = await session('canario-viajero')
    await pg.evaluate("PQ.S.target.scripts.length")
    snap0=await pg.evaluate("JSON.stringify(PQ.S.target.scripts)")
    n0=await pg.evaluate("PQ.S.target.scripts.length")
    # sprite del cuento sin scripts en el seleccionado? elegimos uno con scripts
    idx=await pg.evaluate("(()=>{const sp=PQ.S.project.sprites.findIndex(s=>s.scripts&&s.scripts.some(x=>x.blocks.length>2));return sp})()")
    print('sprite con script largo',idx)
    await pg.evaluate("PQ.selectTarget? PQ.selectTarget(PQ.S.project.sprites[%d]) : 0"%idx)
    await pg.wait_for_timeout(400)
    snap0=await pg.evaluate("JSON.stringify(PQ.S.target.scripts)")
    async def drag(selector_nth, dx, dy, steps=6):
        els=pg.locator('#wsin .block')
        el=els.nth(selector_nth); bb=await el.bounding_box()
        x,y=bb['x']+14,bb['y']+bb['height']/2
        await pg.mouse.move(x,y); await pg.mouse.down()
        for i in range(1,steps+1): await pg.mouse.move(x+dx*i/steps,y+dy*i/steps)
        await pg.mouse.up(); await pg.wait_for_timeout(200)
    # hat (primer bloque) 35px
    await drag(0, 30, 25)
    s1=await pg.evaluate("JSON.stringify(PQ.S.target.scripts)")
    print('hat 39px intacto:', s1==snap0)
    if s1!=snap0:
        a=json.loads(snap0); c=json.loads(s1); print(len(a),len(c)); print([ (x.get('x'),x.get('y'),len(x['blocks'])) for x in a]); print([ (x.get('x'),x.get('y'),len(x['blocks'])) for x in c])
    await drag(0, 200, 120)
    s2=await pg.evaluate("JSON.stringify(PQ.S.target.scripts)")
    print('hat 200px se mueve (intencionado):', s2!=snap0, 'errs',errs)
    await b.close(); await p.stop()
asyncio.run(main())
