import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Conecta i18n/request.ts (mensajes y locale de cada pedido).
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    // El layout raíz es app/[locale]/layout.tsx (no hay uno arriba), así
    // que las URLs sin ninguna ruta usan app/global-not-found.tsx.
    globalNotFound: true,
  },
  images: {
    // AVIF primero (~20-30% menos que WebP con la misma calidad) y WebP para
    // los navegadores que no lo soportan.
    formats: ["image/avif", "image/webp"],
    // 90 lo usa la galería a pantalla completa; sin estar acá se bajaba a 75.
    qualities: [75, 90],
    // Las fotos de Storage tienen un uuid en el nombre y no cambian: cachear
    // un mes evita volver a codificar (AVIF es lento de generar).
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nbiapbhfzfglrbhmproc.supabase.co",
        port: "",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
