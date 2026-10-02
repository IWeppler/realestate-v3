import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Idioma de cada pedido: /pt/... es portugués; el resto, español. La
// primera visita sin preferencia guardada se manda al idioma del navegador
// (Accept-Language) y la elección queda en una cookie.
export default createMiddleware(routing);

export const config = {
  // Todo menos la API, los internos de Next/Vercel, los íconos generados
  // en la raíz (/icon, /apple-icon) y los archivos con extensión
  // (imágenes, robots.txt, sitemap.xml...).
  matcher: "/((?!api|_next|_vercel|icon|apple-icon|.*\\..*).*)",
};
