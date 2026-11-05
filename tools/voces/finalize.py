import json,os,sys,shutil,re
sys.path.insert(0,'/tmp/pq')
import gen_pq as G
A='/tmp/pq/audio'
jobs=json.load(open('/tmp/pq/jobs.json'))+json.load(open('/tmp/pq/jobs2.json'))
# claves antiguas (con «») -> claves limpias
def rawkey(v,t):
    s=v+'|'+re.sub(r'\s+',' ',t).strip(); return '%08x%08x'%(G.h32(s,0x811c9dc5),G.h32(s,0x9747b28c))
ren=0
for v,t in jobs:
    k=G.key(v,t); r=rawkey(v,t)
    if r!=k and os.path.exists(f'{A}/{r}.mp3') and not os.path.exists(f'{A}/{k}.mp3'): os.rename(f'{A}/{r}.mp3',f'{A}/{k}.mp3'); ren+=1
keys=sorted({G.key(v,t) for v,t in jobs if os.path.exists(f'{A}/{G.key(v,t)}.mp3')})
missing=[(v,t) for v,t in jobs if not os.path.exists(f'{A}/{G.key(v,t)}.mp3')]
files={f[:-4] for f in os.listdir(A) if f.endswith('.mp3')}
extra=sorted(files-set(keys))
for e in extra: os.remove(f'{A}/{e}.mp3')
man='/* PequeBloques — diseñado por David OZC. Índice de las voces neuronales pregrabadas (generado; no editar). */\n(function(g){g.PQ=g.PQ||{};var s=document.currentScript&&document.currentScript.src;g.PQ.AUDIO_BASE=s?s.replace(/manifest\\.js[^/]*$/,""):"audio/";g.PQ.AUDIO={v:1,n:%d,k:{%s}};})(window);\n'%(len(keys),','.join('"%s":1'%k for k in keys))
open('/home/claude/pequebloques/audio/manifest.js','w').write(man) if os.path.isdir('/home/claude/pequebloques/audio') else None
print('renombrados',ren,'| claves',len(keys),'| faltan',len(missing),'| sobrantes borrados',len(extra))
for m in missing[:5]: print('  falta',m)
tot=sum(os.path.getsize(f'{A}/{k}.mp3') for k in keys); print('MB',round(tot/1e6,2))
