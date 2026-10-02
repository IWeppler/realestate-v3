import { BRAND } from "@/lib/brand";
import { LOCALE_PREFIXES, routing, type Locale } from "@/i18n/routing";

// Ruta pública de una página en un idioma: "/propiedades" → "/pt/propiedades".
export function localizedPath(path: string, locale: Locale): string {
  const prefix = LOCALE_PREFIXES[locale];
  return path === "/" ? prefix || "/" : `${prefix}${path}`;
}

// `alternates` de la metadata: la propia URL como canónica y un hreflang por
// idioma (más x-default hacia el español) para que Google muestre cada
// versión a quien corresponde. `path` va sin prefijo de idioma.
export function localizedAlternates(path: string, locale: Locale) {
  return {
    canonical: localizedPath(path, locale),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, localizedPath(path, l)])),
      "x-default": localizedPath(path, routing.defaultLocale),
    },
  };
}

// Código Open Graph del idioma (es-AR → es_AR).
export const ogLocale = (locale: Locale) => locale.replace("-", "_");

export const siteUrl = BRAND.siteUrl.replace(/\/$/, "");
