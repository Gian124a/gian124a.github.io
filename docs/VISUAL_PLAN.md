# Plan visual: UX/UI + animaciones

> Estado: **decisiones tomadas (§8), pendiente aprobar para arrancar V0**. Nada implementado.
> Objetivo: que recorrer el portfolio sea una experiencia que se *disfrute*: movimiento fluido,
> con intención, que responda al usuario, sin sacrificar rendimiento, accesibilidad ni control.
>
> **Reglas de trabajo**
> - Rama base: **`dev`**. Cada fase en `visual/vN-<nombre>` creada desde `dev` y mergeada a `dev`.
>   `main` (producción) solo cuando el usuario lo pida.
> - **Implementación con Sonnet**: cada fase la desarrolla un agente con modelo Sonnet a partir
>   de la especificación de la fase; la planificación y la revisión final se hacen aparte.
> - **El contenido manda**: añadir/editar proyectos, habilidades, experiencia, educación, textos o
>   fotos se hace solo en `src/data/*.ts` (+ imagen) y las animaciones se adaptan solas (§5.11).

---

## 1. Diagnóstico del estado actual

Lo que hay hoy (explorado en `src/`):

| Zona | Movimiento actual | Problemas UX/UI detectados |
|---|---|---|
| Loader (`Layout.astro`) | Spinner que gira hasta `window.load` | Bloquea la vista hasta que carga *todo*; no aporta identidad |
| Nav (`Nav.astro`) | Pill activa (`#active-bg`) que se desliza; menú móvil con blur y cascada | La pill usa `ease` genérico; no hay indicador de progreso |
| Hero | Ninguno (solo `hover:scale` en redes) | Entrada plana; la stats-bar es estática |
| Sobre mí | Ninguno | `h2 "SOBRE MI"` duplicado (móvil/desktop); `alt="Sobre mi"` poco descriptivo |
| Experiencia | Carrusel horizontal con 2 paneles + dots | El cambio Educación/Experiencia no comunica progreso temporal |
| Proyectos | Carrusel + modal con `scale-95 → 100` | El modal aparece "de la nada" (no nace de la tarjeta) |
| Habilidades | Carrusel + modal igual al de proyectos | Mismo patrón que Proyectos: secciones se sienten repetidas |
| Contacto | Validación en `blur` | Sin feedback animado de foco / envío / éxito |
| Footer | `hover:scale` en redes | `© 2025` desactualizado |
| Global | `prefers-reduced-motion` anula transiciones CSS | No existe un sistema de motion (duraciones/curvas sueltas por componente) |

**Conclusión:** la base es sólida (Astro, datos tipados, scripts modulares), pero el movimiento
es casi inexistente y no hay sistema. Primero sistema, luego espectáculo.

---

## 2. Principios (el "contrato" de calidad)

1. **Cada animación tiene un propósito**: orientar, dar feedback, mostrar jerarquía o deleitar.
   Si no cumple ninguno, no va (criterio de `emil-design-eng`).
2. **Frecuencia inversa a intensidad**: lo que se ve una vez (intro, hero) puede ser
   espectacular; lo que se usa mucho (nav, hover, botones) debe ser rápido y sutil.
3. **Solo `transform`, `opacity`, `clip-path` y `filter` moderado** → 60 fps (`animation-performance`).
4. **Contenido visible sin JS**: los estados iniciales "ocultos" solo se aplican si el
   motor de motion arrancó (clase `.motion-ready` en `<html>`). Si falla, la web se ve igual que hoy.
5. **`prefers-reduced-motion`**: versión sin desplazamientos (solo fades cortos) vía
   `gsap.matchMedia()` + la regla CSS ya existente.
6. **Interrumpibles**: nada bloquea el scroll ni el clic esperando a que termine una animación.
7. **Presupuesto**: JS de motion ≤ ~60 KB gzip; Lighthouse Performance ≥ 90; CLS = 0;
   la intro nunca supera ~1.6 s y solo se muestra en la primera visita de la sesión.
