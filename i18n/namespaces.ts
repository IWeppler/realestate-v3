// Un archivo de mensajes por sección del sitio: messages/<locale>/<ns>.json.
// Cada sección se traduce y se revisa por separado, y varias personas (o
// agentes) pueden trabajar en paralelo sin tocar el mismo archivo. Para
// sumar una sección: crear el JSON en cada idioma y agregarla acá.
export const NAMESPACES = [
  "common", // header, footer, errores, 404, textos compartidos
  "home",
  "about", // /nosotros
  "zones", // /zonas y /zonas/[zona]
  "listing", // /propiedades: barra, filtros, tarjetas, mapa
  "property", // ficha /propiedades/[slug]
  "contact", // /contacto y contacto desde la ficha
  "appraisal", // /tasar
  "searchAlert", // alerta "Avisame cuando entre"
  "booking", // /agendar/[id]
] as const;

export type Namespace = (typeof NAMESPACES)[number];
