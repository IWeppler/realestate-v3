import { Skeleton } from "@/shared/components/ui/skeleton";

// Usar como fallback de `loading.tsx` en la ruta de reportes.
export function ReportsSkeleton() {
  return (
    <div className="space-y-8" aria-busy aria-label="Cargando reportes">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-64" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[104px]" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}
