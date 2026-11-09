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
- **Voces** (neuronales pregrabadas + respaldo del dispositivo, con ajustes): Pipo lee los retos, los tutoriales y las pistas; el bloque «decir en voz alta» permite que cada personaje tenga su voz (normal, grave, ardilla, gigante, gatito). Con «Voz» activado, también se lee cada bloque al tocarlo.
- **3 tutoriales guiados**, **8 cuentos y retos**, **9 cuentos con voces** (seis de ellos largos, con cambio de escenarios y decisiones: «El tesoro del Teide», «Viaje a la Luna», «El mercado de la comida sana», «Rescate en el mar», «El huerto de Lucía» y «El secreto de la laurisilva», con animales y reciclaje) y **6 juegos en la pestaña «Juegos»** (los cuentos con voz tienen su propia pestaña «Cuentos con voz») (¡Penalti! con portero, «Atrapa los plátanos», «Frutas sí, caramelos no» con cartel final de ánimo al llegar a 20 puntos, «Atrapa al pez», «Memoria de animales canarios» —cada carta dice su nombre— y «El baile del robot», un juego de ritmo con flechas que se juega con teclado, mando en pantalla o tocando), ambientados en Canarias.
- **Borrar con el teclado**: toca un bloque para seleccionarlo (se marca en amarillo); **Supr** o **Retroceso** borra solo ese bloque y **Mayús + Supr** borra todo el conjunto. También en el menú del botón derecho.
- Bloque de evento **«al hacer clic en el escenario»** (solo en el escenario, igual que en Scratch 3).
- **Mando en pantalla** (botón del mando junto al escenario): flechas y espacio con el dedo, para jugar en tabletas sin teclado. Se abre solo en pantallas táctiles cuando el proyecto usa teclas.
- Editor de disfraces (pintar, subir imagen), grabación de voz, 16 personajes, 12 fondos y 62 sonidos originales en 6 categorías (animales, efectos, música, naturaleza, transporte y casa; se escuchan antes de añadirlos; tests/sounds.py y tests/soundui.py).
- Copia automática en el navegador (botón «Último») y descarga como .sb3.

## Usarlo

- **En local**: abre `index.html` en Chrome, Edge o Firefox.
- **En GitHub Pages**: *Settings ▸ Pages ▸ Deploy from a branch ▸ `main` / `(root)`*. La página quedará en `https://<usuario>.github.io/Pequebloques/`.

## Pensamiento computacional (cuentos con voz)

Siete cuentos con voz (seis de unos 10 minutos y uno más largo, de unos 25, para 2.º de Primaria), pensados para alumnado que aún no lee ni escribe: Lucía y Yeray lo cuentan todo con voz y solo hay que tocar la pantalla. Están en «Cuentos, retos y tutoriales» → pestaña **Pensamiento computacional**, y se pueden abrir, modificar y exportar a .sb3 como cualquier otro proyecto.

| Etapa | Cuento | Centro de interés | Pensamiento computacional |
|---|---|---|---|
| Infantil | Los contenedores de colores | Reciclaje | Secuencia, clasificación, patrones, depuración |
| Infantil | La casa de Yeray y la energía limpia | Energías limpias | Pasos en orden, condicional «si… entonces…», bucle, depuración |
| Infantil | Las estrellas de Lucía y Yeray | Universo | Patrones, ordenar, cuenta atrás, seguir instrucciones |
| Primaria | Misión limpiaplayas: programa al robot (6 misiones) | Reciclaje | Algoritmos con tarjetas, descomposición, depuración, bucle, planificar con obstáculos |
| Primaria | La isla de la energía limpia | Energías limpias | Condicionales, variables, bucle de días, depuración |
| Primaria | Misión Marte: programa al rover | Universo | Descomposición, obstáculos, prueba y error, bucle con límite de tarjetas |
| Primaria (2.º) | El cole recicla: clasifica y programa al robot | Reciclaje en el colegio | Condiciones «si… entonces», secuencia lógica, instrucciones de dirección relativa (avanzar, retroceder, girar a izquierda/derecha, como un Blue-Bot), obstáculos, dos objetivos en orden, depuración |

