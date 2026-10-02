import { ImageResponse } from "next/og";
import {
  getSocialProperty,
  PropertySocialCard,
  formatArea,
} from "@/features/social/propertyCard";
import { renderableImage } from "@/features/social/renderableImage";
import { BRAND, formatPrice } from "@/lib/brand";
import { getTranslations } from "next-intl/server";
import { asLocale } from "@/i18n/server";

// E2.1: OG image dinámica por propiedad (WhatsApp, redes). La metadata
// de la ficha usa la URL pública de cada idioma, sin prefijos internos.
export const runtime = "nodejs";
const size = { width: 1200, height: 630 };

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale: asLocale(locale), namespace: "property" });
  const p = await getSocialProperty(slug);

  if (!p) {
    return new ImageResponse(
      (
        <div
          style={{
            width: size.width,
            height: size.height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: BRAND.color,
            color: "#fff",
            fontSize: 64,
            fontWeight: 800,
          }}
        >
          {BRAND.name}
        </div>
      ),
      size
    );
  }

  // La pieza usa la primera foto; va como JPEG (next/og no lee WebP).
  const image = await renderableImage(p.images[0] ?? p.image, size.width);
  const card = { ...p, image, images: image ? [image] : [] };

  const statusLabels: Record<string, string> = {
    VENDIDO: t("social.sold"),
    ALQUILADO: t("social.rented"),
    RESERVADO: t("social.reserved"),
  };
  const area = p.total_area ?? p.covered_area;
  const areaText = area ? formatArea(area) : null;
  const text = {
    badge: statusLabels[p.status] ?? (p.operation_type?.toUpperCase() === "ALQUILER" ? t("status.forRent") : t("status.forSale")),
    price: p.price ? formatPrice(p.price, p.currency) : t("page.priceOnRequest"),
    specs: [
      p.bedrooms ? t("page.metaBedrooms", { count: p.bedrooms }) : null,
      p.bathrooms ? t("page.bathrooms", { count: p.bathrooms }) : null,
      areaText ? (p.total_area ? areaText : t("social.coveredArea", { area: areaText })) : null,
    ].filter((value): value is string => Boolean(value)),
  };

  return new ImageResponse(
    <PropertySocialCard p={card} text={text} width={size.width} height={size.height} />,
    size
  );
}
