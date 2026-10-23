---
description: Trabaja una fase del plan visual (V0–V8) de forma controlada, con puntos de control
argument-hint: <fase, p. ej. V1> [tarea]
---
Trabajaremos la **fase $ARGUMENTS** de `docs/VISUAL_PLAN.md`.

## Preparación
1. Lee `CLAUDE.md`, las "Reglas de trabajo", los principios (§2) y la sección de la fase en `docs/VISUAL_PLAN.md`.
2. Confirma la rama con `git branch --show-current`. La base es `dev`; si la fase implica código,
   crea/usa `visual/<fase>-<nombre>` desde `dev`. Nunca trabajes sobre `main`.
3. Si existe `docs/visual/<fase>.md` (notas de la fase), léelo y continúa donde quedó.

## Planificar (sin escribir código)
4. Propón un checklist de **tareas pequeñas** (cada una revisable por sí sola), qué skill de diseño
   usa cada una (§6), riesgos y cómo se verifica. Incluye la prueba de contenido (§5.11) cuando aplique.
5. **PUNTO DE CONTROL**: detente y espera aprobación.

## Implementar (una tarea a la vez)
6. Cada tarea la implementa un agente con `model: "sonnet"`, con una especificación cerrada:
   archivos a tocar, comportamiento esperado, niveles full/lite/reduced, reglas de §5.11 y qué NO tocar.
7. Revisa lo que hizo el agente (diff + `review-animations` cuando haya motion) antes de mostrarlo.
8. **PUNTO DE CONTROL** tras cada tarea: explica en lenguaje claro qué se hizo, por qué, qué archivos
   cambiaron, cómo verlo (`npm run dev` + sección/interacción concreta) y qué sigue. Espera aprobación
   antes de la siguiente tarea. Nunca encadenes varias tareas sin parar.

## Cerrar la fase
9. `/verificar` + criterios de aceptación del §7 (incluida la prueba de contenido).
10. Actualiza `docs/visual/<fase>.md` con lo hecho, decisiones y pendientes.
11. Commit y merge a `dev` **solo** cuando el usuario lo pida. Nunca push sin que lo pida.
