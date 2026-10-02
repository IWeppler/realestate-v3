import { createClientServer } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Metadata } from "next";
import { BRAND, formatLocation, formatPrice } from "@/lib/brand";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Car,
  Check,
  DoorOpen,
  MapPin,
  Maximize2,
  Navigation,
  Ruler,
} from "lucide-react";

import { ClientPropertyMap } from "@/features/properties/ClientPropertyMap";
import { DescriptionWithReadMore } from "@/features/properties/DescriptionReadMore";
import { PropertyJsonLd } from "@/features/public/seo/PropertyJsonLd";
import { PropertyFullDetails } from "@/features/properties/types/index";
import { ShareButton } from "@/features/properties/ShareButton";
import type { Fact } from "@/features/properties/KeyFacts";
import styles from "@/features/public/v2/property-detail.module.css";
import PropertyCard from "@/features/properties/PropertyCard";
import type { PropertyCardData } from "@/app/types/entities";
import { NearbyPlaces } from "@/features/properties/NearbyPlaces";
import { isNearbyCategory, type NearbyPlace } from "@/features/properties/nearby-categories";
import { ViewCounter } from "@/features/public/v2/ViewCounter";
import { PropertyMedia } from "@/features/public/v2/PropertyMedia";
import {
  MobileContactBar,
  PropertyContactCard,
  PropertyInquiryForm,
} from "@/features/public/v2/PropertyContact";
import { SplitHeading, StaggerItem } from "@/features/public/v2/motion";
import { zoneSlug } from "@/features/public/zones";
import { getTranslations } from "next-intl/server";
import { asLocale, initLocale } from "@/i18n/server";
import { localizedAlternates, localizedPath, ogLocale } from "@/i18n/seo";

// --- Carga de Datos Principal ---
async function getPropertyDetails(
  slug: string,
): Promise<PropertyFullDetails | null> {
  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from("properties")
    .select(
      `
      id, title, street_address, neighborhood, city, province, status, operation_type,
      price, currency, bedrooms, bathrooms, total_area, covered_area, rooms,
      description, latitude, longitude, expensas, antiguedad, cocheras,
      property_types ( name ),
      property_images ( image_url, order ),
      property_amenities ( amenities ( name ) ),
      agents!properties_agent_id_fkey ( id, full_name, avatar_url, phone, email )
    `,
    )
    .eq("id", slug)
    .single();

  if (error) {
    console.error("Error fetching property details:", error);
    if (error.code === "PGRST116") return null;
    throw new Error("No se pudieron cargar los datos de la propiedad.");
  }
  return data as unknown as PropertyFullDetails;
}

// --- Lugares cercanos ---
async function getNearbyPlaces(propertyId: string): Promise<NearbyPlace[]> {
  const supabase = await createClientServer();
  const { data } = await supabase
    .from("property_nearby_places")
    .select("id, category, name, distance_m")
    .eq("property_id", propertyId);
  return (data ?? []).filter((p): p is NearbyPlace => isNearbyCategory(p.category));
}

// --- Cargar Recomendados ---
// Mismas tarjetas que el listado. Primero misma ciudad y operación; si no
// hay, misma operación en cualquier ciudad.
const RECO_FIELDS =
  "id, title, price, currency, bedrooms, bathrooms, total_area, cocheras, city, street_address, status, property_images ( image_url, order )";

async function getRecommendedProperties(
  currentId: string,
  city: string | null,
  operationType: string,
): Promise<PropertyCardData[]> {
  const supabase = await createClientServer();

  let { data } = await supabase
    .from("properties")
    .select(RECO_FIELDS)
    .eq("operation_type", operationType)
    .in("status", ["EN_VENTA", "EN_ALQUILER"])
    .eq("city", city || "")
    .neq("id", currentId)
    .limit(3);

  if (!data || data.length === 0) {
    const fallback = await supabase
      .from("properties")
      .select(RECO_FIELDS)
      .eq("operation_type", operationType)
      .in("status", ["EN_VENTA", "EN_ALQUILER"])
      .neq("id", currentId)
      .limit(3);

    data = fallback.data;
  }

  return (data ?? []) as PropertyCardData[];
}

