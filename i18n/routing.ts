import { defineRouting } from "next-intl/routing";

// Idiomas del sitio público. El español es el principal y va sin prefijo
// (/propiedades), así no cambian los links ni el SEO que ya existen; el
// portugués va en /pt (/pt/propiedades). Los códigos llevan región porque
// también definen el formato de fechas y números (Intl).
// Prefijo de URL de cada idioma (el español, al ser el principal, no lleva).
export const LOCALE_PREFIXES = { "es-AR": "", "pt-BR": "/pt" } as const;

export const routing = defineRouting({
  locales: ["es-AR", "pt-BR"],
  defaultLocale: "es-AR",
  localePrefix: {
    mode: "as-needed",
    prefixes: { "pt-BR": LOCALE_PREFIXES["pt-BR"] },
  },
});

export type Locale = (typeof routing.locales)[number];
