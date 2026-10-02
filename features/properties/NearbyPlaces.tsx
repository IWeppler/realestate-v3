import { getTranslations } from "next-intl/server";
import { NEARBY_ICONS, type NearbyPlace } from "@/features/properties/nearby-categories";

// "Qué hay cerca": lugares agrupados por categoría, del más cercano al más lejano.
export async function NearbyPlaces({ places }: { places: NearbyPlace[] }) {
  if (places.length === 0) return null;
  const t = await getTranslations("property.nearby");

  const groups = new Map<NearbyPlace["category"], NearbyPlace[]>();
  for (const p of places) groups.set(p.category, [...(groups.get(p.category) ?? []), p]);

  const distance = (m: number | null) => {
    if (m === null) return null;
    return m >= 1000
      ? t("km", { value: (m / 1000).toLocaleString("es-AR", { maximumFractionDigits: 1 }) })
      : t("meters", { value: m });
  };

  return (
    <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {[...groups.entries()].map(([category, items]) => {
        const Icon = NEARBY_ICONS[category];
        return (
          <li key={category} className="rounded-3xl bg-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              {t(`categories.${category}`)}
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {items
                .sort((a, b) => (a.distance_m ?? Infinity) - (b.distance_m ?? Infinity))
                .map((p) => (
                  <li key={p.id} className="flex items-baseline justify-between gap-3 text-[15px] text-foreground">
                    <span className="min-w-0 truncate">{p.name}</span>
                    {p.distance_m !== null && (
                      <span className="shrink-0 text-sm text-fg-secondary tabular-nums">{distance(p.distance_m)}</span>
                    )}
                  </li>
                ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
