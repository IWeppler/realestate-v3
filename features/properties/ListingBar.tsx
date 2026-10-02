"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, LayoutGrid, Map as MapIcon, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { cn } from "@/lib/utils";
import { useFilterParams } from "@/features/properties/useFilterParams";
import { FiltersSheet, type FilterOptions } from "@/features/properties/ListingFilters";

const SORTS = [
  { value: "", label: "Más recientes" },
  { value: "price_asc", label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
];

const VIEWS = [
  { value: "", label: "Lista", icon: LayoutGrid },
  { value: "mapa", label: "Mapa", icon: MapIcon },
];

// Barra arriba de los resultados: cantidad y filtros activos (chips para
// quitarlos de a uno) a la izquierda; orden y Lista/Mapa a la derecha. En
// ambas vistas, el botón de Filtros abre el panel con todos los filtros.
export function ListingBar({
  count,
  query,
  view,
  ...options
}: FilterOptions & { count: number; query?: string; view: "lista" | "mapa" }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { toggle, searchParams } = useFilterParams();

  const setParam = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const sort = searchParams.get("sortBy") ?? "";
  const sortLabel = SORTS.find((s) => s.value === sort)?.label ?? SORTS[0].label;
  const viewValue = view === "mapa" ? "mapa" : "";

  const single = (name: string) => {
    const v = searchParams.get(name);
    return v ? [v] : [];
  };
  const multi = (name: string) => searchParams.get(name)?.split(",").filter(Boolean) ?? [];

  // Filtros activos como chips (la operación ya se lee en el título).
  const chips = [
    ...single("typeId").map((v) => ({ name: "typeId", value: v, label: options.types.find((t) => String(t.id) === v)?.name ?? v })),
    ...multi("loc").map((v) => ({ name: "loc", value: v, label: v })),
    ...single("bedrooms").map((v) => ({ name: "bedrooms", value: v, label: `${v}+ dormitorios` })),
    ...single("bathrooms").map((v) => ({ name: "bathrooms", value: v, label: `${v}+ baños` })),
    ...multi("amenities").map((v) => ({ name: "amenities", value: v, label: options.amenities.find((a) => String(a.id) === v)?.name ?? v })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-fg-secondary tabular-nums" aria-live="polite">
          <span className="font-semibold text-foreground">{count}</span> {count === 1 ? "propiedad" : "propiedades"}
          {query ? ` para “${query}”` : ""}
        </p>

        <div className="flex items-center gap-2">
          <FiltersSheet {...options} count={count} />

          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={`Ordenar: ${sortLabel}`}
                className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border-strong bg-card px-4 text-sm font-medium whitespace-nowrap text-foreground transition-colors hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span className="hidden text-fg-secondary sm:inline">Ordenar:</span> {sortLabel}
                <ChevronDown className="h-4 w-4 opacity-60" aria-hidden="true" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-52 rounded-2xl p-2">
              <ul>
                {SORTS.map((s) => (
                  <li key={s.value || "default"}>
                    <button
                      type="button"
                      aria-pressed={sort === s.value}
                      onClick={() => setParam("sortBy", s.value)}
                      className={cn(
                        "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                        sort === s.value && "font-semibold",
                      )}
                    >
                      {s.label}
                      {sort === s.value && <Check className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>

          <div role="radiogroup" aria-label="Vista" className="inline-flex h-10 shrink-0 items-center rounded-full bg-muted p-1">
            {VIEWS.map((o) => {
              const active = viewValue === o.value;
              return (
                <button
                  key={o.value || "lista"}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={`Vista ${o.label.toLowerCase()}`}
                  title={o.label}
                  onClick={() => !active && setParam("vista", o.value)}
                  className={cn(
                    "relative flex h-full w-10 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "text-primary-foreground" : "text-fg-secondary hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="listing-view"
                      className="absolute inset-0 rounded-full bg-main"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <o.icon className="relative h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {chips.length > 0 && (
        <ul className="flex flex-wrap items-center gap-2" aria-label="Filtros activos">
          {chips.map((c) => (
            <li key={`${c.name}-${c.value}`}>
              <button
                type="button"
                onClick={() => toggle(c.name, c.value)}
                aria-label={`Quitar filtro ${c.label}`}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-main-soft pr-2 pl-3 text-[13px] font-medium text-foreground transition-colors hover:bg-main-soft/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {c.label}
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
