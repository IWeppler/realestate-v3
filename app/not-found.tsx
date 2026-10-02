import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { siteFontVars } from "@/app/fonts/site";
import { SiteHeader } from "@/features/public/v2/SiteHeader";
import { SiteFooter } from "@/features/public/v2/SiteFooter";
import { NotFoundContent } from "@/features/public/v2/NotFoundContent";

export const metadata: Metadata = { title: `Página no encontrada | ${BRAND.name}` };

// 404 de las direcciones que no existen en ninguna ruta. Vive fuera del
// layout de (public), así que arma el mismo envoltorio: tokens, fuentes,
// header y footer del sitio.
export default function NotFound() {
  return (
    <div className="site-public contents">
      <style href="site-fonts" precedence="default">
        {siteFontVars()}
      </style>
      <SiteHeader />
      <main id="contenido" className="flex min-h-[100dvh] flex-col pt-16">
        <NotFoundContent />
      </main>
      <SiteFooter />
    </div>
  );
}
