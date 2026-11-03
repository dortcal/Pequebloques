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
- **3 tutoriales guiados**, **8 cuentos y retos**, **9 cuentos con voces** (seis de ellos largos, con cambio de escenarios y decisiones: «El tesoro del Teide», «Viaje a la Luna», «El mercado de la comida sana», «Rescate en el mar», «El huerto de Lucía» y «El secreto de la laurisilva», con animales y reciclaje) y **6 juegos en la pestaña «Juegos»** (los cuentos con voz tienen su propia pestaña «Cuentos con voz») (¡Penalti! con portero, «Atrapa los plátanos», «Frutas sí, caramelos no» con cartel final de ánimo al llegar a 20 puntos, «Atrapa al pez», «Memoria de animales canarios» —cada carta dice su nombre— y «El baile del robot», un juego de ritmo con flechas que se juega con teclado, mando en pantalla o tocando), ambientados en Canarias.
- **Borrar con el teclado**: toca un bloque para seleccionarlo (se marca en amarillo); **Supr** o **Retroceso** borra solo ese bloque y **Mayús + Supr** borra todo el conjunto. También en el menú del botón derecho.
- Bloque de evento **«al hacer clic en el escenario»** (solo en el escenario, igual que en Scratch 3).
- **Mando en pantalla** (botón del mando junto al escenario): flechas y espacio con el dedo, para jugar en tabletas sin teclado. Se abre solo en pantallas táctiles cuando el proyecto usa teclas.
- Editor de disfraces (pintar, subir imagen), grabación de voz, 16 personajes, 12 fondos y 8 sonidos originales.
- Copia automática en el navegador (botón «Último») y descarga como .sb3.

## Usarlo

- **En local**: abre `index.html` en Chrome, Edge o Firefox.
- **En GitHub Pages**: *Settings ▸ Pages ▸ Deploy from a branch ▸ `main` / `(root)`*. La página quedará en `https://<usuario>.github.io/Pequebloques/`.

## Pensamiento computacional (cuentos con voz)

Seis cuentos de unos 10 minutos, pensados para alumnado que aún no lee ni escribe: Lucía y Yeray lo cuentan todo con voz y solo hay que tocar la pantalla. Están en «Cuentos, retos y tutoriales» → pestaña **Pensamiento computacional**, y se pueden abrir, modificar y exportar a .sb3 como cualquier otro proyecto.

| Etapa | Cuento | Centro de interés | Pensamiento computacional |
|---|---|---|---|
| Infantil | Los contenedores de colores | Reciclaje | Secuencia, clasificación, patrones, depuración |
| Infantil | La casa de Yeray y la energía limpia | Energías limpias | Pasos en orden, condicional «si… entonces…», bucle, depuración |
| Infantil | Las estrellas de Lucía y Yeray | Universo | Patrones, ordenar, cuenta atrás, seguir instrucciones |
| Primaria | Misión limpiaplayas: programa al robot | Reciclaje | Algoritmos con tarjetas, descomposición, depuración, bucle |
| Primaria | La isla de la energía limpia | Energías limpias | Condicionales, variables, bucle de días, depuración |
| Primaria | Misión Marte: programa al rover | Universo | Descomposición, obstáculos, prueba y error, bucle con límite de tarjetas |

**Referencia curricular (orientativa, a confirmar por el equipo docente).** Verificada sobre los textos del BOC que se usaron para diseñarlos:
- Decreto 196/2022 (Educación Infantil de Canarias), área *Descubrimiento y Exploración del Entorno*, competencia específica 2: criterios 2.1 (dividir retos en secuencias de actividades más sencillas) y 2.2 (destrezas del pensamiento computacional mediante la manipulación).
- Decreto 211/2022 (Educación Primaria de Canarias), área *Conocimiento del Medio Natural, Social y Cultural*, competencia específica 3 (proyectos de diseño y pensamiento computacional): criterio 3.2 del primer ciclo («participar en la resolución guiada de problemas sencillos de programación») y criterio 3.2 del tercer ciclo (técnicas del pensamiento computacional: descomposición, patrones y algoritmos sencillos); saber básico «Proyectos de diseño y pensamiento computacional».

Los cuentos son materiales originales de este proyecto, no recursos oficiales del programa Código Escuela 4.0.

**Estado de las pruebas:** cada cuento se ha recorrido de principio a fin con un robot de pruebas en Chromium (voz simulada), los .sb3 exportados cargan y se ejecutan en `scratch-vm`. No se han probado con voces reales ni en tabletas físicas; la duración de 10 minutos es una estimación.

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

## Licencia

© 2026 David OZC. Uso gratuito en centros educativos. Licencia **CC BY-NC-ND 4.0** (Reconocimiento – NoComercial – SinObraDerivada): se puede compartir sin cambios y citando al autor; no se permite modificarla, venderla ni presentarla como propia sin su permiso. Ver `LICENSE`.
