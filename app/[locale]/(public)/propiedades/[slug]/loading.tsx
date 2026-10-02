import { useTranslations } from "next-intl";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PendingPhoto } from "@/features/properties/PendingPhoto";

const pulse = "bg-sunken motion-reduce:animate-none";

// Esqueleto de la ficha: mosaico de fotos, encabezado y las dos columnas
// (datos a la izquierda, tarjeta de contacto a la derecha en desktop).
export default function PropertyLoading() {
  const t = useTranslations("property.loading");
  return (
    <div className="w-full bg-background" aria-busy="true" aria-label={t("label")}>
      <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-28 md:px-8 md:pt-8">
        <Skeleton className={`mb-5 h-5 w-44 ${pulse}`} />

        <div className="grid aspect-[4/3] grid-cols-1 gap-2 overflow-hidden rounded-4xl md:aspect-auto md:h-[min(36rem,calc(100dvh-14rem))] md:min-h-[26rem] md:grid-cols-4 md:grid-rows-2">
          {/* Con la foto de la tarjeta si se llegó desde una (transición). */}
          <PendingPhoto className={`md:col-span-2 md:row-span-2 ${pulse}`} />
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className={`hidden rounded-none md:block ${pulse}`} />
          ))}
        </div>

        <div className="mt-8 md:mt-10">
          <div className="flex gap-2">
            <Skeleton className={`h-8 w-24 rounded-full ${pulse}`} />
            <Skeleton className={`h-8 w-20 rounded-full ${pulse}`} />
          </div>
          <Skeleton className={`mt-5 h-12 w-full max-w-2xl rounded-xl md:h-14 ${pulse}`} />
          <Skeleton className={`mt-4 h-6 w-72 max-w-full ${pulse}`} />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-16 lg:mt-16 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          <div className="lg:col-span-7 xl:col-span-8">
            <Skeleton className={`h-9 w-80 max-w-full rounded-xl ${pulse}`} />
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className={`h-36 rounded-2xl ${pulse}`} />
              ))}
            </div>
          </div>
          <Skeleton className={`hidden h-80 rounded-3xl lg:col-span-5 lg:block xl:col-span-4 ${pulse}`} />
        </div>
      </div>
    </div>
  );
}
