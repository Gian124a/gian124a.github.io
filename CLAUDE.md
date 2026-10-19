# Portfolio (Astro)

Migración a Astro completada (Fase 7). El sitio vive en la raíz del repo; el legacy quedó retirado
(respaldo: tag `legacy-final`). Historial y decisiones: `docs/MIGRATION_PLAN.md`.

## Stack
- Astro 7 + Tailwind v4 (`@tailwindcss/vite`, escaneo limitado a `src/` en `src/styles/global.css`)
- Iconos: `<img>` SVG en `public/assets`. Mockups con `astro:assets` en `src/assets/mockups`
- Datos en `src/data/*.ts`, scripts por componente y módulos en `src/scripts/`
- Analítica (Clarity): no se migró

## Despliegue
- `main` se despliega a producción en Netlify (`netlify.toml`: `npm run build`, publica `dist`).
- **Nunca** hacer push sin que el usuario lo pida. Confirmar rama con `git branch --show-current` antes de mergear.

## Workflow: Explorar -> Planificar -> Implementar -> Verificar -> Commit
1. **Explorar**: leer código relevante, sin escribir.
2. **Planificar**: nada se implementa sin plan aprobado.
3. **Implementar**: cambios pequeños, una tarea por vez.
4. **Verificar**: `/verificar` (build + revisión visual).
5. **Commit**: un commit por tarea, solo cuando el usuario lo pida.

## Convenciones
- Idioma de comunicación: español. Código/identificadores: inglés o como ya estén.
- Comandos: `/fase <N>` inicia una fase, `/verificar` valida.
