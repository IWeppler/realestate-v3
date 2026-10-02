import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { siteFontVars } from "@/app/fonts/site";
import { SiteHeader } from "@/features/public/v2/SiteHeader";
import { SiteFooter } from "@/features/public/v2/SiteFooter";
import { initLocale } from "@/i18n/server";

// Títulos de pestaña con el nombre de la inmobiliaria ("Ficha | Marca").
export const metadata: Metadata = {
  title: { default: BRAND.name, template: `%s | ${BRAND.name}` },
};

// Layout del sitio público v3: tokens y fuentes de `site-public`, navbar
// fija de 64px (de ahí el pt-16) y footer.
export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  initLocale((await params).locale);
  return (
    <div className="site-public contents">
      <style href="site-fonts" precedence="default">
        {siteFontVars()}
      </style>
      <SiteHeader />
      <main id="contenido" className="flex min-h-[100dvh] flex-col pt-16">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
