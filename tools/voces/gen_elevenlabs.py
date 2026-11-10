#!/usr/bin/env python3
"""PequeBloques — diseñado por David OZC.
Genera los clips de voz con ElevenLabs usando el catálogo de elevenlabs.json y los guarda
con el MISMO nombre de archivo que usa el programa (clipKey = hash de «VOZ|texto»), de modo que
al copiarlos a audio/ y regenerar manifest.js (finalize.py) se usan sin tocar el código.

Uso:   ELEVENLABS_API_KEY=... python3 gen_elevenlabs.py trabajos.json salida/ [--solo NARRADOR|KITTEN|...]
       trabajos.json = [["KITTEN","texto"], ["NARRADOR","texto"], ...]   (igual que los jobs de gen_pq.py)
La clave nunca se guarda en el repositorio. Solo usa la biblioteca estándar.
NO se ha ejecutado contra la API (sin acceso de red ni clave en el entorno de desarrollo): probar con 1-2 textos primero.
"""
import json, os, re, sys, urllib.request

def h32(s, seed):
    h = seed
    b = s.encode('utf-16-le')
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8); h = (h * 16777619) & 0xffffffff
    return h

def key(voice, text):
    s = voice + '|' + re.sub(r'\s+', ' ', text.replace('«', '').replace('»', '')).strip()
    return '%08x%08x' % (h32(s, 0x811c9dc5), h32(s, 0x9747b28c))

def main():
    if len(sys.argv) < 3: sys.exit(__doc__)
    api = os.environ.get('ELEVENLABS_API_KEY') or sys.exit('Falta ELEVENLABS_API_KEY')
    cat = json.load(open(os.path.join(os.path.dirname(__file__), 'elevenlabs.json'), encoding='utf-8'))
    jobs = json.load(open(sys.argv[1], encoding='utf-8')); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
    solo = sys.argv[sys.argv.index('--solo') + 1] if '--solo' in sys.argv else None
    voices = {k: v['voice_id'] for k, v in cat['personajes'].items()}; voices['NARRADOR'] = cat['narrador']['voice_id']
    st = cat['ajustes_por_defecto']
    for voz, texto in jobs:
        if solo and voz != solo: continue
        vid = voices.get(voz) or sys.exit('Voz desconocida: ' + voz)
        dst = os.path.join(out, key(voz, texto) + '.mp3')
        if os.path.exists(dst): continue
        body = json.dumps({'text': texto, 'model_id': cat['modelo'], 'language_code': cat['idioma'],
                           'voice_settings': {'stability': st['stability'], 'similarity_boost': st['similarity_boost'], 'speed': st['speed']}}).encode()
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_64', body,
                                     {'xi-api-key': api, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
        with urllib.request.urlopen(req, timeout=60) as r: open(dst, 'wb').write(r.read())
        print('ok', voz, texto[:50])

if __name__ == '__main__': main()
