"use client";

import { useState, ViewTransition } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Images } from "lucide-react";
import { Lightbox } from "@/features/properties/ImageGallery";
import styles from "./property-detail.module.css";
import { CardImage } from "@/features/properties/CardImage";
import { EASE } from "@/features/public/v2/motion";
import { cardPhotoFor, photoTransitionName } from "@/features/properties/photoTransition";

// Galería de la ficha: foto principal arriba y hasta
// dos fotos debajo, dentro de la columna sticky de la ficha. Cualquier foto abre
// el lightbox en su posición; el botón "Ver las N fotos" lo abre desde la
// primera. Entra con un recorte que se abre, una sola vez al cargar; si
// se llega desde una tarjeta, la foto principal viene volando desde ella
// (photoTransition.ts) y el recorte no se repite.
export function PropertyMedia({ id, images, title }: { id: string; images: string[]; title: string }) {
  const t = useTranslations("property.media");
  const [openAt, setOpenAt] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const [fromCard] = useState(() => cardPhotoFor(id) !== null);

  const open = (i: number) => {
    setIndex(i);
    setOpenAt(i);
  };

  if (images.length === 0) {
    return (
      <div className={`${styles.emptyMedia} flex w-full flex-col items-center justify-center gap-2 bg-sunken text-fg-secondary`}>
        <Images className="h-8 w-8 opacity-50" aria-hidden="true" />
        {t("empty")}
      </div>
    );
  }

  const shown = images.slice(0, 3);

  return (
    <>
      <motion.div
        className="relative"
        initial={reduce || fromCard ? false : { clipPath: "inset(4% 3% 0% 3% round 8px)" }}
        animate={{ clipPath: "inset(0% 0% 0% 0% round 8px)" }}
        transition={{ duration: 1.2, ease: EASE }}
      >
        <ul
          aria-label={t("listLabel")}
          className={`${styles.mediaGrid} ${shown.length === 1 ? styles.onePhoto : ""} ${shown.length === 2 ? styles.twoPhotos : ""}`}
        >
          {shown.map((src, i) => {
            // La principal lleva sus propias esquinas y su nombre de
            // transición: el morph captura la celda sola, sin el recorte
            // redondeado de la grilla.
            const main = i === 0;
            const cell = (
              <li key={`${src}-${i}`} className={`${styles.mediaCell} ${main ? styles.mediaMain : ""}`}>
                <button
                  type="button"
                  onClick={() => open(i)}
                  aria-label={i === 0 ? t("viewAllAria", { count: images.length, title }) : t("openPhoto", { index: i + 1, count: images.length })}
                  className="group relative block h-full w-full cursor-zoom-in overflow-hidden bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                >
                  {i === 0 ? (
                    <Image
                      src={src}
                      alt={t("mainAlt", { title })}
                      fill
                      loading="eager"
                      fetchPriority="high"
                      sizes="(min-width: 1480px) 780px, (min-width: 1024px) 58vw, 100vw"
                      className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  ) : (
                    <CardImage src={src} alt={t("photoAlt", { index: i + 1, title })} sizes="(min-width: 1480px) 390px, (min-width: 1024px) 29vw, 50vw" />
                  )}
                </button>
              </li>
            );
            return main ? (
              <ViewTransition key={`${src}-${i}`} name={photoTransitionName(id)} share="morph" default="none">
                {cell}
              </ViewTransition>
            ) : (
              cell
            );
          })}
        </ul>

        {images.length > 1 && (
          <button
            type="button"
            onClick={() => open(0)}
            className="absolute right-3 bottom-3 inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-background/90 px-4 text-sm font-semibold text-foreground shadow-[0_8px_24px_-12px_rgb(21_21_21/0.5)] backdrop-blur-sm transition-[background-color,transform] hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98] md:right-4 md:bottom-4"
          >
            <Images className="h-4 w-4" aria-hidden="true" />
            {t("viewAll", { count: images.length })}
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {openAt !== null && (
          <Lightbox
            images={images}
            title={title}
            index={index}
            onIndexChange={setIndex}
            onClose={() => setOpenAt(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
