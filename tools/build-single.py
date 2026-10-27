#!/usr/bin/env python3
"""Genera dist/PequeBloques.html: toda la aplicación en un único archivo (funciona con doble clic)."""
import re, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(root)
s = open('index.html', encoding='utf-8').read()
s = re.sub(r'<link rel="stylesheet" href="css/style.css">', lambda m: '<style>\n' + open('css/style.css', encoding='utf-8').read() + '\n</style>', s)
s = re.sub(r'<script src="(js/[a-z]+\.js)"></script>', lambda m: '<script>\n' + open(m.group(1), encoding='utf-8').read().replace('</script>', '<\\/script>') + '\n</script>', s)
os.makedirs('dist', exist_ok=True)
open('dist/PequeBloques.html', 'w', encoding='utf-8').write(s)
print('dist/PequeBloques.html', len(s), 'bytes')