// --- Metadata (SEO / OG) ---
// E2.1: la imagen de previsualización la genera opengraph-image/route.tsx.
// Se declara la URL pública de cada idioma en og:image y twitter:image.
// Título y descripción con precio + ubicación para que la tarjeta de
// WhatsApp/redes sea informativa sin abrir el link.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale: asLocale(locale), namespace: "property.page" });
  const supabase = await createClientServer();

  const { data: property } = await supabase
    .from("properties")
    .select(
      "title, description, price, currency, city, province, neighborhood, bedrooms, total_area, operation_type",
    )
    .eq("id", slug)
    .single();

  if (!property) return { title: t("notFound") };

  const price = property.price ? formatPrice(property.price, property.currency) : t("priceOnRequest");
  const location = formatLocation(property);
  const specs = [
    property.bedrooms ? t("metaBedrooms", { count: property.bedrooms }) : null,
    property.total_area ? `${property.total_area} m²` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const operation =
    property.operation_type?.toUpperCase() === "ALQUILER"
      ? t("metaForRent")
      : t("metaForSale");

  const shortDescription = [
    [operation, price, specs].filter(Boolean).join(" · "),
    location,
    property.description?.replace(/\s+/g, " ").substring(0, 120),
  ]
    .filter(Boolean)
    .join(". ");

  const socialImage = {
    url: localizedPath(`/propiedades/${slug}/opengraph-image`, asLocale(locale)),
    width: 1200,
    height: 630,
    alt: property.title,
  };

  return {
    title: `${property.title} | ${price}`,
    description: shortDescription,
    alternates: localizedAlternates(`/propiedades/${slug}`, asLocale(locale)),
    openGraph: {
      title: `${property.title} · ${price}`,
      description: shortDescription,
      url: localizedAlternates(`/propiedades/${slug}`, asLocale(locale)).canonical,
      siteName: BRAND.name,
      locale: ogLocale(asLocale(locale)),
      type: "website",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      images: [socialImage],
      title: `${property.title} · ${price}`,
      description: shortDescription,
    },
  };
}

const STATUS_KEYS = {
  EN_VENTA: "forSale",
  EN_ALQUILER: "forRent",
  RESERVADO: "reserved",
  VENDIDO: "sold",
  ALQUILADO: "rented",
} as const;

function SectionTitle({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className={styles.sectionTitle}>
      {children}
    </h2>
  );
}

