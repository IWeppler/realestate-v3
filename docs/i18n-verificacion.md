# Cierre de i18n del sitio público

Fecha: 2 de octubre de 2026. Proyecto: `realestate-v3`.

Las tareas 2 a 5 quedaron revisadas y verificadas sobre el trabajo existente de Claude. El español sigue siendo la fuente de verdad; el portugués usa `/pt`.

## Correcciones de esta revisión

- Se completaron las canónicas y los alternativos de idioma de la home, incluido `x-default` hacia el español.
- El sitemap ahora enumera cada URL en ambos idiomas, con sus alternativos. En la base consultada produjo 58 entradas: 29 españolas y 29 portuguesas. Las ciudades se normalizan igual que las páginas de zonas. Un error de consulta ya no produce silenciosamente un sitemap parcial.
- La imagen social pasó de la convención automática de Next a `propiedades/[slug]/opengraph-image/route.tsx`. La metadata declara las URLs públicas `/propiedades/<id>/opengraph-image` y `/pt/propiedades/<id>/opengraph-image`, sin los segmentos internos `/es-AR` o `/pt-BR` que provocaban redirecciones o 404.
- El estado, los datos resumidos y el precio a consultar de las imágenes sociales se traducen. Los textos españoles originales de esa pieza se conservaron. El generador compartido recibe textos opcionales; sus otros consumidores conservan los valores predeterminados.
- Se tradujo el precio a consultar cuando falta un precio en la metadata de la ficha y en la agenda de visitas.
- Los controles de zoom, orientación, pantalla completa, atribución y cierre de ficha del mapa público reciben etiquetas traducidas. Los componentes compartidos aceptan esas etiquetas sin cambiar los valores predeterminados de otros consumidores.
- Se revisaron los textos portugueses de la home y la ficha. Se ajustaron tres frases para que suenen más naturales: el título del resumen del inmueble, el plazo medio de venta y una oración del testimonio de la propietaria.
- El título raíz usa `BRAND.name` en lugar de una marca fija.

## Mensajes finales

| Sección | Claves por idioma |
|---|---:|
| about | 22 |
| appraisal | 64 |
| booking | 84 |
| common | 55 |
| contact | 62 |
| home | 33 |
| listing | 80 |
| property | 78 |
| searchAlert | 37 |
| zones | 20 |
| **Total** | **535** |

Ambos idiomas tienen las mismas claves. La revisión adicional de sintaxis ICU comprobó variables, tipos de argumento, opciones de plurales y etiquetas enriquecidas: 535 claves, sin diferencias ni errores de sintaxis.

## Verificaciones

- `pnpm exec tsc --noEmit -p . --incremental false`: sin errores.
- `node scripts/check-messages.mjs`: `Mensajes OK`.
- Build de producción de Next: exitoso, con comprobación de TypeScript y generación de las rutas.
- Auditoría de textos JSX y atributos de accesibilidad en `app/[locale]`, `features/public/v2`, `features/properties` y `features/booking`: sin omisiones, excluyendo el nombre de la plataforma WhatsApp.
- Búsqueda de imports de navegación: los componentes públicos usan `i18n/navigation`; los imports restantes de `next/navigation` corresponden a `notFound`, parámetros y búsqueda, permitidos por la guía.
- Prueba HTTP en producción y con el servidor de `pnpm dev` existente: home, listado, contacto, tasación, nosotros, zonas, ficha, agenda y una zona real, en ambos idiomas; 18 respuestas 200.
- Canónicas absolutas, `hreflang` para ambos idiomas y `x-default` correctos en las páginas indexables. La agenda conserva su política `noindex`.
- Las dos imágenes enlazadas por la metadata responden directamente 200 y `image/png`. Las dos rutas literales `/propiedades/<id>/opengraph-image` también responden 200. Se inspeccionó la pieza portuguesa generada.
- `robots.txt` y `sitemap.xml`: 200.
- Direcciones inexistentes: 404 y contenido de error en español o portugués según la ruta.
- Revisión de espacios de los cambios: sin errores.

## Entorno local y observaciones

El bloqueo de SWC en Windows se resolvió con `SWC_NATIVE_BINDING_CACHE` apuntando a `node_modules/.cache/swc-native`. Se guardó solo en `.env.local`, ignorado por Git. La caché queda fuera de `.next`, porque el build limpia esa carpeta. El build posterior funcionó sin definir esa variable manualmente en la terminal.

La comprobación adicional de ESLint no está completamente verde: `shared/components/ui/map.tsx` tiene 13 errores previos (11 de `react-hooks/refs` y 2 de `react-hooks/set-state-in-effect`). Se comparó el archivo de `HEAD` contra el actualizado: mismo recuento y mismas reglas. Los otros archivos revisados de esta corrección no informaron errores. Corregir la lógica de esos hooks excede la extracción de textos.

La home conserva la política previa de `noindex, nofollow` del rediseño. Esa decisión debe revisarse al aprobar su publicación.

Los títulos y descripciones de propiedades, tipos, amenities y ubicaciones provenientes de la base no se traducen, conforme a `docs/i18n.md`. Las notas de leads y los textos internos para el equipo siguen en español. La revisión lingüística fue asistida; no sustituye una revisión editorial por una persona nativa de Brasil.