**Referencia curricular (orientativa, a confirmar por el equipo docente).** Verificada sobre los textos del BOC que se usaron para diseñarlos:
- Decreto 196/2022 (Educación Infantil de Canarias), área *Descubrimiento y Exploración del Entorno*, competencia específica 2: criterios 2.1 (dividir retos en secuencias de actividades más sencillas) y 2.2 (destrezas del pensamiento computacional mediante la manipulación).
- Decreto 211/2022 (Educación Primaria de Canarias), área *Conocimiento del Medio Natural, Social y Cultural*, competencia específica 3 (proyectos de diseño y pensamiento computacional): criterio 3.2 del primer ciclo («participar en la resolución guiada de problemas sencillos de programación») y criterio 3.2 del tercer ciclo (técnicas del pensamiento computacional: descomposición, patrones y algoritmos sencillos); saber básico «Proyectos de diseño y pensamiento computacional».

**El cole recicla (2.º de Primaria, unos 25 minutos).** Cuatro partes encadenadas: (1) clasificar ocho residuos en cinco contenedores (amarillo, azul, verde, marrón y gris) con pistas tras dos errores; (2) ordenar los cuatro pasos del viaje de un envase; (3) cuatro retos para aprender las tarjetas del robot de suelo (avanzar, retroceder, girar a la izquierda y a la derecha, que giran respecto al propio robot, no respecto a quien mira la pantalla); (4) tres misiones de llevar residuos a su contenedor —una con un contenedor trampa, una con obstáculos y otra con dos residuos y solo diez huecos— más dos programas con un error que hay que depurar. Después, una parte final sobre **bucles**: la tarjeta morada de repetir, marcada con «+2» (hace otra vez la tarjeta anterior, dos veces más) se explica con un reto de solo dos huecos, se usa en una misión, se depura un bucle mal colocado y hay un reto final con dos residuos y nueve huecos, que solo se puede resolver con bucles (comprobado con un solucionador). Son 13 niveles en total. Los niveles del robot se han comprobado con un solucionador (todos tienen solución dentro del límite de tarjetas). Los colores de los contenedores siguen el esquema habitual en España; algunos municipios usan otros (por ejemplo, sin contenedor marrón), así que conviene comentarlo con el grupo.

Todos los cuentos (con y sin voz) terminan con una **moraleja o reflexión** para el alumnado (esfuerzo y constancia, amistad, cuidado del mar y del bosque, alimentación sana, trabajo en equipo…). Por ejemplo, en «La carrera del campo»: llegar el primero no es lo más importante, sino llegar hasta el final sin rendirse. Test: `tests/morals.py`.

Los cuentos son materiales originales de este proyecto, no recursos oficiales del programa Código Escuela 4.0.

**Estado de las pruebas:** cada cuento se ha recorrido de principio a fin con un robot de pruebas en Chromium (voz simulada), los .sb3 exportados cargan y se ejecutan en `scratch-vm`. No se han probado con voces reales ni en tabletas físicas; la duración (10 minutos; 20 en el de 2.º) es una estimación.

**Icono «leer».** En todas las actividades de pensamiento computacional hay un botón violeta (bocadillo con líneas) en la esquina superior derecha del escenario. Al tocarlo muestra por escrito lo último que se ha dicho, y el altavoz verde lo vuelve a leer en voz alta. Se cierra tocando el texto. Funciona también en pantalla grande.

## Voces

**Sistema híbrido (desde esta versión).** Hay dos motores y el programa elige solo el mejor disponible:

