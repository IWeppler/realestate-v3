import "server-only";
import { createClientServer } from "@/lib/supabase";

// Zonas = ciudades con propiedades disponibles. Cada una tiene su página
// (/zonas/[slug]) con el slug derivado del nombre: "San José del Rincón"
// → "san-jose-del-rincon".

export type Zone = {
  slug: string;
  city: string;
  province: string | null;
  count: number;
  sale: number;
  rent: number;
  // Precio más bajo en venta (para "desde USD ..."); null si no hay.
  minSale: { price: number; currency: string } | null;
  image: string | null;
};

export function zoneSlug(city: string) {
  return city
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Row = {
  city: string | null;
  province: string | null;
  status: string;
  price: number | null;
  currency: string | null;
  property_images: { image_url: string | null; order: number | null }[] | null;
};

function cover(images: Row["property_images"]) {
  return (
    [...(images ?? [])]
      .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
      .map((i) => i.image_url)
      .find((u): u is string => Boolean(u)) ?? null
  );
}

// Todas las zonas, de la que más propiedades tiene a la que menos. La foto
// de cada zona es la portada más reciente de una de sus propiedades, sin
// repetir entre zonas cuando se puede.
export async function getZones(): Promise<Zone[]> {
  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from("properties")
    .select("city, province, status, price, currency, property_images ( image_url, order )")
    .in("status", ["EN_VENTA", "EN_ALQUILER"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al cargar zonas:", error.message);
    return [];
  }

  const byCity = new Map<string, Zone & { covers: string[] }>();
  for (const row of (data ?? []) as Row[]) {
    const city = row.city?.trim();
    if (!city) continue;
    const slug = zoneSlug(city);
    const zone = byCity.get(slug) ?? {
      slug,
      city,
      province: row.province,
      count: 0,
      sale: 0,
      rent: 0,
      minSale: null,
      image: null,
      covers: [],
    };
    zone.count += 1;
    if (row.status === "EN_VENTA") {
      zone.sale += 1;
      // Solo se compara dentro de la misma moneda que el primer precio.
      if (row.price && row.price > 0) {
        const currency = row.currency ?? "USD";
        if (!zone.minSale || (currency === zone.minSale.currency && row.price < zone.minSale.price)) {
          zone.minSale = { price: row.price, currency };
        }
      }
    } else {
      zone.rent += 1;
    }
    const c = cover(row.property_images);
    if (c) zone.covers.push(c);
    byCity.set(slug, zone);
  }

  const used = new Set<string>();
  return [...byCity.values()]
    .sort((a, b) => b.count - a.count)
    .map(({ covers, ...zone }) => {
      const image = covers.find((u) => !used.has(u)) ?? covers[0] ?? null;
      if (image) used.add(image);
      return { ...zone, image };
    });
}

export async function getZone(slug: string) {
  const zones = await getZones();
  return { zone: zones.find((z) => z.slug === slug) ?? null, zones };
}
