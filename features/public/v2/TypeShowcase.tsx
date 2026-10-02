"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/features/public/v2/Reveal";
import { SplitHeading, StaggerItem } from "@/features/public/v2/motion";
import type { TypeTile } from "@/features/public/v2/propertyTypes";

// Explorá por tipo: lista tipográfica grande a la derecha y, a la
// izquierda, una foto fija que cambia (fundido) según el tipo que se
// recorre con el mouse o el teclado. En móvil no hay foto grande: cada
// fila lleva su miniatura.
export function TypeShowcase({ tiles }: { tiles: TypeTile[] }) {
  const t = useTranslations("home.types");
  const [active, setActive] = useState(0);
  if (tiles.length === 0) return null;

  return (
    <section aria-labelledby="v3-types-title" className="w-full bg-surface-alt">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-4 py-20 md:px-8 lg:grid-cols-12 lg:gap-10 lg:py-28">
        <Reveal className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-24 aspect-[4/5] w-full overflow-hidden rounded-3xl bg-sunken">
            {tiles.map((tile, i) =>
              tile.image ? (
                <Image
                  key={tile.id}
                  src={tile.image}
                  alt=""
                  fill
                  sizes="40vw"
                  className={`object-cover transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
                    i === active ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
                  }`}
                />
              ) : null,
            )}
          </div>
        </Reveal>

        <div className="lg:col-span-7 lg:pl-6">
          <SplitHeading
            id="v3-types-title"
            text={t("title")}
            className="font-display text-5xl leading-[0.95] font-medium tracking-[-0.035em] text-foreground md:text-6xl"
          />

          <ul className="group/list mt-10 lg:mt-14">
            {tiles.map((tile, i) => (
              <StaggerItem as="li" key={tile.id} index={i} columns={1} className="border-t border-border-strong last:border-b">
                <Link
                  href={`/propiedades?typeId=${tile.id}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="group/item flex items-center gap-4 py-4 transition-colors focus-visible:outline-none md:gap-6 lg:py-6"
                >
                  {tile.image && (
                    <span className="relative block h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-sunken lg:hidden">
                      <Image src={tile.image} alt="" fill sizes="80px" className="object-cover" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate font-display text-[clamp(2rem,4.4vw,3.75rem)] leading-[1.05] font-medium tracking-[-0.035em] text-foreground transition-[color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:group-hover/list:text-foreground/35 lg:group-hover/item:translate-x-2 lg:group-hover/item:text-foreground! group-focus-visible/item:translate-x-2 group-focus-visible/item:underline group-focus-visible/item:decoration-pop group-focus-visible/item:underline-offset-8">
                    {tile.name}
                  </span>
                  <span className="shrink-0 text-sm text-fg-secondary tabular-nums">
                    {t("available", { count: tile.count })}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors duration-300 sm:flex ${
                      i === active ? "lg:bg-pop lg:text-foreground" : "text-foreground"
                    } group-hover/item:bg-pop`}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
