import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/i18n/seo";
import { BRAND } from "@/lib/brand";
import { Toaster } from "@/shared/components/ui/sonner";
import "../globals.css";

// metadataBase: las URLs relativas de canonical, hreflang y og:image salen absolutas.
export const metadata: Metadata = {
  title: BRAND.name,
  metadataBase: new URL(siteUrl),
};

// Una versión estática de cada página por idioma.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Layout raíz (no hay app/layout.tsx: el idioma es el primer segmento, así
// que <html lang> se arma acá). Único lugar con <html> y <body>. Los layouts
// de cada grupo de rutas (p. ej. `(public)`) solo agregan su envoltorio,
// fuentes y chrome. NextIntlClientProvider pasa el idioma y los mensajes a
// los componentes de cliente (useTranslations).
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
