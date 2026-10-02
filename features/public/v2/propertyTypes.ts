import "server-only";
import { createClientServer } from "@/lib/supabase";

export type TypeTile = {
  id: number;
  name: string;
  count: number;
  image: string | null;
};

type TypeGroup = Omit<TypeTile, "image"> & { candidates: string[] };

type Row = {
  property_type_id: number | null;
  property_types: { name: string } | null;
  property_images: { image_url: string | null; order: number | null }[] | null;
};

// Fotos en el orden que definió la inmobiliaria. (No se reusa
// `cardImages` para no depender del módulo de la tarjeta.)
function orderedImages(images: Row["property_images"]) {
  return [...(images ?? [])]
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
    .map((img) => img.image_url)
    .filter((url): url is string => Boolean(url));
}

// Tipos con propiedades disponibles, ordenados por cantidad. Cada tipo
// usa la portada más reciente que no esté usando otro tipo, así dos tipos
// no repiten foto. Lo usan el buscador del hero (solo id y nombre) y la
// sección "Explorá por tipo".
export async function getTypeTiles(limit = 6): Promise<TypeTile[]> {
  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from("properties")
    .select("property_type_id, property_types ( name ), property_images ( image_url, order )")
    .in("status", ["EN_VENTA", "EN_ALQUILER"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al cargar tipos:", error.message);
    return [];
  }

  const byType = new Map<number, TypeGroup>();
  for (const row of (data ?? []) as unknown as Row[]) {
    if (!row.property_type_id || !row.property_types) continue;
    const group = byType.get(row.property_type_id) ?? {
      id: row.property_type_id,
      name: row.property_types.name,
      count: 0,
      candidates: [],
    };
    group.count += 1;
    // Portada primero, el resto de las fotos como reserva.
    group.candidates.push(...orderedImages(row.property_images));
    byType.set(row.property_type_id, group);
  }

  const used = new Set<string>();
  return [...byType.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(({ candidates, ...tile }) => {
      const image = candidates.find((url) => !used.has(url)) ?? candidates[0] ?? null;
      if (image) used.add(image);
      return { ...tile, image };
    });
}
