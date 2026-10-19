# Portfolio -> migración gradual a Astro

## Estado actual (legacy, NO romper)
- `index.html` monolítico (secciones, nav, footer), `src/scripts/script.js`, `src/styles/styles.css`
- Tailwind v4 vía CLI: `src/input.css` -> `src/output.css`. Iconos: `<img>` SVG en `src/assets` (bootstrap-icons no se usa)
- Analítica: Clarity sigue en `index.html` legacy pero **no se migra** a Astro

## Regla de oro
El sitio legacy debe seguir funcionando en cada commit hasta la fase de corte (Fase 7).
La app Astro vive en `astro-app/` y no modifica archivos legacy hasta ese corte.

## Ramas (main = producción)
- `main` se despliega a producción: **nunca** mergear ni commitear migración ahí hasta la Fase 7.
- `dev` = rama de integración de la migración. Cada fase sale de `dev` (`migracion/fase-N-nombre`) y vuelve a `dev`.
- Antes de cualquier merge, confirmar rama destino con `git branch --show-current`. Nunca hacer push sin que el usuario lo pida.

## Workflow: Explorar -> Planificar -> Implementar -> Verificar -> Commit
1. **Explorar**: leer código relevante, sin escribir. Usar subagente `Explore` si es amplio.
2. **Planificar**: plan mode (Shift+Tab). Nada se implementa sin plan aprobado.
3. **Implementar**: una sola fase/tarea por sesión. Cambios pequeños.
4. **Verificar**: `/verificar` (build + comparación visual contra legacy).
5. **Commit**: un commit por tarea, en rama `migracion/fase-N-nombre`; merge a `dev` (nunca a `main`). Solo cuando el usuario lo pida.
Tras cada fase: `/clear` y marcar la fase en `docs/MIGRATION_PLAN.md`.

## Convenciones
- Idioma de comunicación: español. Código/identificadores: inglés o como ya estén.
- Plan maestro y estado: `docs/MIGRATION_PLAN.md` (fuente de verdad del avance).
- Comandos: `/fase <N>` inicia una fase, `/verificar` valida.
