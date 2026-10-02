"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
  LocationCombobox,
  type LocationSuggestion,
  type SearchValue,
} from "@/features/properties/LocationCombobox";
import { ChoiceGroup, SegmentedControl } from "@/features/public/v2/ChoiceGroup";

export type PropertyTypeOption = { id: number; name: string };

const OPERATIONS = [
  { label: "Comprar", value: "venta" },
  { label: "Alquilar", value: "alquiler" },
];

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
  const router = useRouter();
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
      aria-label="Buscar propiedades"
      onSubmit={handleSearch}
      className="flex w-full flex-col gap-6 rounded-3xl bg-card p-5 shadow-[0_30px_60px_-30px_rgb(21_21_21/0.55)] md:p-7"
    >
      <SegmentedControl label="Operación" options={OPERATIONS} value={operation} onChange={setOperation} />

      {types.length > 0 && (
        <ChoiceGroup
          label="Tipo de propiedad"
          options={[{ label: "Todos", value: "" }, ...types.map((t) => ({ label: t.name, value: String(t.id) }))]}
          value={typeId}
          onChange={setTypeId}
          layoutId="hero-type"
        />
      )}

      <div className="flex flex-col gap-2">
        <span id={zoneId} className="text-sm font-medium text-foreground">
          Zona
        </span>
        <div
          aria-labelledby={zoneId}
          className="rounded-xl border border-border-strong bg-background px-3 py-1.5 transition-colors focus-within:border-foreground"
        >
          <LocationCombobox locations={locations} value={search} onChange={setSearch} />
        </div>
      </div>

      <ChoiceGroup label="Dormitorios" options={BEDROOM_OPTIONS} value={bedrooms} onChange={setBedrooms} layoutId="hero-bedrooms" />

      <button
        type="submit"
        className="group flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-pop text-base font-semibold text-foreground transition-[background-color,transform] hover:bg-pop-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-[0.98]"
      >
        Buscar propiedades
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </button>
    </form>
  );
}