8. **Espectacular en todo, pero que nunca se trabe**:
   - **Niveles de dispositivo** (`gsap.matchMedia`): *full* (desktop, puntero fino),
     *lite* (móvil / `deviceMemory ≤ 4` / pocos núcleos: sin aurora animada, sin cursor,
     menos capas de parallax, blur reemplazado por opacidad) y *reduced* (reduced-motion).
   - **Bucles solo en pantalla**: aurora, marquee y animaciones "idle" se pausan cuando su
     sección no es visible o la pestaña está oculta.
   - **Máximo un efecto pesado activo a la vez** (pin + scrub) y nunca blur animado sobre
     áreas grandes.
   - Prueba obligatoria con CPU ×4 throttling en DevTools y en un móvil real de gama media.
9. **Agnóstico al contenido**: ninguna animación depende de cuántos elementos hay, de su orden
   ni de la longitud de un texto (detalle en §5.11).

---

## 3. Stack de animación propuesto

| Pieza | Uso | Por qué |
|---|---|---|
| **GSAP + ScrollTrigger** | Secuencias, pinning, scrub por scroll, timelines | Estándar de la industria (Awwwards, Apple-like), gratis completo, robusto en Safari |
| **SplitText** (GSAP) | Revelado de texto por líneas/palabras/letras con máscara | Maneja accesibilidad (aria) y re-split en resize |
| **Lenis** | Scroll suave con inercia | Es la base de casi todos los sitios "premium"; se sincroniza con ScrollTrigger |
| **CSS scroll-driven animations** (`animation-timeline: view()`) | Reveals simples, barra de progreso | Cero JS donde basta; mejora progresiva |
| **View Transitions API** | Tarjeta → modal (shared element) | Morph nativo, sin librería |
| **WAAPI / CSS** | Micro-interacciones (hover, foco, botones) | Ligero, no necesita GSAP |

Organización: `src/scripts/motion/` (`lenis.ts`, `reveal.ts`, `split.ts`, `magnetic.ts`,
`tokens.ts`…) importados desde los `<script>` de cada sección, como ya se hace con `carousel.ts`.
Tokens de motion (duraciones, curvas, springs) en `@theme` de `global.css` + espejo en `tokens.ts`.

> Alternativa "cero dependencias": solo CSS scroll-driven + View Transitions + WAAPI.
> Más liviana, pero el pinning/scrollytelling de Proyectos y la intro serían mucho más
> limitados y frágiles en Safari/Firefox. **Recomendado: GSAP + Lenis.**

---

## 4. Catálogo de animaciones famosas (referencia)

Las técnicas que más se repiten en sitios premiados (Awwwards, Apple, Linear, Vercel, Stripe):

