# Estados en Flutter · Equipo 2

Presentación web de la exposición de la **Unidad 4 de Desarrollo de Aplicaciones Móviles** (TecNM · Instituto Tecnológico de Tlaxiaco). Tiene 63 láminas, animaciones en SVG y three.js, notas del orador y una vista del orador sincronizada.

## Uso

| Tecla | Acción |
|---|---|
| `→` · espacio · clic | siguiente paso o lámina |
| `←` | anterior |
| `F` | pantalla completa |
| `P` | abre la vista del orador en otra ventana (con notas, cronómetro y la siguiente lámina; se sincroniza sola) |
| `N` | muestra las notas en la misma ventana |
| `O` | vista general para saltar a cualquier lámina |

Se puede enlazar una lámina directamente con `#número`, por ejemplo `/#44`.

## Estructura

```
index.html        estructura de la página
assets/deck.js    motor: carga, escala 1920×1080, pasos, transiciones, orador
assets/deck.css   estilos del motor
deck.json         orden de las láminas y secciones
slides/*.html     una lámina por archivo (<section> + <aside> con notas)
fx/*.html         animaciones three.js usadas como fondos
fx/kit.css · kit.js  estilos y utilidades que comparten las animaciones SVG de las láminas
```

### Editar una lámina

1. Abre `slides/<id>.html`. Cada lámina es un `<section>` de 1920×1080 con estilos en línea.
2. Las notas del orador van en el `<aside>` final.
3. Un `<x-embed>` es una animación en `iframe`: puede llevar una página completa dentro o un atributo `src` (por ejemplo `src="fx/campo.html"`).
4. `data-build-in="fade|rise|pop"` en un elemento con `position:absolute` lo hace aparecer al avanzar.
5. Para agregar o reordenar láminas, edita `order` en `deck.json`.

### Animaciones SVG

Las animaciones dentro de un `<x-embed>` cargan `fx/kit.css` y `fx/kit.js`, que dan un lenguaje común:

- `tap(x, y)`: el punto ámbar (el “dedo”) viaja y toca.
- `send(recorrido, ms, {label, color})`: un paquete viaja por una línea o un `<path>`. Ámbar es una acción o evento; `color: BLU` es estado o datos.
- `on`, `show`, `txt`, `pop`, `flash`, `press`: encender, mostrar, cambiar texto y dar énfasis.
- `loop(async () => { … })`: repite la secuencia.
- `builds()`: cuántos pasos `data-build-in` lleva revelados la lámina; así una animación reacciona a los clics (láminas 5, 15 y 40).

Cada `git push` a `main` se publica solo en Vercel: <https://estados-flutter-expo.vercel.app>

## Paleta

Hay pocos colores y cada uno tiene un significado. Úsalos igual al editar:

| Color | Hex | Significado |
|---|---|---|
| Tinta | `#23262F` | estructura y títulos |
| Gris | `#6B7080` | texto secundario y etiquetas |
| Fondo | `#ECEEF2` | superficies neumórficas |
| **Azul** | `#2F5BFF` | acento principal: **estado / lo que cambia** |
| Ámbar | `#F2A93B` · `#D97706` | acción o evento que viaja (animaciones y código) |
| Verde | `#16A37B` | ventaja o correcto |
| Rojo | `#E5484D` | desventaja o error |

La tipografía es Poppins (títulos en 900 y mayúsculas) y JetBrains Mono para el código.

## Desarrollo local

```bash
python3 -m http.server 5174
```

Luego abre <http://localhost:5174>. Hace falta un servidor porque el motor carga las láminas con `fetch`.
