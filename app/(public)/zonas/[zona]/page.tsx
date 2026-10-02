import type { Metadata } from "next";
import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BellRing, Map as MapIcon } from "lucide-react";
import { createClientServer } from "@/lib/supabase";
import { formatPrice } from "@/lib/brand";
import PropertyCard from "@/features/properties/PropertyCard";
import type { PropertyCardData } from "@/app/types/entities";
import { SplitHeading, StaggerItem } from "@/features/public/v2/motion";
import { SearchAlertDialog } from "@/features/public/v2/SearchAlert";
import { AlertTile } from "@/features/public/v2/AlertTile";
import { getZone } from "@/features/public/zones";
import { getUniqueLocations } from "@/shared/utils/getLocations";

export const revalidate = 300;

const CARD_FIELDS = `
  id, title, price, currency, bedrooms, bathrooms, total_area, cocheras,
  city, street_address, status, property_images ( image_url, order )
`;

// Después de la quinta propiedad (cierra la segunda fila en 3 columnas).
const ALERT_POSITION = 5;

export async function generateMetadata({ params }: { params: Promise<{ zona: string }> }): Promise<Metadata> {
  const { zona } = await params;
  const { zone } = await getZone(zona);
  if (!zone) return { title: "Zona no encontrada" };
  return {
    title: `Propiedades en ${zone.city}`,
    description: `Casas, departamentos y terrenos en venta y alquiler en ${zone.city}${
      zone.province ? `, ${zone.province}` : ""
    }. ${zone.count} propiedades disponibles.`,
    alternates: { canonical: `/zonas/${zone.slug}` },
  };
}