| # | Técnica | Dónde se ve | ¿La usamos? |
|---|---|---|---|
| 1 | **Smooth scroll con inercia** (Lenis) | Casi todo Awwwards | ✅ Global |
| 2 | **Text reveal con máscara** (líneas que suben desde un `overflow:hidden`) | Portfolios de estudio | ✅ Títulos |
| 3 | **Scroll-scrub de secuencia de imágenes/vídeo** (lo de `scroll-world`, AirPods Pro de Apple) | Apple product pages | ✅ Versión ligera en Proyectos (ver §5.6) |
| 4 | **Scrollytelling con pin** (la sección se fija y su contenido cambia con el scroll) | Apple, Stripe | ✅ Proyectos |
| 5 | **Scroll horizontal guiado por scroll vertical** | Portfolios, museos digitales | ✅ Experiencia (desktop) |
| 6 | **Stacking cards** (tarjetas sticky que se apilan y escalan) | Landings SaaS | ⚪ Alternativa en Proyectos |
| 7 | **Parallax por capas** | Clásico | ✅ Sutil en Hero/About |
| 8 | **Clip-path / mask reveal de imágenes** | Editoriales, moda | ✅ Fotos |
| 9 | **Botones magnéticos** | Portfolios de devs creativos | ✅ CTAs y redes |
| 10 | **Cursor personalizado / follower** | Awwwards | ⚪ Opcional, solo desktop |
| 11 | **Marquee infinito reactivo a la velocidad** | Logos de clientes/tecnologías | ✅ Habilidades |
| 12 | **Spotlight/glow que sigue al mouse en tarjetas** (bento) | Linear, Vercel | ✅ Proyectos/Habilidades |
| 13 | **Tilt 3D en tarjetas** | Tarjetas de producto | ⚪ Muy sutil o no |
| 14 | **Contadores animados** | Stats | ✅ Hero |
| 15 | **Texto que se ilumina palabra a palabra al hacer scroll** | Apple (keynote pages) | ✅ About |
| 16 | **Text scramble / decrypt** | Sitios "tech" | ⚪ Una sola vez, p. ej. en el rol |
| 17 | **Preloader con contador + cortina** | Estudios creativos | ✅ Intro breve |
| 18 | **Shared element / FLIP (tarjeta → detalle)** | Apps nativas, iOS | ✅ Modales |
| 19 | **SVG line drawing con el scroll** | Timelines | ✅ Experiencia |
| 20 | **Fondo aurora / gradient mesh + grano** | Stripe, Linear | ✅ Hero, muy controlado |
| 21 | **Zoom-through ("entrar" en la escena)** — el "dive" de scroll-world, hecho con CSS/GSAP | Apple, Emons | ✅ Transición Hero → About |
| 22 | **Shaders WebGL / distorsión de imágenes** | Awwwards top | ❌ Coste alto en móvil; fuera de alcance |

---

## 5. Ideas por sección

Nivel de "wow": 🔥🔥🔥 protagonista · 🔥🔥 notable · 🔥 sutil/de pulido.

### 5.1 Intro: "Del nombre a la marca" 🔥🔥🔥
Idea: la intro **presenta** (tu nombre) y luego **se convierte en la página** (el logo vuela a
su sitio en el header y la cortina revela el hero). No es una pantalla de espera: es el primer
plano de la película y termina *dentro* del sitio, sin corte.

**Storyboard** (tiempos con carga rápida; total ≈ 1.5 s):

| t | Qué pasa | Técnica |
|---|---|---|
| 0.00 s | Fondo `secundary-900` con grano. Una línea fina en gradiente `primary-800 → primary-500` se dibuja desde el centro hacia los lados (el mismo lenguaje que `SectionDivider`) | `scaleX` 0→1, ease-out |
| 0.25 s | Sobre la línea sube **"GIANFRANCO MUÑOZ"** letra a letra desde una máscara; bajo ella, en pequeño, "Desarrollador Frontend · Flutter" con fade | SplitText por chars, stagger 0.02 s |
| 0.25–1.0 s | En la esquina, contador `00 → 100` en tipografía tabular, ligado a la **carga real** (fuente Poppins 800 + decode de la imagen del hero). Si todo carga rápido, igual recorre el mínimo para que la coreografía respire | Promesas `document.fonts.ready` + `img.decode()` |
| 1.00 s | El nombre se desvanece hacia arriba mientras **"PORTFOLIO"** aparece grande en el centro con el gradiente de marca | Crossfade + text reveal |
| 1.15 s | **"PORTFOLIO" vuela y se encoge hasta el logo del header** (`#brand-logo`, shared element / FLIP, destino medido en runtime); a la vez la intro se abre como **cortina** (`clip-path` de abajo hacia arriba) | FLIP con GSAP + `clip-path: inset()` |
| 1.25 s | Con la cortina aún abriéndose, **arranca la entrada del Hero** (título por líneas, retrato con máscara, stats) → se solapan ~200 ms: un solo movimiento continuo | Timeline encadenada |

