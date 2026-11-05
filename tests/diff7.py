import asyncio, random, sys, time
from pchelp import *
from solve_cole import LV, run
NAMES=['T1','T2','T3','T4','M1','D1','M2','D2','M3','B1','B2','B3','B4']
nm=sys.argv[1]; N=int(sys.argv[2]); seed=int(sys.argv[3]) if len(sys.argv)>3 else 1
async def main():
    p,b,pg,g,errs=await session('pc-cole-primaria',1200,800)
    await pg.evaluate('''()=>{window.__ev=[];const o=PQ.RT.broadcast;PQ.RT.broadcast=function(n){window.__ev.push(n);return o.apply(this,arguments)}}''')
    L=LV[nm]; lvl=NAMES.index(nm)+1; cap=L['cap']; random.seed(seed)
    syms=[1,2,3,4,5] if lvl>=10 or nm in('B1','B2','B3','B4') else [1,2,3,4]
    bad=0; t0=time.time()
    progs=[]
    for i in range(N):
        n=random.randint(1,cap); progs.append([random.choice(syms) for _ in range(n)])
    for prog in progs:
        exp=run(L,prog)
        await pg.evaluate('''([lvl,cap,prog])=>{const V=n=>PQ.S.project.vars.find(v=>v.name===n);
          const set=(n,x)=>{V(n).value=x};
          PQ.RT.stopAll(); window.__ev.length=0;
          set('nivel',lvl);set('hecho',0);set('modo',0);set('max',cap);set('n',prog.length);set('fallo',0);
          for(let k=1;k<=10;k++) set('p'+k, prog[k-1]||0);
          set('tot', 0);
          PQ.RT.broadcast('lay');PQ.RT.broadcast('refresca');}''',[lvl,cap,prog])
        # tot depende del nivel: lo fija el guion; lo ponemos aquí
        tot=len(L.get('items',[]))
        await pg.evaluate('(t)=>{PQ.S.project.vars.find(v=>v.name==="tot").value=t}',tot)
        await pg.wait_for_timeout(250)
        await pg.evaluate("PQ.RT.broadcast('ir')")
        async def fin():
            ev=await pg.evaluate('window.__ev'); h=await g.var('hecho'); m=await g.var('modo')
            return h==1 or (m==0 and any(e in ev for e in ('choque','salida','corto','faltan','sinentrega','equivocado')))
        await g.until(fin,60,'fin '+str(prog))
        ev=await pg.evaluate('window.__ev'); h=await g.var('hecho')
        got='ok' if h==1 else next(e for e in ('choque','salida','corto','faltan','sinentrega','equivocado') if e in ev)
        if got!=exp:
            bad+=1; print('DIFERENCIA',nm,prog,'esperado',exp,'juego',got,flush=True)
    print(nm,'programas',N,'diferencias',bad,'%.0fs'%(time.time()-t0),errs); await b.close(); await p.stop()
asyncio.run(main())
