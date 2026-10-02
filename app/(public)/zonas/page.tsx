import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CardImage } from "@/features/properties/CardImage";
import { SplitHeading, StaggerItem } from "@/features/public/v2/motion";
import { getZones, type Zone } from "@/features/public/zones";
import { formatPrice } from "@/lib/brand";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Zonas",
  description: "Propiedades en venta y alquiler por zona: elegí la ciudad y mirá lo que hay disponible.",
};

// Celda extra para cerrar la última fila (3 columnas en desktop; la
// primera zona ocupa 2x2): así la grilla nunca termina con un hueco.
function lastSpan(n: number) {
  const remainder = (n + 3) % 3;
  if (n < 3 || remainder === 0) return "";
  return remainder === 1 ? "lg:col-span-3" : "lg:col-span-2";
}

function ZoneTile({ zone, large, className }: { zone: Zone; large: boolean; className: string }) {
  const from = zone.minSale ? `desde ${formatPrice(zone.minSale.price, zone.minSale.currency)}` : null;
  return (
    <Link
      href={`/zonas/${zone.slug}`}
      className={`group relative isolate flex h-full min-h-60 flex-col justify-end overflow-hidden rounded-3xl bg-foreground p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
    >
      {zone.image && (
        <CardImage src={zone.image} alt="" sizes={large ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 50vw"} className="-z-20" />
      )}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-[rgb(21_21_21/0.8)] via-[rgb(21_21_21/0.25)] to-transparent" />
      <div className="flex items-end justify-between gap-4 text-background">
        <div className="min-w-0">
          <p className={`font-display leading-[0.95] font-medium tracking-[-0.03em] ${large ? "text-5xl md:text-6xl" : "text-3xl"}`}>
            {zone.city}
          </p>
          <p className="mt-2 text-sm text-background/85">
            {zone.count} {zone.count === 1 ? "disponible" : "disponibles"}
            {from ? `, ${from}` : ""}
          </p>
        </div>
        <ArrowUpRight
          className="h-6 w-6 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}

// Índice de zonas: mosaico de fotos, una por ciudad con propiedades
// disponibles. La que más tiene va grande.
export default async function ZonasPage() {
  const zones = await getZones();

  return (
    <section className="w-full bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-24 md:px-8 md:pt-14 lg:pb-32">
        <SplitHeading
          as="h1"
          trigger="mount"
          text="Explorá por zona"
          className="font-display text-5xl leading-[0.95] font-medium tracking-[-0.035em] text-foreground md:text-6xl"
        />
        <p className="site-rise mt-5 max-w-[44ch] text-lg leading-relaxed text-fg-secondary [--rise-delay:400ms]">
          Elegí la ciudad y mirá todo lo que tenemos disponible ahí, en venta y en alquiler.
        </p>

        {zones.length === 0 ? (
          <p className="mt-12 rounded-3xl bg-card p-8 text-lg text-fg-secondary">Todavía no hay propiedades publicadas.</p>
        ) : (
          <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:auto-rows-[16rem] lg:grid-cols-3 lg:gap-5">
            {zones.map((zone, i) => {
              const large = i === 0 && zones.length >= 3;
              const last = i === zones.length - 1 && i > 0;
              return (
                <StaggerItem
                  as="li"
                  key={zone.slug}
                  index={i}
                  className={[
                    large ? "sm:col-span-2 lg:row-span-2" : "",
                    last ? lastSpan(zones.length) : "",
                    // En 2 columnas, si sobra una al final ocupa el ancho entero.
                    last && (zones.length - (large ? 0 : 1)) % 2 === 0 ? "sm:col-span-2" : "",
                  ].join(" ")}
                >
                  <ZoneTile zone={zone} large={large} className={large ? "sm:min-h-96" : ""} />
                </StaggerItem>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
