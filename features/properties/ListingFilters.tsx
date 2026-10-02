"use client";

import { useId, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Loader2, SlidersHorizontal } from "lucide-react";
import { useFilterParams } from "@/features/properties/useFilterParams";
import { PropertySearchCombobox } from "@/features/properties/PropertySearchCombobox";
import type { LocationSuggestion } from "@/features/properties/LocationCombobox";
import { ChoiceGroup, SegmentedControl } from "@/features/public/v2/ChoiceGroup";
import { BEDROOM_OPTIONS } from "@/features/public/v2/HeroSearch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";

export type FilterOptions = {
  types: { id: number; name: string }[];
  amenities: { id: number; name: string }[];
  locations: LocationSuggestion[];
};

const AMENITIES_PREVIEW = 8;

// Filtros del listado apilados en vertical, con el mismo lenguaje que el
// buscador del hero. Cada cambio va directo a la URL (sin botón de
// aplicar): la URL es la fuente de verdad y el listado se re-renderiza en
// el servidor. Se muestran dentro del panel lateral (FiltersSheet).
export function ListingFilters({ types, amenities, locations }: FilterOptions) {
  const t = useTranslations("listing.filters");
  const router = useRouter();
  const pathname = usePathname();
  const { searchParams, activeCount } = useFilterParams();
  const [pending, startTransition] = useTransition();
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  // Prefijo propio para los layoutId: no chocan con otros buscadores.
  const uid = useId();
  const amenitiesLabelId = useId();

  const navigate = (mutate: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  const setParam = (name: string, value: string) => navigate((p) => (value ? p.set(name, value) : p.delete(name)));

  const selectedAmenities = searchParams.get("amenities")?.split(",").filter(Boolean) ?? [];
  const toggleAmenity = (id: string) =>
    navigate((p) => {
      const next = selectedAmenities.includes(id)
        ? selectedAmenities.filter((a) => a !== id)
        : [...selectedAmenities, id];
      if (next.length) p.set("amenities", next.join(","));
      else p.delete("amenities");
    });

  const hasAny = activeCount > 0 || Boolean(searchParams.get("tipo")) || Boolean(searchParams.get("q"));
  const clearAll = () =>
    navigate((p) => {
      for (const key of ["tipo", "typeId", "loc", "q", "bedrooms", "bathrooms", "amenities"]) p.delete(key);
    });

  const operations = [
    { value: "", label: t("operationAll") },
    { value: "venta", label: t("operationSale") },
    { value: "alquiler", label: t("operationRent") },
  ];
  const bathrooms = [
    { label: t("all"), value: "" },
    { label: "1+", value: "1" },
    { label: "2+", value: "2" },
    { label: "3+", value: "3" },
  ];

  const visibleAmenities = showAllAmenities ? amenities : amenities.slice(0, AMENITIES_PREVIEW);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center justify-between gap-4">
        <p className="flex items-center gap-2 font-display text-xl font-semibold tracking-[-0.01em] text-foreground">
          {t("title")}
          {pending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label={t("updating")} />}
        </p>
        {hasAny && (
          <button
            type="button"
            onClick={clearAll}
            className="cursor-pointer rounded-sm text-sm font-medium text-fg-secondary underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {t("clear")}
          </button>
        )}
      </div>

      <SegmentedControl
        label={t("operation")}
        options={operations}
        value={searchParams.get("tipo") ?? ""}
        onChange={(v) => setParam("tipo", v)}
      />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">{t("locationLabel")}</span>
        <PropertySearchCombobox locations={locations} />
      </div>

      {types.length > 0 && (
        <ChoiceGroup
          label={t("propertyType")}
          options={[{ label: t("all"), value: "" }, ...types.map((t) => ({ label: t.name, value: String(t.id) }))]}
          value={searchParams.get("typeId") ?? ""}
          onChange={(v) => setParam("typeId", v)}
          layoutId={`${uid}-type`}
        />
      )}

      <ChoiceGroup
        label={t("bedrooms")}
        options={BEDROOM_OPTIONS.map((o) => (o.value === "" ? { ...o, label: t("all") } : o))}
        value={searchParams.get("bedrooms") ?? ""}
        onChange={(v) => setParam("bedrooms", v)}
        layoutId={`${uid}-bedrooms`}
      />

      <ChoiceGroup
        label={t("bathrooms")}
        options={bathrooms}
        value={searchParams.get("bathrooms") ?? ""}
        onChange={(v) => setParam("bathrooms", v)}
        layoutId={`${uid}-bathrooms`}
      />

      {amenities.length > 0 && (
        <div className="flex flex-col gap-2">
          <span id={amenitiesLabelId} className="text-sm font-medium text-foreground">
            {t("amenities")}
          </span>
          <div role="group" aria-labelledby={amenitiesLabelId} className="flex flex-wrap gap-1.5">
            {visibleAmenities.map((a) => {
              const on = selectedAmenities.includes(String(a.id));
              return (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleAmenity(String(a.id))}
                  className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                    on
                      ? "border-main bg-main text-primary-foreground"
                      : "border-border-strong text-fg-secondary hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {a.name}
                </button>
              );
            })}
          </div>
          {amenities.length > AMENITIES_PREVIEW && (
            <button
              type="button"
              onClick={() => setShowAllAmenities((v) => !v)}
              aria-expanded={showAllAmenities}
              className="w-fit cursor-pointer rounded-sm text-sm font-medium text-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {showAllAmenities ? t("seeLess") : t("seeAllAmenities", { count: amenities.length })}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Filtros en un panel lateral que se abre desde la barra de resultados
// (lista y mapa, todas las pantallas). Los cambios se ven al instante; el
// botón de abajo solo cierra el panel.
export function FiltersSheet({
  count,
  ...options
}: FilterOptions & { count: number }) {
  const t = useTranslations("listing.filters");
  const [open, setOpen] = useState(false);
  const { activeCount, searchParams } = useFilterParams();
  const total = activeCount + (searchParams.get("tipo") ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-border-strong bg-card px-4 text-sm font-medium text-foreground transition-colors hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          {t("title")}
          {total > 0 && <span className="rounded-full bg-pop px-2 py-0.5 text-xs text-foreground tabular-nums">{total}</span>}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col gap-0 bg-background p-0 sm:max-w-md">
        <SheetTitle className="sr-only">{t("title")}</SheetTitle>
        <SheetDescription className="sr-only">{t("panelDescription")}</SheetDescription>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-14 pb-8">
          <ListingFilters {...options} />
        </div>
        <div className="border-t border-border p-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-[52px] w-full cursor-pointer items-center justify-center rounded-full bg-pop text-base font-semibold text-foreground transition-[background-color,transform] hover:bg-pop-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            {count === 0 ? t("noResults") : t("viewResults", { count })}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
