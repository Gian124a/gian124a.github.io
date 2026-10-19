# Plan de migración a Astro (estrategia incremental)

**Principio:** el sitio actual sigue intacto y desplegable hasta el corte final. Astro se construye en paralelo
en `astro-app/`, sección por sección, y se compara contra el legacy.

## Fases (marcar al terminar)
- [x] **Fase 0 – Entorno**: CLAUDE.md, comandos `/fase` y `/verificar`, este plan.
- [x] **Fase 1 – Scaffold**: crear `astro-app/` (Astro + Tailwind v4 vía `@tailwindcss/vite`), página vacía que compile. Rama `migracion/fase-1-scaffold`.
- [ ] **Fase 2 – Fundaciones**: mover tokens de `src/input.css` (@theme), `styles.css`, assets a `astro-app/`; `Layout.astro` (head, meta, Clarity), iconos bootstrap-icons.
- [ ] **Fase 3 – Layout compartido**: `Header/Nav` y `Footer` como componentes.
- [ ] **Fase 4 – Secciones (1 por sesión)**: las 6 `<section>` de `index.html` -> `src/components/sections/*.astro`. Datos repetidos (proyectos, skills) a `src/data/*.ts` o content collections.
- [ ] **Fase 5 – Interactividad**: dividir `script.js` (635 líneas) en scripts por componente (`<script>` de Astro); islas (`client:*`) solo si hacen falta.
- [ ] **Fase 6 – Optimización**: `astro:assets` para imágenes, SEO/OG, fuentes, Lighthouse, accesibilidad.
- [ ] **Fase 7 – Corte**: mover `astro-app/` a la raíz, retirar archivos legacy, actualizar despliegue. Único momento en que `dev` se mergea a `main`; con aprobación explícita.

## Gestión de riesgo
- `main` = producción, intocable hasta la Fase 7. Toda la migración se integra en `dev`.
- Una rama por fase (`migracion/fase-N-nombre`, sale de `dev`) y un commit por tarea.
- Verificación visual contra legacy tras cada sección (`/verificar`).
- Sin cambios de diseño durante la migración: paridad primero, mejoras después.

## Bitácora
(anotar aquí decisiones y hallazgos por fase)
- Fase 1: Astro 7 + Tailwind v4 (`@tailwindcss/vite`), instalación independiente en `astro-app/`. Plugin `line-clamp` no se migra (v4 lo trae nativo; confirmar en Fase 4).
- Se mergeó por error a `main` local (sin push); revertido. Desde entonces: integración solo en `dev`.
