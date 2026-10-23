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
    // Vercel cobra cada combinación distinta de foto × ancho × formato ×
    // calidad como una transformación. Un solo formato, una sola calidad y
    // pocos anchos bajan el máximo por foto de 60 a 7.
    formats: ["image/webp"],
    qualities: [75],
    deviceSizes: [640, 1080, 1600, 2048],
    imageSizes: [96, 256, 384],
    // Las fotos de Storage tienen un uuid en el nombre y no cambian: cachear
    // un mes evita volver a codificarlas.
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