**Reglas de la intro**
- Solo en la **primera visita de la sesión** (`sessionStorage`); al volver, entrada directa del hero.
- **Saltable**: clic, tecla o scroll la aceleran al final (no la cortan en seco).
- Si la carga es lenta, el contador se queda en ~90 y respira; tope duro de 3 s → entra igual.
- **Sin flash**: un script inline en `<head>` decide antes del primer pintado si se muestra.
  Sin JS no hay intro y la página se ve normal.
- *Reduced-motion*: solo el nombre con fade de 300 ms y fundido al hero.
- El nombre y el rol salen de los datos (`src/data/`), no escritos dentro de la animación.

> **Se prototipan las dos versiones y se elige viéndolas**: la completa (≈ 1.5 s) y la corta
> (≈ 0.9 s: "PORTFOLIO" aparece directo y vuela al header, sin el paso del nombre).
> Logo: se probó "GM" en V1 y se descartó; se mantiene **"PORTFOLIO"**.

### 5.2 Header y Nav 🔥
- Header que **se oculta al bajar y reaparece al subir** (con Lenis, sin saltos).
- Pill activa con **curva spring** (sobreimpulso leve) en lugar de `ease` (`apple-design`).
- **Barra de progreso de lectura** de 2 px bajo el header (CSS `animation-timeline: scroll()`).
- Al hacer clic en un link: scroll suave con Lenis a la sección (respetando el offset del header).

### 5.3 Hero 🔥🔥🔥
- **Text reveal** de "DESARROLLADOR FRONTEND" por líneas con máscara + stagger; el párrafo entra
  por palabras con fade/blur corto.
- **Retrato**: reveal con `clip-path` (círculo o rectángulo que se abre) + leve escala 1.1→1.
- **Aurora** detrás del retrato con los morados de la paleta (`primary-500/800`), moviéndose
  muy lento y desplazándose levemente hacia el cursor. Capa de **grano** encima para textura.
- **CTA y redes magnéticos** (se "pegan" al cursor dentro de un radio), con spring al soltar.
- **Stats**: contadores animados al entrar en vista (`+5`, `+4`…), con las líneas separadoras
  que se "dibujan" desde el centro.
- **Salida con scroll (zoom-through)**: al bajar, el retrato hace parallax más lento que el
  texto y el hero se escala/oscurece ligeramente → sensación de "entrar" a Sobre mí.

### 5.4 Sobre mí 🔥🔥
- Título con text reveal (y eliminar el `h2` duplicado → uno solo responsive).
- **Párrafo que se ilumina palabra a palabra con el scroll** (de `neutral-800` a `neutral-50`,
  efecto Apple). Es la idea estrella de la sección: se lee *al ritmo* del usuario.
- Imagen con **mask reveal** + parallax sutil.
- Tags que aparecen en **cascada con spring** (pop-in pequeño).
- Botón de CV: magnético + icono que se desplaza en hover.

### 5.5 Experiencia 🔥🔥
- ~~Pin con scroll horizontal~~ **descartado en V0**: son 2 paneles y consumiría el único efecto
  pesado (reservado a Proyectos).
- **Timeline vertical con línea SVG que se dibuja** con el scroll (longitud real medida); cada
  hito (año + título) aparece cuando la línea lo alcanza; el año hace un scramble corto una vez.
- Desktop: Educación y Experiencia lado a lado, cada una con su línea. Móvil: una debajo de la
  otra. Las categorías se generan desde los datos (una tercera categoría funciona sin tocar código).

