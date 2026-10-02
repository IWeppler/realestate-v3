import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import PropertyCard from "@/features/properties/PropertyCard";
import { SplitHeading, StaggerItem } from "@/features/public/v2/motion";
import type { PropertyCardData } from "@/app/types/entities";

// Cuántas se muestran para que la grilla quede completa: la grande ocupa
// 2x2 y deja lugar a 2 a su lado (3) más una fila de 3 abajo (6).
function fitGrid(list: PropertyCardData[]) {
  if (list.length >= 6) return list.slice(0, 6);
  if (list.length >= 3) return list.slice(0, 3);
  return list;
}

// Destacadas: las disponibles más consultadas. Grilla asimétrica con una
// tarjeta grande (2x2) y el resto alrededor, así la primera manda.
export async function FeaturedListings({ properties }: { properties: PropertyCardData[] }) {
  const t = await getTranslations("home.featured");
  const items = fitGrid(properties);
  if (items.length === 0) return null;
  const grid = items.length >= 3;

  return (
    <section aria-labelledby="v3-featured-title" className="w-full bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 lg:py-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <SplitHeading
              id="v3-featured-title"
              text={t("title")}
              className="font-display text-5xl leading-[0.95] font-medium tracking-[-0.035em] text-foreground md:text-6xl"
            />
            <p className="mt-4 max-w-[44ch] text-lg text-fg-secondary">{t("subtitle")}</p>
          </div>
          <Link
            href="/propiedades"
            className="group hidden h-11 shrink-0 items-center gap-2 rounded-full border border-border-strong px-5 text-sm font-semibold whitespace-nowrap text-foreground transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:inline-flex"
          >
            {t("viewAll")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        <ul
          className={`mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 ${grid ? "lg:grid-cols-3" : ""}`}
        >
          {items.map((property, i) => {
            const big = grid && i === 0;
            return (
              <StaggerItem
                as="li"
                key={property.id}
                index={i}
                columns={3}
                className={[
                  big ? "sm:col-span-2 lg:row-span-2" : "",
                  // En 2 columnas la sexta quedaría sola en su fila.
                  i === 5 ? "sm:max-lg:hidden" : "",
                ].join(" ")}
              >
                <PropertyCard
                  property={property}
                  variant={big ? "feature" : "default"}
                  sizes={big ? "(min-width: 1024px) 60vw, 100vw" : undefined}
                />
              </StaggerItem>
            );
          })}
        </ul>

        <Link
          href="/propiedades"
          className="mt-10 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full border border-border-strong text-sm font-semibold text-foreground transition-colors hover:bg-card md:hidden"
        >
          {t("viewAll")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
