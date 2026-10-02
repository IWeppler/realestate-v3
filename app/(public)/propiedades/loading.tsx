import { Skeleton } from "@/shared/components/ui/skeleton";

const pulse = "bg-sunken motion-reduce:animate-none";

// Esqueleto del listado mientras llegan los resultados: misma forma que la
// página (título, barra, grilla de 3 con foto 4:3 y dos líneas de pie).
export default function ListingLoading() {
  return (
    <div className="w-full bg-background" aria-busy="true" aria-label="Cargando propiedades">
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-28 md:px-8 md:pt-12">
        <Skeleton className={`h-12 w-72 max-w-full rounded-xl md:h-16 md:w-[28rem] ${pulse}`} />

        <div className="mt-8 flex items-center justify-between gap-3 md:mt-10">
          <Skeleton className={`h-5 w-28 ${pulse}`} />
          <div className="flex gap-2">
            <Skeleton className={`h-10 w-24 rounded-full ${pulse}`} />
            <Skeleton className={`hidden h-10 w-44 rounded-full sm:block ${pulse}`} />
            <Skeleton className={`h-10 w-[5.5rem] rounded-full ${pulse}`} />
          </div>
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className={i >= 3 ? "hidden sm:block" : undefined}>
              <Skeleton className={`aspect-4/3 w-full rounded-[8px] ${pulse}`} />
              <div className="mt-3 flex items-center justify-between gap-4">
                <Skeleton className={`h-5 w-1/2 ${pulse}`} />
                <Skeleton className={`h-4 w-1/4 ${pulse}`} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
