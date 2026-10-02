import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { createClientServer } from "@/lib/supabase";
import { Hero } from "@/features/public/v2/Hero";
import { FeaturedListings } from "@/features/public/v2/FeaturedListings";
import { TypeShowcase } from "@/features/public/v2/TypeShowcase";
import { AppraisalBand } from "@/features/public/v2/AppraisalBand";
import { TrustSection } from "@/features/public/v2/TrustSection";
import { ContactClose } from "@/features/public/v2/ContactClose";
import { getTypeTiles } from "@/features/public/v2/propertyTypes";
import type { PropertyCardData } from "@/app/types/entities";
import { getTranslations } from "next-intl/server";
import { initLocale, asLocale } from "@/i18n/server";
import { localizedAlternates } from "@/i18n/seo";

// Landing v3. noindex hasta aprobar el rediseño, para no competir con la
// home en buscadores.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = asLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    title: { absolute: t("metaTitle", { brand: BRAND.name }) },
    alternates: localizedAlternates("/", locale),
    robots: { index: false, follow: false },
  };
}

const CARD_FIELDS = `
  id,
  title,
  price,
  currency,
  bedrooms,
  bathrooms,
  total_area,
  cocheras,
  city,
  street_address,
  status,
  property_images ( image_url, order )
`;

// Destacadas: las disponibles más vistas que tienen foto (no hay una
// marca de "destacada" en la base; las visitas son la señal real de
// interés).
async function featuredProperties() {
  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from("properties")
    .select(CARD_FIELDS)
    .in("status", ["EN_VENTA", "EN_ALQUILER"])
    .order("views_count", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    console.error("Error al cargar destacadas:", error.message);
  }
  return ((data ?? []) as PropertyCardData[])
    .filter((p) => p.property_images?.some((img) => img.image_url))
    .slice(0, 6);
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  initLocale((await params).locale);
  const [featured, types] = await Promise.all([featuredProperties(), getTypeTiles()]);

  return (
    <div className="flex w-full flex-col">
      <Hero types={types.map(({ id, name }) => ({ id, name }))} />
      <FeaturedListings properties={featured} />
      <TypeShowcase tiles={types} />
      <AppraisalBand />
      <TrustSection />
      <ContactClose />
    </div>
  );
}
