import itertools, sys
D={0:(0,-1),1:(1,0),2:(0,1),3:(-1,0)}
def expand(prog):
    out=[]; ult=0
    for c in prog:
        if c==5:
            if ult: out+= [ult]*2
        else: out.append(c); ult=c
    return out
def run(L,prog):
    prog=expand(prog)
    x,y=L['start']; h=L.get('h',0); carry=0; ent=0
    items={tuple(p[:2]):p[2] for p in L.get('items',[])}
    bins={tuple(p[:2]):p[2] for p in L.get('bins',[])}
    obst={tuple(p) for p in L.get('obst',[])}
    for c in prog:
        if c==1: dx,dy=D[h]; x+=dx; y+=dy
        elif c==2: dx,dy=D[h]; x-=dx; y-=dy
        elif c==3: h=(h-1)%4
        elif c==4: h=(h+1)%4
        if not(0<=x<=4 and 0<=y<=4): return 'salida'
        if (x,y) in obst: return 'choque'
        if carry==0 and (x,y) in items: carry=items.pop((x,y))
        elif carry and (x,y) in bins:
            if bins[(x,y)]==carry: carry=0; ent+=1
            else: return 'equivocado'
    tot=len(L.get('items',[]))
    if tot==0: return 'ok' if (x,y)==tuple(L['goal']) else 'corto'
    return 'ok' if ent==tot else ('sinentrega' if carry else 'faltan')
def minsol(L,cap,syms=(1,2,3,4,5)):
    for n in range(1,cap+1):
        sols=[p for p in itertools.product(syms,repeat=n) if run(L,p)=='ok']
        if sols: return n,len(sols),sols[0]
    return None
LV={
 'T1':dict(start=(0,4),h=0,goal=(0,1),cap=5),
 'T2':dict(start=(0,4),h=0,goal=(3,4),cap=6),
 'T3':dict(start=(4,0),h=3,goal=(4,2),cap=6),
 'T4':dict(start=(1,1),h=0,goal=(1,3),cap=4),
 'M1':dict(start=(0,4),h=0,items=[(0,2,4)],bins=[(3,2,4),(3,4,2)],cap=8),
 'D1':dict(start=(1,4),h=0,items=[(1,2,1)],bins=[(4,2,1),(0,2,2)],cap=8),
 'M2':dict(start=(0,4),h=0,items=[(3,3,1)],bins=[(4,3,1),(2,2,3)],obst=[(3,2),(2,3),(0,3)],cap=10),
 'M3':dict(start=(0,4),h=0,items=[(2,2,1),(2,4,4)],bins=[(2,1,1),(1,4,4),(3,4,5)],obst=[(0,3),(3,2)],cap=10),
}
LV.update({
 'D2':dict(start=(0,4),h=0,items=[(2,3,2)],bins=[(4,2,2),(4,4,5)],obst=[(2,2),(3,2)],cap=10),
 'B1':dict(start=(0,4),h=0,goal=(0,1),cap=2),
 'B2':dict(start=(0,4),h=0,items=[(1,1,2)],bins=[(3,1,2),(4,3,3)],obst=[(0,0),(2,4)],cap=5),
 'B3':dict(start=(4,4),h=0,goal=(1,1),cap=6),
 'B4':dict(start=(0,4),h=0,items=[(2,1,1),(4,2,5)],bins=[(3,1,1),(4,1,5),(4,3,3)],obst=[(1,4),(1,2)],cap=9),
})
if __name__=='__main__':
    for k,L in LV.items(): print(k,minsol(L,L['cap']))
    print('D1 bug',run(LV['D1'],[1,1,3,1,1,1]),'fix',run(LV['D1'],[1,1,4,1,1,1]))
