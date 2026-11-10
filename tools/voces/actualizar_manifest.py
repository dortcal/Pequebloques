#!/usr/bin/env python3
"""PequeBloques — diseñado por David OZC. Reescribe audio/manifest.js con los .mp3 que haya en audio/.
Uso: python3 tools/voces/actualizar_manifest.py   (desde la raíz del repositorio, después de copiar los clips nuevos)"""
import os
A = os.path.join(os.path.dirname(__file__), '..', '..', 'audio')
keys = sorted(f[:-4] for f in os.listdir(A) if f.endswith('.mp3'))
man = ('/* PequeBloques — diseñado por David OZC. Índice de las voces neuronales pregrabadas (generado; no editar). */\n'
       '(function(g){g.PQ=g.PQ||{};var s=document.currentScript&&document.currentScript.src;g.PQ.AUDIO_BASE=s?s.replace(/manifest\\.js[^/]*$/,""):"audio/";'
       'g.PQ.AUDIO={v:1,n:%d,k:{%s}};})(window);\n') % (len(keys), ','.join('"%s":1' % k for k in keys))
open(os.path.join(A, 'manifest.js'), 'w', encoding='utf-8').write(man)
print('manifest.js:', len(keys), 'clips')
