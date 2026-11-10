---
description: Actualiza el contenido de una sección del portafolio según el CV, con plan aprobado y rama propia
argument-hint: <sección: hero | sobre-mi | experiencia | proyectos | habilidades | stats | contacto>
---
Actualizaremos el contenido de la sección **$ARGUMENTS** a partir del CV vigente.

## Preparación
1. Lee `CLAUDE.md` y la memoria del proyecto.
2. Confirma la rama con `git branch --show-current`. La base es `dev`. Crea (o usa) `contenido/<sección>`
   desde `dev`. Nunca trabajes sobre `dev` ni `main` directamente y nunca hagas push sin que lo pida.
3. Lee el CV con `pdftotext` (ruta en Descargas; pregunta si no la sabes). Los títulos de cada curso
   aparecen DESPUÉS de su descripción: no los cruces.
4. Lee el archivo de datos (`src/data/<sección>.ts`) y el componente (`src/components/sections/*.astro`).
   Detecta textos fijos en el componente que deberían vivir en `src/data` (el contenido se edita solo allí).

## Planificar (sin escribir código)
5. Propón, campo por campo, el **antes / después**, con el texto exacto. Marca lo que no pueda verificarse
   en el CV (edad, años de experiencia, URLs, capturas) y pregúntalo.
6. **PUNTO DE CONTROL**: espera aprobación del usuario.

## Implementar
7. Cambios pequeños: datos en `src/data/*.ts`; el componente solo si hace falta mover textos fijos a datos.
   Iconos/imágenes nuevos en `public/assets` o `src/assets/mockups`.
8. Corre `/verificar`: build + capturas a 1440, 1100×540 y 390 px. Prueba con contenido largo y corto.
9. **PUNTO DE CONTROL**: resume qué cambió, qué archivos, qué falta y qué sigue.

## Cerrar
10. Commit (un commit por sección, mensaje `content(<sección>): ...`) y merge a `dev` **solo** cuando el usuario lo pida.
