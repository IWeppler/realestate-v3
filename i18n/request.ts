import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { NAMESPACES } from "@/i18n/namespaces";

// Mensajes del idioma pedido: junta los JSON de cada sección en un solo
// objeto ({ common: {...}, listing: {...} }). Se usan con
// getTranslations("listing") / useTranslations("listing").
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const entries = await Promise.all(
    NAMESPACES.map(async (ns) => [ns, (await import(`../messages/${locale}/${ns}.json`)).default] as const),
  );

  return {
    locale,
    messages: Object.fromEntries(entries),
    timeZone: "America/Argentina/Buenos_Aires",
  };
});
