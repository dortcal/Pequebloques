# PequeBloques

Editor de programación por bloques para el alumnado de **Infantil y primer ciclo de Primaria**, con el aspecto y los bloques de Scratch 3, pero más sencillo, más grande y con voz.

**Diseñado por David OZC.**

- Sin registro, sin cuentas y sin enviar datos a ningún sitio: todo funciona en el navegador del propio dispositivo.
- Abre y guarda proyectos **.sb3** (compatibles con Scratch 3).
- Funciona sin conexión: basta con abrir `index.html` (o `dist/PequeBloques.html`, que es la versión de un solo archivo).

## Qué incluye

- **Bloques de Scratch 3**: eventos, movimiento, apariencia, sonido, control, sensores, **operadores**, **variables** y las extensiones **Lápiz** y **Texto a voz** (aquí llamada «Voz»).
- Modo **«Pocos bloques»** (por defecto, para los más pequeños) y **«Más bloques»**.
- **Botón «¿Me ayudas?»**: Pipo da una pista según lo que falte en el programa, la lee en voz alta y enseña con una mano dónde arrastrar el bloque. Si el alumno lleva un rato sin hacer nada, el botón se mueve para llamar su atención.
- **Voces**: Pipo lee los retos, los tutoriales y las pistas; el bloque «decir en voz alta» permite que cada personaje tenga su voz (normal, grave, ardilla, gigante, gatito). Con «Voz» activado, también se lee cada bloque al tocarlo.
- **3 tutoriales guiados**, **8 cuentos y retos**, **6 cuentos con voces** (tres de ellos largos, con cambio de escenarios y decisiones: «El tesoro del Teide», «Viaje a la Luna» y «El mercado de la comida sana») y **2 juegos de movimiento en una pestaña «Juegos»** (¡Penalti! con portero y «Atrapa los plátanos»), ambientados en Canarias.
- **Borrar con el teclado**: toca un bloque para seleccionarlo (se marca en amarillo); **Supr** o **Retroceso** borra solo ese bloque y **Mayús + Supr** borra todo el conjunto. También en el menú del botón derecho.
- Bloque de evento **«al hacer clic en el escenario»** (solo en el escenario, igual que en Scratch 3).
- **Mando en pantalla** (botón del mando junto al escenario): flechas y espacio con el dedo, para jugar en tabletas sin teclado. Se abre solo en pantallas táctiles cuando el proyecto usa teclas.
- Editor de disfraces (pintar, subir imagen), grabación de voz, 16 personajes, 12 fondos y 8 sonidos originales.
- Copia automática en el navegador (botón «Último») y descarga como .sb3.

## Usarlo

- **En local**: abre `index.html` en Chrome, Edge o Firefox.
- **En GitHub Pages**: *Settings ▸ Pages ▸ Deploy from a branch ▸ `main` / `(root)`*. La página quedará en `https://<usuario>.github.io/Pequebloques/`.

## Voces

Las voces usan la síntesis del propio navegador (Web Speech API). Si el dispositivo no tiene voz en español instalada, el programa funciona igual pero no se oye. En Windows/Android/iOS/macOS suelen venir de serie; en Linux hay que instalar una (por ejemplo `espeak-ng` o `speech-dispatcher`).

## Compatibilidad con Scratch

Se importan y exportan los bloques que existen en PequeBloques. Al abrir un .sb3 de Scratch, los bloques que no existen aquí (listas, clones, efectos gráficos, música y otras extensiones, «Mis bloques») se omiten y se avisa. El archivo original no se modifica.

Los .sb3 exportados se han validado con `scratch-parser`. La apertura en scratch.mit.edu y en el editor de escritorio debe probarse en cada caso.

## Estructura

```
index.html        página principal
css/style.css     estilos
js/               util, blocks, project (.sb3), lib (personajes, fondos, sonidos),
                  runtime (motor), editor, help (Pipo y ayuda), examples, tutorials, app
dist/             versión de un solo archivo (generada)
tools/            build-single.py
tests/            pruebas automáticas con Playwright
```

Regenerar la versión de un solo archivo: `python3 tools/build-single.py`.

## Créditos y nota legal

Diseño y dirección: **David OZC**. Scratch es un proyecto de la Fundación Scratch y del Lifelong Kindergarten Group del MIT Media Lab; PequeBloques es una herramienta independiente, sin relación ni respaldo de ellos, que solo usa el formato de archivo .sb3. Los personajes, fondos y sonidos son originales de esta herramienta.
