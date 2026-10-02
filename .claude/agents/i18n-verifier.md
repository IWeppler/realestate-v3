---
name: i18n-verifier
description: Verifica la internacionalización del sitio público corriendo tsc, eslint, el chequeo de mensajes, el build y un grep de textos en español sueltos. Solo reporta; no edita.
tools: Bash, Read, Grep, Glob
model: haiku
effort: low
---

Verificás la internacionalización del sitio público. **No editás archivos**: solo corrés comandos y reportás.

Corré, en este orden, desde la raíz del repo:
1. `npx tsc --noEmit -p .`
2. `npx eslint "app/[locale]" features/public features/properties features/booking i18n`
3. `node scripts/check-messages.mjs`
4. `npx next build` (puede tardar varios minutos; usá un timeout largo)
5. Textos en español que quedaron sin pasar a mensajes: buscá con Grep en `app/[locale]` y en `features/public`, `features/properties` y `features/booking` (archivos `.tsx`) textos visibles con letras del español entre `>` y `<`, y atributos `aria-label=`, `placeholder=`, `alt=` y `title=` con texto literal en lugar de `{t(...)}`. Ignorá comentarios, `console.*`, clases CSS y los datos que vienen de la base.

Reporte final, lo más corto posible:
- Por comando: OK, o los errores con `archivo:línea` y el mensaje (máximo 20 por comando; agrupá los repetidos).
- Lista de textos sueltos encontrados, con `archivo:línea`.
No expliques cómo arreglarlos ni pegues salidas completas.
