import asyncio, sys
sys.path.insert(0, __file__.rsplit('/',1)[0])
from pchelp import session
async def main():
    p,b,pg,g,errs = await session('canario-viajero')
    r = await pg.evaluate("""()=>{const out=[];for(const it of PQ.SOUND_LIB){const s=PQ.makeSound(it.name);const w=s.bytes; 
      // wav 16-bit: analizar picos y silencio
      const dv=new DataView(w.buffer,w.byteOffset,w.byteLength);let pk=0,nz=0,n=(w.length-44)>>1;for(let i=0;i<n;i++){const v=Math.abs(dv.getInt16(44+i*2,true));if(v>pk)pk=v;if(v>300)nz++;}
      out.push([it.name,it.cat,+(n/s.rate).toFixed(2),pk,Math.round(100*nz/n),isFinite(pk)]);}return out}""")
    bad=[x for x in r if x[3]<8000 or x[3]>32767 or x[4]<2 or x[2]>6 or not x[5]]
    print(len(r),'sonidos; cats',sorted(set(x[1] for x in r)))
    for x in r: print(x)
    print('SOSPECHOSOS',bad,'errs',errs)
    await b.close(); await p.stop()
asyncio.run(main())
