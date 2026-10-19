---
description: Verifica que la migración no rompió nada (build Astro + paridad con legacy)
---
1. Si existe `astro-app/`, ejecuta `npm run build` ahí y reporta errores/warnings.
2. Confirma con `git status` que no se modificaron archivos legacy fuera de lo previsto en la fase.
3. Compara visualmente (Claude in Chrome o screenshots) la sección migrada contra `index.html` legacy: textos, espaciados, responsive (móvil/escritorio), interacciones de `script.js`.
4. Reporta: qué pasó, qué falló, qué falta. No marques la fase como completa si algo falla.