// --- Página Principal ---
// Ficha de propiedad: galería sticky a la izquierda y contenido a la
// derecha. En móvil se apilan y se conserva la barra de contacto.
export default async function PropertyPage({
  params: paramsPromise,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await paramsPromise;
  initLocale(locale);
  const t = await getTranslations("property");
  const property = await getPropertyDetails(slug);

  if (!property) notFound();

  const [recommendedProperties, nearbyPlaces] = await Promise.all([
    getRecommendedProperties(property.id, property.city, property.operation_type ?? ""),
    getNearbyPlaces(property.id),
  ]);

  const {
    title,
    street_address,
    neighborhood,
    city,
    province,
    status,
    price,
    currency,
    property_images,
    property_amenities,
  } = property;

  const locationString = [street_address, neighborhood, city, province].filter(Boolean).join(", ");
  const statusKey = STATUS_KEYS[status as keyof typeof STATUS_KEYS];
  const statusDisplay = statusKey ? t(`status.${statusKey}`) : status;
  const typeName = property.property_types?.name ?? null;

  const priceDisplay =
    typeof price === "number" && price > 0
      ? `${currency || "USD"} ${price.toLocaleString("es-AR")}`
      : t("page.priceOnRequest");

  const amenities = property_amenities?.map((a) => a.amenities?.name).filter((n): n is string => Boolean(n)) || [];
  const images = [...(property_images || [])]
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
    .map((img) => img.image_url)
    .filter((url): url is string => Boolean(url));
  const available = status === "EN_VENTA" || status === "EN_ALQUILER";
  const isRent =
    property.operation_type?.toUpperCase() === "ALQUILER" || status === "EN_ALQUILER" || status === "ALQUILADO";
  const priceLabel = isRent ? t("page.priceRent") : t("page.priceSale");
  const expensasDisplay =
    property.expensas && property.expensas > 0 ? `ARS ${property.expensas.toLocaleString("es-AR")}` : null;
  const pricePerM2 =
    !isRent && typeof price === "number" && price > 0 && property.total_area && property.total_area > 0
      ? `${currency || "USD"} ${Math.round(price / property.total_area).toLocaleString("es-AR")}`
      : null;
  const keyFacts = (
    [
      { icon: DoorOpen, label: t("facts.rooms"), value: property.rooms },
      { icon: BedDouble, label: t("facts.bedrooms"), value: property.bedrooms },
      { icon: Bath, label: t("facts.bathrooms"), value: property.bathrooms },
      { icon: Maximize2, label: t("facts.totalArea"), value: property.total_area, unit: "m²" },
      { icon: Ruler, label: t("facts.coveredArea"), value: property.covered_area, unit: "m²" },
      { icon: Car, label: t("facts.parking"), value: property.cocheras },
    ] as { icon: React.ElementType; label: string; value: number | string | null | undefined; unit?: string }[]
  ).filter((f): f is Fact => f.value !== null && f.value !== undefined && f.value !== "" && f.value !== 0);
  const hasCoords = typeof property.latitude === "number" && typeof property.longitude === "number";
  const refCode = property.id.slice(0, 8).toUpperCase();
  // Resumen junto al precio: lo primero que se compara entre propiedades.
  const headlineSpecs = [
    property.bedrooms ? { key: "bed", icon: BedDouble, text: t("page.bedrooms", { count: property.bedrooms }) } : null,
    property.bathrooms ? { key: "bath", icon: Bath, text: t("page.bathrooms", { count: property.bathrooms }) } : null,
    property.total_area ? { key: "area", icon: Maximize2, text: `${Number(property.total_area).toLocaleString("es-AR")} m²` } : null,
  ].filter(Boolean) as { key: string; icon: React.ElementType; text: string }[];

  const detailFacts = [
    { label: t("page.ref", { code: "" }).trim(), value: refCode },
    ...(typeName ? [{ label: t("facts.type"), value: typeName }] : []),
    ...keyFacts.map(f => ({ label: f.label, value: [typeof f.value === "number" ? f.value.toLocaleString("es-AR") : f.value, f.unit].filter(Boolean).join(" ") })),
    ...(pricePerM2 ? [{ label: t("facts.pricePerM2"), value: pricePerM2 }] : []),
    ...(expensasDisplay ? [{ label: t("facts.expensas"), value: expensasDisplay }] : []),
    ...(property.antiguedad ? [{ label: t("facts.age"), value: String(property.antiguedad) }] : []),
  ];

  return (
    <div className="w-full bg-background pb-28 lg:pb-0">
      <ViewCounter propertyId={property.id} />
      <PropertyJsonLd property={property} />

      <div className={styles.container}>
        <div className={styles.topBar}>
          <Link href="/propiedades" className={styles.backLink}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("page.backToAll")}
          </Link>
          <div className={styles.shareMobile}>
            <ShareButton title={title} price={priceDisplay} location={locationString} />
          </div>
        </div>

        <div className={styles.layout}>
          <div className={styles.gallery}>
            <PropertyMedia id={property.id} images={images} title={title} />
          </div>

          <div className={styles.information}>
            <header className={styles.heading}>
              <div className={styles.priceRow}>
                <div>
                  <p className={styles.priceLabel}>{priceLabel}</p>
                  <p className={styles.price}>{priceDisplay}</p>
                  {expensasDisplay && <p className={styles.extra}>{t("page.expensasExtra", { amount: expensasDisplay })}</p>}
                </div>
                <div className={styles.shareDesktop}>
                  <ShareButton title={title} price={priceDisplay} location={locationString} />
                </div>
              </div>

              <div className={styles.statusRow}>
                <span className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold ${available ? "bg-pop text-foreground" : "bg-main text-primary-foreground"}`}>
                  {statusDisplay}
                </span>
                {typeName && <span className={styles.type}>{typeName}</span>}
              </div>

              <SplitHeading as="h1" trigger="mount" delay={0.1} text={title} className={styles.title} />

              {headlineSpecs.length > 0 && (
                <ul className={styles.headlineSpecs}>
                  {headlineSpecs.map(({ key, icon: Icon, text }) => (
                    <li key={key}><Icon size={16} strokeWidth={1.5} aria-hidden="true" />{text}</li>
                  ))}
                </ul>
              )}

              {locationString && <p className={styles.address}><MapPin size={16} strokeWidth={1.5} aria-hidden="true" />{locationString}</p>}
            </header>

            <PropertyContactCard propertyId={property.id} title={title} available={available} priceDisplay={priceDisplay} priceLabel={priceLabel} expensasDisplay={expensasDisplay} agent={property.agents} showPrice={false} />

            <section aria-labelledby="facts-title" className={styles.section}>
              <SectionTitle id="facts-title">{t("facts.title")}</SectionTitle>
              <dl className={styles.facts}>
                {detailFacts.map(({ label, value }) => (
                  <div key={label} className={styles.factRow}><dt>{label}</dt><dd>{value}</dd></div>
                ))}
              </dl>
            </section>

            <section aria-labelledby="desc-title" className={styles.section}>
              <SectionTitle id="desc-title">{t("description.title")}</SectionTitle>
              <div className={styles.sectionBody}><DescriptionWithReadMore text={property.description || ""} /></div>
            </section>

            {amenities.length > 0 && (
              <section aria-labelledby="amenities-title" className={styles.section}>
                <SectionTitle id="amenities-title">{t("amenities.title")}</SectionTitle>
                <ul className={styles.amenities}>
                  {amenities.map(name => <li key={name}><Check size={16} strokeWidth={1.5} aria-hidden="true" />{name}</li>)}
                </ul>
              </section>
            )}

            <section aria-labelledby="map-title" className={styles.section}>
              <SectionTitle id="map-title">{t("location.title")}</SectionTitle>
              {locationString && <p className={styles.location}>{locationString}</p>}
              <div className={styles.locationLinks}>
                {city && <Link href={`/zonas/${zoneSlug(city)}`} className={styles.textLink}>{t("location.moreIn", { city })}<ArrowRight size={16} aria-hidden="true" /></Link>}
                {hasCoords && <a href={`https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`} target="_blank" rel="noopener noreferrer" className={styles.textLink}><Navigation size={16} aria-hidden="true" />{t("location.directions")}</a>}
              </div>
              <div className={styles.map}><ClientPropertyMap lat={property.latitude} lng={property.longitude} title={property.title} /></div>
            </section>

            {nearbyPlaces.length > 0 && (
              <section aria-labelledby="nearby-title" className={styles.section}>
                <SectionTitle id="nearby-title">{t("nearby.title")}</SectionTitle>
                <NearbyPlaces places={nearbyPlaces} />
              </section>
            )}

            <section aria-labelledby="inquiry-title" className={`${styles.section} ${styles.inquiry}`}>
              <SectionTitle id="inquiry-title">{t("inquiry.title")}</SectionTitle>
              <p className={styles.inquiryIntro}>{t("inquiry.intro")}</p>
              <PropertyInquiryForm propertyId={property.id} title={title} />
            </section>
          </div>
        </div>
      </div>


      {/* --- Parecidas --- */}
      {recommendedProperties.length > 0 && (
        <section aria-labelledby="reco-title" className="mt-24 w-full bg-surface-alt lg:mt-32">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 lg:py-28">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SplitHeading
                id="reco-title"
                text={t("related.title")}
                className="max-w-[16ch] font-display text-4xl leading-[0.95] font-medium tracking-[-0.035em] text-foreground md:text-5xl"
              />
              <Link
                href={isRent ? "/propiedades?tipo=alquiler" : "/propiedades?tipo=venta"}
                className="group inline-flex h-11 items-center gap-2 rounded-full border border-border-strong px-5 text-sm font-semibold text-foreground transition-colors hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {t("related.seeAll")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
            <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedProperties.map((p, i) => (
                <StaggerItem as="li" key={p.id} index={i}>
                  <PropertyCard property={p} />
                </StaggerItem>
              ))}
            </ul>
          </div>
        </section>
      )}

      <MobileContactBar
        propertyId={property.id}
        title={title}
        available={available}
        priceDisplay={priceDisplay}
        priceLabel={priceLabel}
      />
    </div>
  );
}
