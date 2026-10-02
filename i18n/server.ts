import "server-only";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";

// El `locale` de los params de Next llega como string; el proxy ya filtró
// los inválidos, pero por las dudas cae al español.
export function asLocale(value: string): Locale {
  return hasLocale(routing.locales, value) ? value : routing.defaultLocale;
}

// Primera línea de cada page/layout bajo app/[locale]: fija el idioma del
// pedido (getTranslations sin locale lo usa) y permite el render estático.
export function initLocale(value: string): Locale {
  const locale = asLocale(value);
  setRequestLocale(locale);
  return locale;
}
