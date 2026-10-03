import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { HeroSearch, type PropertyTypeOption } from "@/features/public/v2/HeroSearch";
import { SplitHeading } from "@/features/public/v2/motion";
import { getUniqueLocations } from "@/shared/utils/getLocations";

// Hero con foto enmarcada: entra entera en la pantalla debajo del header
// (64px), con margen blanco alrededor y esquinas redondeadas. Abajo
// a la izquierda, sobre un degradé oscuro, titular y bajada; a la derecha
// el buscador vertical, que es la acción principal del sitio. En móvil
// todo se apila sobre la foto: titular arriba, buscador abajo. Copy sin
// ubicación: el sitio es white-label.
export async function Hero({ types }: { types: PropertyTypeOption[] }) {
  const t = await getTranslations("home.hero");
  const locations = await getUniqueLocations();

  return (
    <section className="w-full bg-background p-3 md:p-5 lg:px-10">
      <div className="relative isolate flex min-h-[calc(100dvh-5.5rem)] w-full overflow-hidden rounded-4xl bg-foreground md:min-h-[calc(100dvh-6.5rem)]">
        {/* WebP ya comprimido: conservar su resolución completa. Con cover,
            el ancho visible no refleja cuánto se amplía la foto por su altura. */}
        <Image
          src="/hero-brasil-v1.webp"
          alt=""
          fill
          preload
          unoptimized
          className="site-settle -z-20 object-cover"
        />
        {/* public */}
        {/* Degradé para leer el texto claro: más denso abajo y a la izquierda. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-t from-[rgb(21_21_21/0.82)] via-[rgb(21_21_21/0.35)] to-[rgb(21_21_21/0.1)] lg:bg-linear-to-tr lg:via-[rgb(21_21_21/0.25)] lg:to-transparent"
        />

        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 content-end gap-10 px-4 pt-32 pb-6 md:px-8 lg:grid-cols-12 lg:items-end lg:gap-10 lg:pt-12 lg:pb-12">
          <div className="lg:col-span-7">
            <SplitHeading
              as="h1"
              trigger="mount"
              delay={0.1}
              text={t("title")}
              className="font-display text-[clamp(2.75rem,6vw,5.5rem)] leading-[0.95] font-medium tracking-[-0.035em] text-background"
            />
            <p className="site-rise mt-5 max-w-[40ch] text-lg leading-relaxed text-background/85 [--rise-delay:450ms] md:text-xl">
              {t("subtitle")}
            </p>
          </div>

          <div className="site-rise relative z-20 w-full [--rise-delay:600ms] sm:max-w-md lg:col-span-5 lg:max-w-none xl:col-span-4 xl:col-start-9">
            <HeroSearch locations={locations} types={types} />
          </div>
        </div>
      </div>
    </section>
  );
}