// Página de una zona: hero enmarcado con una foto de la ciudad, cifras
// reales (en venta, en alquiler, precio desde), las propiedades
// disponibles y la alerta "Avisame cuando entre algo así" ya filtrada por
// la ciudad. Cierra con las otras zonas.
export default async function ZonaPage({ params }: { params: Promise<{ zona: string }> }) {
  const { zona } = await params;
  const { zone, zones } = await getZone(zona);
  if (!zone) notFound();

  const supabase = await createClientServer();
  // Propiedades de la zona y opciones para ajustar la alerta en el diálogo.
  const [{ data, error }, { data: types }, locations] = await Promise.all([
    supabase
      .from("properties")
      .select(CARD_FIELDS)
      .eq("city", zone.city)
      .in("status", ["EN_VENTA", "EN_ALQUILER"])
      .order("created_at", { ascending: false }),
    supabase.from("property_types").select("id, name").order("name"),
    getUniqueLocations(),
  ]);
  if (error) console.error(`Error al cargar propiedades de ${zone.city}:`, error.message);
  const properties = (data ?? []) as PropertyCardData[];

  const criteria = { loc: zone.city };
  const alertOptions = { types: types ?? [], locations };
  const others = zones.filter((z) => z.slug !== zone.slug);

  const stats = [
    { value: String(zone.sale), label: zone.sale === 1 ? "propiedad en venta" : "propiedades en venta" },
    { value: String(zone.rent), label: zone.rent === 1 ? "propiedad en alquiler" : "propiedades en alquiler" },
    ...(zone.minSale ? [{ value: formatPrice(zone.minSale.price, zone.minSale.currency), label: "precio de venta más bajo" }] : []),
  ];

  return (
    <div className="flex w-full flex-col">
      {/* --- Hero enmarcado (mismo marco que la home, más bajo) --- */}
      <section className="w-full bg-background p-3 md:p-5 lg:px-10">
        <div className="relative isolate flex min-h-[min(34rem,calc(100dvh-6.5rem))] w-full overflow-hidden rounded-4xl bg-foreground">
          {zone.image && (
            <Image
              src={zone.image}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) calc(100vw - 5rem), 100vw"
              className="site-settle -z-20 object-cover"
            />
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-to-t from-[rgb(21_21_21/0.82)] via-[rgb(21_21_21/0.3)] to-[rgb(21_21_21/0.1)]"
          />
          <div className="mx-auto flex w-full max-w-7xl flex-col justify-end px-4 pt-32 pb-8 md:px-8 lg:pb-12">
            <Link
              href="/zonas"
              className="site-rise mb-4 w-fit rounded-full text-sm font-medium text-background/80 underline-offset-4 hover:text-background hover:underline [--rise-delay:200ms]"
            >
              Todas las zonas
            </Link>
            <SplitHeading
              as="h1"
              trigger="mount"
              delay={0.1}
              text={`Propiedades en ${zone.city}`}
              className="max-w-[16ch] font-display text-[clamp(2.75rem,6vw,5.25rem)] leading-[0.95] font-medium tracking-[-0.035em] text-background"
            />
            {zone.province && (
              <p className="site-rise mt-4 text-lg text-background/85 [--rise-delay:450ms] md:text-xl">{zone.province}</p>
            )}
          </div>
        </div>
      </section>

      {/* --- Cifras reales de la zona + acciones --- */}
      <section aria-label={`${zone.city} en números`} className="w-full bg-background">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pt-10 md:px-8 md:pt-14 lg:flex-row lg:items-end lg:justify-between">
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-10">
            {stats.map((s, i) => (
              <StaggerItem key={s.label} index={i} className={`flex flex-col-reverse gap-2 border-t-2 border-foreground pt-4 ${i === 2 ? "col-span-2 sm:col-span-1" : ""}`}>
                <dt className="text-sm text-fg-secondary">{s.label}</dt>
                <dd className="font-display text-4xl leading-none font-medium tracking-[-0.035em] text-foreground tabular-nums md:text-5xl">
                  {s.value}
                </dd>
              </StaggerItem>
            ))}
          </dl>

          <div className="flex flex-wrap gap-3">
            <SearchAlertDialog criteria={criteria} options={alertOptions}>
              <button
                type="button"
                className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-pop px-6 text-[15px] font-semibold whitespace-nowrap text-foreground transition-[background-color,transform] hover:bg-pop-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                <BellRing className="h-4 w-4" aria-hidden="true" />
                Avisame cuando entre
              </button>
            </SearchAlertDialog>
            <Link
              href={`/propiedades?loc=${encodeURIComponent(zone.city)}&vista=mapa`}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-border-strong px-6 text-[15px] font-semibold whitespace-nowrap text-foreground transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <MapIcon className="h-4 w-4" aria-hidden="true" />
              Ver en el mapa
            </Link>
          </div>
        </div>
      </section>

      {/* --- Propiedades disponibles --- */}
      <section aria-label={`Propiedades disponibles en ${zone.city}`} className="w-full bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 pt-12 pb-20 md:px-8 lg:pb-28">
          <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property, i) => (
              <Fragment key={property.id}>
                {i === ALERT_POSITION && <AlertTile criteria={criteria} options={alertOptions} />}
                <StaggerItem as="li" index={i}>
                  <PropertyCard property={property} />
                </StaggerItem>
              </Fragment>
            ))}
          </ul>
        </div>
      </section>

      {/* --- Otras zonas --- */}
      {others.length > 0 && (
        <section aria-labelledby="other-zones-title" className="w-full bg-surface-alt">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 lg:py-24">
            <h2 id="other-zones-title" className="font-display text-4xl leading-[0.95] font-medium tracking-[-0.035em] text-foreground md:text-5xl">
              Otras zonas
            </h2>
            <ul className="mt-8 flex flex-wrap gap-2">
              {others.map((z) => (
                <li key={z.slug}>
                  <Link
                    href={`/zonas/${z.slug}`}
                    className="group inline-flex h-12 items-center gap-3 rounded-full bg-card pr-3 pl-5 text-[15px] font-semibold text-foreground transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {z.city}
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-fg-secondary tabular-nums">{z.count}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
