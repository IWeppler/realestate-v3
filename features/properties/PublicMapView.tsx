"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ImageOff, MapPin, MapPinOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardImage } from "@/features/properties/CardImage";
import { cardImages, operationAndPrice, propertySpecs } from "@/features/properties/PropertyCard";
import type { PropertyCardData } from "@/app/types/entities";
import {
  isLocated,
  type LocatedProperty,
  type MapProperty,
} from "@/features/properties/PublicPropertiesMap";

function MapLoading() {
  const t = useTranslations("listing.map");
  return <div className="h-full w-full animate-pulse bg-muted" aria-label={t("loading")} />;
}

// MapLibre solo en cliente. El placeholder ocupa el mismo lugar que el
// mapa para no mover el layout al cargar.
const PublicPropertiesMap = dynamic(() => import("@/features/properties/PublicPropertiesMap"), {
  ssr: false,
  loading: () => <MapLoading />,
});

// Vista mapa del listado público: panel de resultados + mapa con pines de
// precio, sincronizados. Hover en una tarjeta resalta su pin y viceversa;
// click en "Ver en mapa" vuela al pin y abre la vista previa; click en la
// vista previa lleva a la ficha. Ocupa el alto que le da el contenedor.
export function PublicMapView({ properties }: { properties: MapProperty[] }) {
  const t = useTranslations("listing.map");
  const tCard = useTranslations("listing.card");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focus, setFocus] = useState<LocatedProperty | null>(null);
  const rowRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  const located = useMemo(() => properties.filter(isLocated), [properties]);
  const unlocated = useMemo(() => properties.filter((p) => !isLocated(p)), [properties]);

  const highlightedId = activeId ?? selectedId;

  // Hover o click en un pin: traer la tarjeta a la vista del panel. Solo
  // desde el mapa; el hover en la propia lista no la desplaza.
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);
  useEffect(() => {
    if (!scrollTarget) return;
    rowRefs.current.get(scrollTarget)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [scrollTarget]);

  const onMapActive = (id: string | null) => {
    setActiveId(id);
    if (id) setScrollTarget(id);
  };
  const onMapSelect = (id: string | null) => {
    setSelectedId(id);
    if (id) setScrollTarget(id);
  };

  const selectFromList = (p: LocatedProperty) => {
    setSelectedId(p.id);
    setFocus({ ...p });
  };

  return (
    <div className="absolute inset-0 grid grid-rows-[minmax(0,1fr)_minmax(0,1.1fr)] gap-4 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:grid-rows-1 lg:gap-6 xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
      <aside className="order-2 flex min-h-0 flex-col lg:order-1">
        {unlocated.length > 0 && (
          <p className="pb-3 text-xs text-muted-foreground">
            {t("unlocated", { count: unlocated.length })}
          </p>
        )}

        {/* Tarjetas horizontales: foto chica a la izquierda y datos al
            costado, en una sola columna, así el mapa tiene más ancho. El
            resaltado (hover o pin) es un anillo en la foto, sincronizado con
            el pin del mapa. */}
        <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain pr-1 pb-4">
          {[...located, ...unlocated].map((p) => {
            const onMap = isLocated(p);
            const highlighted = highlightedId === p.id;
            const cover = cardImages(p.property_images)[0];
            const property = p as unknown as PropertyCardData;
            const { operation, price } = operationAndPrice(property, tCard);
            const specs = propertySpecs(property, tCard);
            return (
              <li
                key={p.id}
                ref={(el) => {
                  if (el) rowRefs.current.set(p.id, el);
                  else rowRefs.current.delete(p.id);
                }}
                onMouseEnter={() => onMap && setActiveId(p.id)}
                onMouseLeave={() => setActiveId(null)}
                className={cn(
                  "group relative flex gap-4 rounded-2xl p-2 transition-colors duration-200 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring",
                  highlighted ? "bg-card" : "hover:bg-card",
                )}
              >
                <div
                  className={cn(
                    "relative aspect-4/3 w-36 shrink-0 self-start overflow-hidden rounded-[8px] bg-sunken ring-offset-2 ring-offset-card transition-shadow duration-200 sm:w-44",
                    highlighted && "ring-2 ring-pop",
                  )}
                >
                  {cover ? (
                    <CardImage src={cover} alt={p.title} sizes="176px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-fg-disabled">
                      <ImageOff className="h-5 w-5" aria-hidden="true" />
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col py-1 pr-1">
                  <p className="text-xs font-medium text-fg-secondary">{operation}</p>
                  <h3 className="mt-0.5 line-clamp-2 text-[15px] leading-snug font-semibold text-foreground" title={p.title}>
                    <Link href={`/propiedades/${p.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                      {p.title}
                    </Link>
                  </h3>
                  <p className="mt-1 font-display text-lg leading-tight font-semibold tracking-[-0.01em] text-foreground tabular-nums">
                    {price}
                  </p>

                  {specs.length > 0 && (
                    <ul className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-secondary">
                      {specs.map(({ key, icon: Icon, text }) => (
                        <li key={key} className="inline-flex items-center gap-1">
                          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                          {text}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Por encima del link estirado de la tarjeta. */}
                  <div className="relative z-10 mt-auto pt-2">
                    {onMap ? (
                      <button
                        type="button"
                        onClick={() => selectFromList(p)}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-full text-xs font-medium text-fg-secondary underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        {t("viewOnMap")}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-fg-secondary">
                        <MapPinOff className="h-3.5 w-3.5" aria-hidden="true" />
                        {t("noLocation")}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="relative order-1 min-h-0 overflow-hidden rounded-3xl bg-sunken lg:order-2">
        {located.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted p-6 text-center text-muted-foreground">
            <MapPinOff className="h-8 w-8 opacity-60" aria-hidden="true" />
            <p>{t("noneLocated")}</p>
          </div>
        ) : (
          <PublicPropertiesMap
            properties={located}
            activeId={activeId}
            selectedId={selectedId}
            onActiveChange={onMapActive}
            onSelect={onMapSelect}
            focus={focus}
          />
        )}
      </div>
    </div>
  );
}
