---
description: Verifica que los cambios no rompieron nada (build Astro + revisión visual)
---
1. Ejecuta `npm run build` y reporta errores/warnings.
2. Confirma con `git status` que solo se modificaron los archivos previstos.
3. Revisa con `npm run preview` (Claude in Chrome o screenshots): textos, espaciados, responsive (móvil/escritorio) e interacciones (menú, carruseles, modales, formulario).
4. Reporta: qué pasó, qué falló, qué falta.
