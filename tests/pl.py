import random, itertools
from collections import deque
MV={1:(-1,0),2:(0,-1),3:(0,1),4:(1,0)}
def step(st,c,obst,items,tot,userep=True):
    (x,y,ult,picked)=st
    seq=[]
    if c==5:
        if ult==0: return None
        seq=[ult]*2; nult=ult
    else: seq=[c]; nult=c
    for m in seq:
        x+=MV[m][0]; y+=MV[m][1]
        if not(0<=x<=4 and 0<=y<=4) or (x,y) in obst: return None
        if (x,y) in items: picked|=1<<items.index((x,y))
    return (x,y,nult,picked)
def solve(L,cap,rep=True,want_path=False):
    start=(L['start'][0],L['start'][1],0,0); par={}; items=[tuple(i) for i in L['items']]; obst={tuple(o) for o in L['obst']}
    full=(1<<len(items))-1; seen={start}; q=deque([(start,0)])
    while q:
        st,n=q.popleft()
        if n>=cap: continue
        for c in ((1,2,3,4,5) if rep else (1,2,3,4)):
            ns=step(st,c,obst,items,len(items))
            if not ns or ns in seen: continue
            par[ns]=(st,c)
            if (ns[0],ns[1])==tuple(L['goal']) and ns[3]==full:
                path=[]; cur=ns
                while cur in par: cur,cc=par[cur][0],par[cur][1]; path.append(cc)
                return path[::-1] if want_path else n+1
            seen.add(ns); q.append((ns,n+1))
    return None
if __name__=='__main__':
    random.seed(2)
    cells=[(c,r) for c in range(5) for r in range(5)]
    def gen(ni,no,cap,need_rep,want):
        out=[]
        for _ in range(60000):
            cs=random.sample(cells,2+ni+no)
            s,g=cs[0],cs[1]
            if s!=(0,4): continue
            L=dict(start=s,goal=g,items=cs[2:2+ni],obst=cs[2+ni:])
            a=solve(L,cap,True)
            if a is None or not(want[0]<=a<=want[1]): continue
            if need_rep:
                b=solve(L,cap,False)
                if b is not None: continue
            out.append((a,L))
        return out
    for name,ni,no,cap,rep,want in (('L4',3,3,9,False,(8,9)),('L5',2,2,5,True,(5,5)),('L6',4,3,10,True,(9,10))):
        r=gen(ni,no,cap,rep,want); print(name,len(r))
        for a,L in r[:4]: print(a,L)
