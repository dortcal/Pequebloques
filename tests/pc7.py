import asyncio, time, sys
from pchelp import *
from solve_cole import LV, minsol
BTN={1:'Tarjeta avanzar',2:'Tarjeta retroceder',3:'Tarjeta girar izquierda',4:'Tarjeta girar derecha'}
COL=['','amarillo','azul','verde','marrón','gris']
async def main():
    p,b,pg,g,errs=await session('pc-cole-primaria',1200,800)
    t0=time.time(); log=lambda *a: print('%5.1fs'%(time.time()-t0),*a)
    await pg.click('#btnFlag')
    await g.waitvar('fase',1,60); await g.waitvar('bloqueo',0,60); log('F1 listo')
    await pg.screenshot(path='/tmp/c1a.png')
    for ronda in (1,2):
        await g.waitvar('ronda',ronda,60); await g.waitvar('bloqueo',0,60)
        for k in range(1,5):
            async def vis(): return (await g.pos('Residuo %d'%k))[2]
            await g.until(vis,10,'visible'); await g.click('Residuo %d'%k); await pg.wait_for_timeout(150)
            t=await g.var('t%d'%k); assert await g.var('selk')==k and await g.var('sel')==t,(k,t)
            if k==1:
                wrong=1 if t!=1 else 2
                await g.click('Contenedor '+COL[wrong]); await pg.wait_for_timeout(300)
                assert await g.var('err')==1; assert await g.var('restan')==5-k, 'restan tras error'
                await g.click('Contenedor '+COL[wrong]); await pg.wait_for_timeout(300)
                assert await g.var('err')==2
                await pg.wait_for_timeout(1500); sp=await g.spoken(); assert any('parpadea' in x for x in sp[-6:]),sp[-6:]
                log('ronda',ronda,'errores y pista ok')
            await g.click('Contenedor '+COL[t]); await pg.wait_for_timeout(700)
            assert await g.var('restan')==4-k,(k,await g.var('restan'))
        log('ronda',ronda,'completa')
        if ronda==1: await pg.screenshot(path='/tmp/c1b.png')
    await g.waitvar('fase',2,60); await g.waitvar('bloqueo',0,60); await pg.wait_for_timeout(300)
    await pg.screenshot(path='/tmp/c2a.png')
    await g.click('Paso 3'); await pg.wait_for_timeout(300); assert await g.var('sig')==1 and await g.var('err')==1
    await g.click('Paso 4'); await pg.wait_for_timeout(300); assert await g.var('err')==2
    await pg.wait_for_timeout(2500)
    for k in (1,2,3,4):
        await g.click('Paso %d'%k); await g.waitvar('sig',k+1,10); await pg.wait_for_timeout(900)
    await pg.screenshot(path='/tmp/c2b.png')
    await g.waitvar('sig',5,5); log('F2 secuencia ok')
    await g.waitvar('nivel',1,90); await g.waitvar('fase',3,90)
    async def card(seq):
        for c in seq:
            await g.click(BTN[c]); await pg.wait_for_timeout(200)
    async def run():
        await g.click('Botón Ir'); await g.waitvar('modo',1,8)
    names=['T1','T2','T3','T4','M1','D1','M2','M3']
    for i,nm in enumerate(names):
        await g.waitvar('nivel',i+1,120); await g.waitvar('modo',0,120)
        L=LV[nm]; await pg.wait_for_timeout(200)
        if i in (0,3,4,6,7): await pg.screenshot(path='/tmp/c3_%s.png'%nm)
        if nm=='T1':
            await card([1,1]); await run(); await g.waitvar('modo',0,30); assert await g.var('hecho')==0; log('T1 corto ok (sin llegar)')
            await card([1]); await run()
        elif nm=='D1':
            assert await g.var('n')==6
            await run(); await g.waitvar('modo',0,30); assert await g.var('hecho')==0; log('D1 programa con bug falla (equivocado)')
            await pg.wait_for_timeout(2500); sp=await g.spoken(); assert ' '.join(sp[-8:]).find('contenedor de este')>=0,sp[-8:]
            for _ in range(4): await g.click('Botón Quitar')
            await card([4,1,1,1]); await run()
        elif nm=='M1':
            # equivocarse de contenedor
            await card([1,1,4,1,1,1,3,1]) ; 
            n=await g.var('n'); log('M1 n',n)
            await g.click('Botón Borrar')
            await card([1,2,2,2]); await run(); await g.waitvar('modo',0,30); assert await g.var('hecho')==0
            await g.click('Botón Borrar')
            await card([1,1,4,1,1,1]); await run(); await g.waitgt('carry',0,20); await pg.wait_for_timeout(250); await pg.screenshot(path='/tmp/c3_carga.png')
        elif nm=='M2':
            await card([1,1,1]); await run(); await g.waitvar('modo',0,30); assert await g.var('hecho')==0
            await pg.wait_for_timeout(1500); sp=await g.spoken(); assert ' '.join(sp[-8:]).find('obstáculo')>=0,sp[-8:]; log('M2 choque ok')
            await g.click('Botón Borrar'); n,_,sol=minsol(L,L['cap']); await card(sol); await run()
        else:
            n,_,sol=minsol(L,L['cap']); await card(sol); await run()
        await g.waitvar('hecho',1,60); log(nm,'hecho')
    await g.until(lambda: pg.evaluate('!PQ.RT.threads.length'),120,'fin')
    log('fin',errs); print((await g.spoken())[-2:])
    await b.close(); await p.stop()
asyncio.run(main())
