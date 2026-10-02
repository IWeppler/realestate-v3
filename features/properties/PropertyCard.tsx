import { ViewTransition } from "react";
import { useTranslations } from "next-intl";
import { Bath, BedDouble, Car, ImageOff, Maximize } from "lucide-react";
import type { PropertyCardData } from "@/app/types/entities";
import { formatPrice } from "@/lib/brand";
import { CardImage } from "@/features/properties/CardImage";
import { PropertyLink } from "@/features/properties/PropertyLink";
import { photoTransitionName } from "@/features/properties/photoTransition";

type PropertyCardProps = {
  property: PropertyCardData;
  // "feature": la foto no tiene proporción fija y ocupa todo el alto que
  // le da la grilla (la tarjeta grande de Destacadas).
  variant?: "default" | "feature";
  sizes?: string;
};

type OrderedImage = { image_url: string | null; order?: number | null };

// Fotos en el orden que definió la inmobiliaria (si viene `order`).
export function cardImages(images: OrderedImage[] | null | undefined) {
  return [...(images ?? [])]
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
    .map((img) => img.image_url)
    .filter((url): url is string => Boolean(url));
}

// Traductor de la sección "listing.card" (se pasa a los helpers de abajo,
// que también se usan desde la vista de mapa).
export type CardT = ReturnType<typeof useTranslations<"listing.card">>;

const OPERATION_KEY = {
  EN_VENTA: "forSale",
  EN_ALQUILER: "forRent",
  RESERVADO: "reserved",
  VENDIDO: "sold",
  ALQUILADO: "rented",
} as const;

const RENTAL_STATUSES = new Set(["EN_ALQUILER", "ALQUILADO"]);

// `cocheras` es texto libre en la base ("1", "2", "Sí"...).
function parkingText(cocheras: string | null, t: CardT) {
  const value = cocheras?.trim();
  if (!value || value === "0") return null;
  const n = Number(value);
  if (Number.isFinite(n)) return t("parking", { count: n });
  return t("parkingYes");
}

// Operación ("En venta") y precio ("USD 95.000", "/mes" en alquileres).
export function operationAndPrice(property: PropertyCardData, t: CardT) {
  const operationKey = OPERATION_KEY[property.status as keyof typeof OPERATION_KEY];
  const operation = operationKey ? t(operationKey) : t("property");
  const hasPrice = typeof property.price === "number" && property.price > 0;
  const price = hasPrice
    ? `${formatPrice(property.price, property.currency)}${RENTAL_STATUSES.has(property.status) ? t("perMonth") : ""}`
    : t("consult");
  return { operation, price };
}

type Spec = { key: string; icon: React.ElementType; text: string };

// Características principales, en el orden en que se muestran.
export function propertySpecs(property: PropertyCardData, t: CardT): Spec[] {
  const parking = parkingText(property.cocheras, t);
  return [
    property.bedrooms ? { key: "bed", icon: BedDouble, text: t("bedrooms", { count: property.bedrooms }) } : null,
    property.bathrooms ? { key: "bath", icon: Bath, text: t("bathrooms", { count: property.bathrooms }) } : null,
    property.total_area ? { key: "area", icon: Maximize, text: `${Number(property.total_area).toLocaleString("es-AR")} m²` } : null,
    parking ? { key: "parking", icon: Car, text: parking } : null,
  ].filter(Boolean) as Spec[];
}

// Características como badges sobre el borde inferior de la foto. Fondo
// casi opaco con blur: legibles sobre cualquier foto (clara u oscura).
export function SpecBadges({ property }: { property: PropertyCardData }) {
  const t = useTranslations("listing.card");
  const specs = propertySpecs(property, t);
  if (specs.length === 0) return null;
  return (
    <ul className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-wrap gap-1.5">
      {specs.map(({ key, icon: Icon, text }) => (
        <li
          key={key}
          className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm"
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
          {text}
        </li>
      ))}
    </ul>
  );
}

// Pie compartido de las tarjetas: una fila con el nombre (protagonista)
// y operación + precio (chico, a la derecha), y opcionalmente otra con las
// características con íconos (donde no van como badges sobre la foto).
// El link al título se estira sobre todo el contenedor `relative` más
// cercano (la tarjeta entera). `hidden`: copia decorativa, fuera del Tab
// y de lectores.
export function PropertyMeta({
  property,
  compact = false,
  hidden = false,
  specs: showSpecs = true,
}: {
  property: PropertyCardData;
  compact?: boolean;
  hidden?: boolean;
  specs?: boolean;
}) {
  const t = useTranslations("listing.card");
  const { operation, price } = operationAndPrice(property, t);
  const specs = showSpecs ? propertySpecs(property, t) : [];
  const Title = compact ? "p" : "h3";

  return (
    <>
      <div className="mt-3 flex items-center justify-between gap-4">
        <Title
          className={`min-w-0 truncate leading-snug font-semibold text-foreground ${compact ? "text-[15px]" : "text-[17px]"}`}
          title={property.title ?? undefined}
        >
          <PropertyLink
            id={property.id}
            tabIndex={hidden ? -1 : undefined}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {property.title}
          </PropertyLink>
        </Title>
        <p className={`shrink-0 font-medium whitespace-nowrap text-fg-secondary ${showSpecs ? "text-[11px]" : "text-[13px]"}`}>
          {operation} <span className="px-0.5 text-fg-disabled" aria-hidden="true">|</span> {price}
        </p>
      </div>

      {specs.length > 0 && (
        <ul className={`flex items-center gap-x-4 overflow-hidden text-[11px] text-fg-secondary ${compact ? "mt-2" : "mt-2.5"}`}>
          {specs.map(({ key, icon: Icon, text }) => (
            <li key={key} className="inline-flex shrink-0 items-center gap-1">
              <Icon className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// Tarjeta del listado público: la foto manda, con las características
// como badges en su borde inferior; abajo, nombre, operación y precio.
// Toda la tarjeta lleva a la ficha (link estirado sobre el título). La
// foto lleva nombre de transición: al abrir la ficha se transforma en su
// foto principal (ver photoTransition.ts).
export default function PropertyCard({
  property,
  variant = "default",
  sizes = "(min-width: 1280px) 30vw, (min-width: 640px) 50vw, 100vw",
}: PropertyCardProps) {
  const t = useTranslations("listing.card");
  const cover = cardImages(property.property_images as OrderedImage[] | null)[0];
  const feature = variant === "feature";

  return (
    <article className={`group relative flex flex-col ${feature ? "h-full" : ""}`}>
      <div
        className={`relative w-full overflow-hidden rounded-[8px] bg-sunken ring-ring ring-offset-2 ring-offset-background group-has-[a:focus-visible]:ring-2 ${
          feature ? "aspect-4/3 lg:aspect-auto lg:min-h-0 lg:flex-1" : "aspect-4/3"
        }`}
      >
        {/* Solo la foto viaja a la ficha: sin badges ni anillo de foco. */}
        <ViewTransition name={photoTransitionName(property.id)} share="morph" default="none">
          <div className="absolute inset-0 overflow-hidden rounded-[8px]">
            {cover ? (
              <CardImage src={cover} alt={property.title || t("altFallback")} sizes={sizes} />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-fg-disabled">
                <ImageOff className="h-6 w-6" aria-hidden="true" />
              </div>
            )}
          </div>
        </ViewTransition>
        <SpecBadges property={property} />
      </div>

      <PropertyMeta property={property} specs={false} />
    </article>
  );
}
