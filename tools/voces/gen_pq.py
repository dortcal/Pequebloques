import sys, json, os, re, time
sys.path.insert(0,'/tmp/tts')
from multiprocessing import Pool
import numpy as np
import prosody as P
from num2words import num2words

# ---- normalización general es-ES (números, símbolos, mayúsculas) ----
SYM = [(r'\s\+\s',' más '),(r'\s-\s',' menos '),(r'\s\*\s',' por '),(r'\s/\s',' entre '),(r'\s<\s',' menor que '),(r'\s>\s',' mayor que '),(r'\s=\s',' igual a '),(r'(\d)\s*%',r'\1 por ciento'),(r'%',' por ciento')]
STAND={'+':'más','-':'menos','/':'entre','×':'por','*':'por','÷':'entre'}
def norm(t):
    t=t.strip()
    if t in STAND: return STAND[t]
    t=re.sub(r'^<\s*','menor que ',t); t=re.sub(r'^>\s*','mayor que ',t); t=re.sub(r'^=\s*','igual a ',t)
    t=re.sub(r'\{/?[DI]\}','',t); t=t.replace('«','').replace('»','')
    for a,b in SYM: t=re.sub(a,b,t)
    t=re.sub(r'\b1\b(?=\s+[a-záéíóúñ]+)',lambda m:'una' if re.match(r'\s+[a-záéíóúñ]+a(s)?\b',t[m.end():]) else 'un',t)
    t=re.sub(r'\b(\d+)\b',lambda m:num2words(int(m.group(1)),lang='es'),t)
    t=re.sub(r'\b[A-ZÁÉÍÓÚ]{3,}\b',lambda m:m.group(0).lower(),t)
    t=t.replace('…','...').replace('*','').replace('_',' ')
    return re.sub(r'\s+',' ',t).strip()
P.norm_tts=norm

# ---- hash idéntico al de JS (FNV-1a 32 bits, dos semillas, sobre unidades UTF-16) ----
def h32(s,seed):
    h=seed
    for u in s.encode('utf-16-le')[::1][0:0] or []: pass
    b=s.encode('utf-16-le'); units=[b[i]|(b[i+1]<<8) for i in range(0,len(b),2)]
    for u in units:
        h^=u; h=(h*16777619)&0xffffffff
    return h
def key(voice,text):
    s=voice+'|'+re.sub(r'\s+',' ',text.replace('«','').replace('»','')).strip()
    return '%08x%08x'%(h32(s,0x811c9dc5),h32(s,0x9747b28c))

# ---- personajes: (voz Kokoro, factor de tono, formantes, tempo, ffmpeg extra, expresividad)
CH={
 'KITTEN':('ef_dora',1.10,1.07,1.02,'',1.0),
 'ALTO'  :('em_alex',1.30,1.20,1.04,'',1.0),
 'TENOR' :('em_santa',0.88,0.95,0.92,',aecho=0.85:0.75:14:0.35,tremolo=f=38:d=0.18',0.35),
 'SQUEAK':('ef_dora',1.42,1.26,1.08,'',0.85),
 'GIANT' :('em_alex',0.64,0.82,0.84,',aecho=0.8:0.6:45:0.2',0.6),
 'PIPO'  :('ef_dora',1.22,1.12,1.00,'',1.0),
 'PIPOM' :('em_alex',1.14,1.06,1.00,'',1.0),
}
_orig_spec=P.spec_for
EX={'v':1.0}
def spec_scaled(stype,role,short,rng):
    d=_orig_spec(stype,role,short,rng); e=EX['v']
    if e!=1.0:
        f0=d['f']; d=dict(d); d['f']=(lambda u,f0=f0,e=e: e*f0(u)); d['base']=d['base']*e; d['gain']=d['gain']*e
    return d
P.spec_for=spec_scaled

def job(a):
    voice,text=a; out='/tmp/pq/audio/%s.mp3'%key(voice,text)
    if os.path.exists(out): return key(voice,text),0
    v,pf,fr,tempo,extra,ex=CH[voice]; EX['v']=ex
    t0=time.time()
    y=P.synth_text(text,v,seed_extra=voice); y=P.character(y,pf,fr)
    P.to_mp3(y,out,tempo=tempo,extra=extra,br='40k')
    return key(voice,text),round(time.time()-t0,1)

if __name__=='__main__':
    jobs=[tuple(x) for x in json.load(open(sys.argv[1]))]
    n=int(sys.argv[2]) if len(sys.argv)>2 else 2
    t0=time.time(); done=0
    with Pool(n) as pool:
        for k,dt in pool.imap_unordered(job,jobs,chunksize=1):
            done+=1
            if done%20==0 or done==len(jobs): print(f'{done}/{len(jobs)} {int(time.time()-t0)}s',flush=True)
    print('FIN',len(jobs),int(time.time()-t0),'s')
