import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types/supabase";
import { routing } from "@/i18n/routing";
import { localizedPath, siteUrl } from "@/i18n/seo";
import { zoneSlug } from "@/features/public/zones";

// Una entrada por página e idioma con sus alternativos (hreflang). Las
// propiedades y las zonas salen de la base; se lee con la anon key (las
// propiedades son públicas) para no depender de cookies.
export const revalidate = 3600;

const STATIC_PATHS = ["/", "/propiedades", "/zonas", "/nosotros", "/tasar", "/contacto"];

function entries(path: string): MetadataRoute.Sitemap {
  const languages = {
    ...Object.fromEntries(routing.locales.map((locale) => [locale, `${siteUrl}${localizedPath(path, locale)}`])),
    "x-default": `${siteUrl}${localizedPath(path, routing.defaultLocale)}`,
  };
  return routing.locales.map((locale) => ({
    url: `${siteUrl}${localizedPath(path, locale)}`,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data, error } = await supabase
    .from("properties")
    .select("id, city")
    .in("status", ["EN_VENTA", "EN_ALQUILER"]);

  if (error) throw new Error("No se pudieron cargar las propiedades del sitemap.");

  const rows = data ?? [];
  const properties = rows.flatMap((p) => entries(`/propiedades/${p.id}`));
  // Una página por ciudad con propiedades disponibles (mismo slug que /zonas).
  const zones = [...new Set(rows.map((p) => p.city?.trim()).filter((c): c is string => Boolean(c)).map(zoneSlug))].filter(Boolean).flatMap((slug) => entries(`/zonas/${slug}`));
  return [...STATIC_PATHS.flatMap(entries), ...zones, ...properties];
}
