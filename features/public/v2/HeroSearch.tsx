"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import {
  LocationCombobox,
  type LocationSuggestion,
  type SearchValue,
} from "@/features/properties/LocationCombobox";
import { ChoiceGroup, SegmentedControl } from "@/features/public/v2/ChoiceGroup";

export type PropertyTypeOption = { id: number; name: string };

export const BEDROOM_OPTIONS = [
  { label: "Todos", value: "" },
  { label: "1+", value: "1" },
  { label: "2+", value: "2" },
  { label: "3+", value: "3" },
  { label: "4+", value: "4" },
];

// Buscador vertical del hero: una tarjeta con los filtros que más se usan
// apilados (operación, tipo, zona, dormitorios) y un solo botón. Manda los
// mismos parámetros que /propiedades ya interpreta: tipo, typeId, loc, q y
// bedrooms (mínimo).
export function HeroSearch({
  locations,
  types,
}: {
  locations: LocationSuggestion[];
  types: PropertyTypeOption[];
}) {
  const t = useTranslations("home.search");
  const router = useRouter();
  const operations = [
    { label: t("buy"), value: "venta" },
    { label: t("rent"), value: "alquiler" },
  ];
  const bedroomOptions = BEDROOM_OPTIONS.map((o) => (o.value === "" ? { ...o, label: t("all") } : o));
  const [operation, setOperation] = useState("venta");
  const [typeId, setTypeId] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [search, setSearch] = useState<SearchValue>({ locs: [], q: "" });
  const zoneId = useId();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ tipo: operation });
    if (typeId) params.set("typeId", typeId);
    if (search.locs.length) params.set("loc", search.locs.join(","));
    if (search.q) params.set("q", search.q);
    if (bedrooms) params.set("bedrooms", bedrooms);
    router.push(`/propiedades?${params.toString()}`);
  };

  return (
    <form
      role="search"
      aria-label={t("aria")}
      onSubmit={handleSearch}
      className="flex w-full flex-col gap-6 rounded-3xl bg-card p-5 shadow-[0_30px_60px_-30px_rgb(21_21_21/0.55)] md:p-7"
    >
      <SegmentedControl label={t("operation")} options={operations} value={operation} onChange={setOperation} />

      {types.length > 0 && (
        <ChoiceGroup
          label={t("type")}
          options={[{ label: t("all"), value: "" }, ...types.map((ty) => ({ label: ty.name, value: String(ty.id) }))]}
          value={typeId}
          onChange={setTypeId}
          layoutId="hero-type"
        />
      )}

      <div className="flex flex-col gap-2">
        <span id={zoneId} className="text-sm font-medium text-foreground">
          {t("zone")}
        </span>
        <div
          aria-labelledby={zoneId}
          className="rounded-xl border border-border-strong bg-background px-3 py-1.5 transition-colors focus-within:border-foreground"
        >
          <LocationCombobox locations={locations} value={search} onChange={setSearch} />
        </div>
      </div>

      <ChoiceGroup label={t("bedrooms")} options={bedroomOptions} value={bedrooms} onChange={setBedrooms} layoutId="hero-bedrooms" />

      <button
        type="submit"
        className="group flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-pop text-base font-semibold text-foreground transition-[background-color,transform] hover:bg-pop-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-[0.98]"
      >
        {t("submit")}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </button>
    </form>
  );
}