1. **Voz neuronal pregrabada** (carpeta `audio/`, 642 clips mp3 ≈ 12 MB, generados con el modelo abierto **Kokoro** y un posprocesado de entonación propio). Cubre todo el texto del programa: retos, tutoriales, pistas, los cuentos con voz, los juegos y las frases con marcador. Suena igual en todos los dispositivos, sin claves ni conexión (funciona también desde `file://`). Cada personaje tiene su timbre (niña, niño, robot, animal pequeño, animal grande y Pipo, que puede ser femenina o masculina). La entonación se aplica por tipo de frase: afirmación (baja al final), pregunta (sube), exclamación (más energía), suspensiva e instrucción. Las frases con números se reproducen por frases ya grabadas encadenadas.
2. **Voz del dispositivo** (Web Speech API) como respaldo para lo que no está grabado (el texto que escribe el alumnado) o si un clip falla. Solo se usan voces **en español**, es-ES primero, con preferencia por las «Natural», «Online», «Premium» o de Google y descartando las robóticas (eSpeak, «compact»). Si el dispositivo no tiene ninguna voz en español, no habla con una voz extranjera: muestra el bocadillo con el texto y un aviso.

**Motor «Automática»** (por defecto): si el dispositivo tiene una voz española *natural* (Microsoft «Natural» en Edge/Windows, Google en Chrome, Siri/mejoradas en Apple), se usa esa para todo, con tonos suaves (un tono muy forzado la vuelve robótica) y voz distinta para niña y niño cuando hay dos; si no la hay, o no hay conexión para las de red, se usan las voces neuronales pregrabadas. En los ajustes de voz se puede forzar «Grabadas» o «Solo la del dispositivo». Es el mismo criterio de selección que usa RUMBO. Prueba: `tests/natvoice.py`.

**Ajustes de voz** (engranaje junto al botón «Voz»): motor (automático o solo el del dispositivo), velocidad (0,7–1,3), volumen, Pipo femenina/masculina, botones ▶ de muestra de cada personaje y elección manual de la voz del dispositivo. Se guardan en el navegador (`localStorage`, clave `pequebloques.voz`). Con `?voz=dispositivo` en la URL se fuerza el motor del dispositivo (lo usan las pruebas).

**Distribución.** `dist/PequeBloques.html` es un solo archivo, pero las voces neuronales van aparte: hay que dejar la carpeta `audio/` junto a `dist/` (es decir, `audio/` al lado de la carpeta que contiene el HTML). Sin ella el programa sigue funcionando con la voz del dispositivo.

**Regenerar los audios.** Las herramientas están en `tools/voces/` (`inv.py` hace el inventario de textos, `gen_pq.py` sintetiza con Kokoro + `prosody.py`, `finalize.py` renombra por clave y escribe `audio/manifest.js`). Requieren `kokoro-onnx`, `praat-parselmouth` y `ffmpeg`, y el modelo `kokoro-v1.0.onnx` con `voices-v1.0.bin`. La clave de cada clip es un hash FNV-1a doble de `voz|texto` (idéntico en Python y en `js/tts.js`): si se cambia un texto del programa hay que regenerar sus clips; mientras tanto ese texto se dice con la voz del dispositivo.

**Voces de personaje.** El menú «usar voz» ofrece: niña, niño, robot, animal pequeño y animal grande. Lucía habla con voz de niña, Yeray de niño, los robots con voz de robot y los animales con voz de animal pequeño o grande. Un personaje sin voz elegida usa la que le corresponde por su nombre. En el respaldo del dispositivo el género se deduce por el nombre de la voz (el navegador no lo indica).

**Interpretación de la voz del dispositivo.** `js/prosody.js` clasifica cada texto (afirmación, pregunta, exclamación, suspensiva; saludo, instrucción, advertencia…) y reparte tono, velocidad y volumen por grupo fónico. Límites reales: el navegador solo admite texto plano, tono, velocidad y volumen (no SSML), y algunas voces ignoran el tono.

**Estado de las pruebas de voz.** Probado en Chromium sin cabeza (`tests/neural.py`): reproducción real de los mp3 con latencia de inicio de pocos ms, encadenado de clips, velocidad y volumen, caída al dispositivo ante un clip que falla, ranking y filtrado de voces (simuladas), ventana de ajustes, persistencia y un cuento completo solo con voz neuronal. **No** se ha podido escuchar el resultado (la naturalidad subjetiva está sin valorar), ni probar con voces reales de Windows/Android/iOS ni en tabletas físicas. No se han integrado Google Cloud TTS ni ElevenLabs (necesitan clave y servidor); podrían añadirse como un tercer motor.

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