### 5.6 Proyectos 🔥🔥🔥 (la sección protagonista)
Eres desarrollador móvil/Flutter → la sección debe *sentirse como una app*.
- **Scrollytelling con mockup de teléfono fijado** (técnicas #3 + #4): un teléfono en el centro
  se queda fijo mientras haces scroll; la pantalla cambia de proyecto en proyecto
  (Cinemapedia → Echo → WhatsApp → Product) con transición deslizante dentro del teléfono,
  y a un lado el título/tipo/descr. corta entran con text reveal. El teléfono rota levemente en
  3D entre proyectos. Es la versión "scroll-world" pero con nuestros propios mockups:
  **sin vídeos generados, sin coste y pesando lo que ya pesan las imágenes**.
- Al final del recorrido el teléfono "suelta" y aparece la grilla/carrusel de todos los proyectos.
- **Tarjetas con spotlight** (brillo radial que sigue al mouse) y borde con gradiente animado.
- **Tarjeta → modal con View Transitions**: la imagen de la tarjeta *se transforma* en la del
  modal (shared element). Cerrar hace el camino inverso.
- **Móvil**: el pin funciona bien en vertical; si el rendimiento no acompaña, fallback a
  stacking cards (#6).

### 5.7 Habilidades 🔥🔥
- **Marquee infinito de logos** (Dart, Flutter, JS, HTML, CSS, Tailwind, Figma, Git, Python) en
  dos filas en direcciones opuestas, que **acelera y se inclina (skew) con la velocidad del scroll**.
- Debajo, las tarjetas en **bento grid** (desktop) con spotlight; en móvil se mantiene el carrusel.
- Icono que "flota" (idle muy lento) y escala con spring al hover.
- Modal con el mismo shared element que Proyectos (coherencia).

### 5.8 Contacto 🔥🔥
- Título grande con reveal por letras.
- Inputs: **label flotante** + subrayado que crece desde el centro al enfocar; error con un
  *shake* corto (una vez) y mensaje que entra con altura animada.
- **Botón de enviar con estados**: texto → spinner → check dibujado (SVG stroke) → vuelve.
- Toast con entrada spring desde arriba y salida rápida (`ask-sonner`-style, sin la librería).

### 5.9 Footer y divisores 🔥
- `SectionDivider`: la línea se **dibuja desde el centro** al entrar en vista (CSS scroll-driven).
- Footer: "PORTFOLIO" gigante que **sube desde una máscara** al llegar al final (cierre de la
  historia); botón "volver arriba" que usa Lenis. Año dinámico (`new Date().getFullYear()`).

### 5.10 Cursor y global 🔥🔥 (decidido: sí)
- **Cursor personalizado** solo con `(pointer: fine)` y nivel *full*: punto que sigue exacto +
  aro que sigue con retardo (spring). Estados por atributo, no por elemento concreto:
  `data-cursor="link"` (aro crece), `data-cursor="view"` (aro con texto "Ver" en proyectos),
  `data-cursor="hidden"` (inputs/textos). Cualquier elemento nuevo lo hereda poniendo el atributo.
- El cursor nativo **nunca** se oculta en inputs ni para teclado; foco visible intacto.
- Grano global muy sutil.

### 5.11 Escalabilidad del contenido (requisito transversal)
Tú debes poder añadir o cambiar **proyectos, habilidades, experiencia, educación, textos,
etiquetas, stats y fotos** tocando solo `src/data/*.ts` (y dejando la imagen en su carpeta),
sin tocar animaciones. Cómo se garantiza:

| Regla | Ejemplo concreto |
|---|---|
| **Las animaciones se generan desde los arrays de datos**, nunca con cantidades fijas | El teléfono de Proyectos crea un "paso" por cada elemento de `projects`; la longitud del pin = nº de proyectos × alto de paso. 4 o 12 proyectos funcionan igual |
| **API declarativa por atributos** (`data-motion="reveal"`, `"split"`, `"stagger"`, `"counter"`, `"magnetic"`, `data-cursor`) | Un componente nuevo o un ítem nuevo hereda la animación sin escribir JS |
| **Nada de `nth-child` ni delays escritos a mano** | El stagger se calcula por índice (hoy el menú móvil tiene 6 `nth-child` fijos → se reemplaza) |
| **Textos de cualquier largo** | SplitText re-divide en resize; nada de alturas fijas en títulos; tipografía fluida con `clamp()` |
| **Eliminar las clases "de paridad" por ítem** (`titleClass`, `typeClass`, `circleClass`, `iconClass`) | Un estilo único y fluido para todas las tarjetas: un ítem nuevo no necesita retoques de CSS |
| **Imágenes opcionales y de cualquier proporción** | Proyecto sin imagen → pantalla "En proceso" animada dentro del teléfono (ya existe el placeholder); `object-fit` + `astro:assets` |
| **Stats con formato libre** | El contador parsea `'+5'`, `'10+'`, `'3 años'`: anima la parte numérica y respeta prefijo/sufijo |
| **Marquee y timeline se rellenan solos** | El marquee duplica la lista para el bucle infinito sea cual sea su largo; la línea SVG de la timeline mide su longitud real |
| **Recalcular al cambiar el layout** | `ScrollTrigger.refresh()` tras cargar imágenes/fuentes y en resize (debounced) |
| **Validación con `break-ui`** | Cada fase se prueba con 1 ítem, con muchos (p. ej. 12 proyectos) y con textos extremos |

Entregable: una guía corta **"Cómo añadir contenido"** en el README (dónde va cada dato, tamaño
recomendado de imágenes, ejemplo de proyecto/habilidad/experiencia nuevos).

---

## 6. Skills de diseño que usaremos (y cuándo)

| Momento | Skill | Para qué |
|---|---|---|
| Diagnóstico | `impeccable` | Crítica/auditoría UX/UI completa: jerarquía, tipografía, color, a11y, responsive. Puede generar `DESIGN.md` |
| Diagnóstico | `find-animation-opportunities` | Contrastar este plan con un barrido del código: qué animar y qué **no** |
| Dirección | `emil-design-eng` | Filosofía de pulido, decidir qué merece movimiento y los detalles invisibles |
| Dirección | `apple-design` | Springs, interacciones interrumpibles, profundidad, tipografía |
| Prototipado | `prototype` | Probar aislados el hero, el teléfono de Proyectos y el marquee antes de integrarlos |
| Implementación | `animate` | Construir cada animación (curva, duración, interrupción, salida) |
| Implementación | `frontend-design` | Piezas visuales nuevas (bento, footer gigante, intro) con estética no genérica |
| Implementación | `animation-vocabulary` | Nombrar con precisión efectos que veamos en referencias |
| Rendimiento | `animation-performance` | Revisar jank, propiedades animadas, `will-change`, coste de blur |
| Móvil | `mobile-native` | `100vh`, hover pegajoso, tap highlight, gestos táctiles con pin/carruseles |
| Revisión | `review-animations` | Revisión de cada fase antes del commit |
| Revisión | `break-ui` | Estresar con textos largos/datos extremos (títulos de proyectos, descripciones) |
| Revisión global | `improve-animations` | Auditoría final de todo el motion |
| Cierre de fase | `/verificar` | Build + revisión visual (flujo del proyecto) |

---

## 7. Fases de implementación (controladas)

Cada fase: rama `visual/vN-<nombre>` desde `dev` → especificación de la fase →
**implementación por agente Sonnet** → revisión (`review-animations`, `break-ui`) →
`/verificar` → commit y merge a `dev` (solo cuando lo pidas). Ninguna fase arranca sin aprobar
la anterior. `main` no se toca hasta que decidas publicar.

| Fase | Contenido | Skills principales | Riesgo |
|---|---|---|---|
| **V0. Diagnóstico** ✅ | Auditorías `impeccable` + `find-animation-opportunities` → `docs/visual/V0.md` | impeccable, find-animation-opportunities | — |
| **V1. Fundación UI** | Tokens en `@theme` (tipografía fluida `clamp()`, color semántico con contraste AA, espaciado, radios, z-index, motion); componentes `SectionTitle`/`Button`/`Card`/`Glow`; Hero en grid; header/nav coherentes; modales y formulario accesibles; foco visible; headings/alts; quitar clases de paridad; `min-h-svh`; logo "GM"; tildes en datos | impeccable, emil-design-eng, frontend-design, break-ui | Medio (cambia la base visual) |
| **V2. Fundación de motion** | GSAP + Lenis; `src/scripts/motion/`; `.motion-ready`; niveles full/lite/reduced; API `data-motion`; arreglar `touch-action` y retirar `smart-scroll`; Lenis ↔ carruseles/modales/nav; reduced-motion; loader desacoplado de `window.load`; quitar `transition-all` y hover sin gating | animate, animation-performance, mobile-native | Medio (base de todo) |
| **V3. Intro + Hero** | §5.1 (prototipo de las dos intros) y §5.3 | animate, apple-design, prototype | Medio |
| **V4. Nav + Sobre mí + divisores** | §5.2, §5.4, §5.9 (divisores) | animate, emil-design-eng | Bajo |
| **V5. Experiencia** | §5.5 | animate, mobile-native | Bajo |
| **V6. Proyectos** | §5.6 (scrollytelling + View Transitions) | prototype, animate, apple-design, break-ui | Alto (protagonista) |
| **V7. Habilidades** | §5.7 | animate, frontend-design | Bajo |
| **V8. Contacto + Footer** | §5.8, §5.9 (footer) | animate, emil-design-eng | Bajo |
| **V9. Cursor + pulido global** | Cursor personalizado, grano, auditoría de rendimiento, móvil y a11y; guía "Cómo añadir contenido" en el README | improve-animations, animation-performance, mobile-native, impeccable | Medio |

**Recortes acordados en V0** (rendimiento sin perder espectáculo): sin iconos flotando en
bucle, sin bordes de gradiente animados permanentes, aurora solo moviendo `transform` y solo
en nivel *full* (nunca animar blur), magnetismo solo en CTAs principales, header que se oculta
al bajar solo en móvil, pill del nav con `transform` (no `width/height`).

### Criterios de aceptación de cada fase
- Build OK y revisión visual en móvil (375 px), tablet y desktop.
- 60 fps en el perfil de rendimiento de Chrome durante la animación (sin long tasks).
- Con `prefers-reduced-motion: reduce` todo el contenido es accesible y sin desplazamientos.
- Sin JS o si falla el motor: la página se ve como hoy.
- Lighthouse Performance ≥ 90 y CLS = 0 tras la fase.
- Sin tirones con CPU ×4 throttling (nivel *lite* incluido).
- **Prueba de contenido**: añadir temporalmente ítems extra y textos largos en `src/data/`
  sin tocar otro archivo → las animaciones siguen correctas (luego se revierte).

---

## 8. Decisiones tomadas

1. **Stack**: GSAP (ScrollTrigger + SplitText) + Lenis, con CSS nativo donde baste.
2. **Intro**: sí → "Del nombre a la marca" (§5.1), primera visita de la sesión, saltable.
3. **Cursor personalizado**: sí, solo desktop con puntero fino (§5.10).
4. **Proyectos**: scrollytelling con teléfono fijado; stacking cards solo como fallback móvil.
5. **Intensidad**: espectacular en **todas** las secciones, sin trabas: niveles de dispositivo,
   bucles pausados fuera de pantalla y un solo efecto pesado a la vez (principio 8).
6. **Flujo**: todo sobre `dev`; implementación con Sonnet.
7. **Contenido**: escalable desde `src/data/` sin tocar animaciones (§5.11).
8. **V0 (2026-10-21)**: nueva fase V1 "Fundación UI" antes del motion; Experiencia sin pin
   horizontal; recortes de §7; prototipar intro larga y corta; corregir tildes.
9. **V1 (2026-10-21)**: logo se queda en **"PORTFOLIO"** (GM descartado); títulos con el
   **degradado original** `primary-800 → 500` (decisión estética del usuario, aun con contraste
   bajo en la parte inferior); header fijo en todos los anchos con la pill siguiendo el scroll.
