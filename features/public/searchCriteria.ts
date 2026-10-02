// Criterios de una búsqueda del listado (los mismos parámetros que
// interpreta /propiedades) y su resumen legible. Lo usan la alerta de
// búsqueda (chips en el diálogo) y la Server Action (nota del lead).

export const CRITERIA_KEYS = ["tipo", "typeId", "loc", "q", "bedrooms", "bathrooms", "amenities"] as const;
export type CriteriaKey = (typeof CRITERIA_KEYS)[number];
export type SearchCriteria = Partial<Record<CriteriaKey, string>>;

type Named = { id: number | string; name: string | null };

// Solo las claves conocidas, recortadas y sin vacíos.
export function pickCriteria(source: Record<string, string | string[] | undefined | null>): SearchCriteria {
  const out: SearchCriteria = {};
  for (const key of CRITERIA_KEYS) {
    const raw = source[key];
    const value = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 200);
    if (value) out[key] = value;
  }
  return out;
}

// Un criterio legible; `item` marca un valor dentro de una lista (una de
// las ciudades de `loc` o de las amenities), para poder quitarlo solo.
export type CriteriaChip = { key: CriteriaKey; item?: string; label: string };

const list = (v?: string) => v?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];

// Un chip por criterio, en el orden en que se lee una búsqueda.
export function criteriaChips(c: SearchCriteria, types: Named[] = [], amenities: Named[] = []): CriteriaChip[] {
  const name = (named: Named[], id: string) => named.find((x) => String(x.id) === id)?.name || id;
  const chips: CriteriaChip[] = [];
  if (c.tipo === "venta") chips.push({ key: "tipo", label: "Para comprar" });
  if (c.tipo === "alquiler") chips.push({ key: "tipo", label: "Para alquilar" });
  if (c.typeId) chips.push({ key: "typeId", label: name(types, c.typeId) });
  for (const city of list(c.loc)) chips.push({ key: "loc", item: city, label: city });
  if (c.q) chips.push({ key: "q", label: `“${c.q}”` });
  if (c.bedrooms) chips.push({ key: "bedrooms", label: `${c.bedrooms}+ dormitorios` });
  if (c.bathrooms) chips.push({ key: "bathrooms", label: `${c.bathrooms}+ baños` });
  for (const id of list(c.amenities)) chips.push({ key: "amenities", item: id, label: name(amenities, id) });
  return chips;
}

export function describeCriteria(c: SearchCriteria, types: Named[] = [], amenities: Named[] = []): string[] {
  return criteriaChips(c, types, amenities).map((chip) => chip.label);
}

// La búsqueda sin ese chip.
export function withoutChip(c: SearchCriteria, chip: CriteriaChip): SearchCriteria {
  const next = { ...c };
  const rest = chip.item ? list(c[chip.key]).filter((v) => v !== chip.item) : [];
  if (rest.length) next[chip.key] = rest.join(",");
  else delete next[chip.key];
  return next;
}

export function criteriaQuery(c: SearchCriteria) {
  const params = new URLSearchParams();
  for (const key of CRITERIA_KEYS) if (c[key]) params.set(key, c[key]!);
  return params.toString();
}
