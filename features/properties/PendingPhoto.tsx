"use client";

import { useState, ViewTransition } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cardPhotoFor, photoTransitionName } from "@/features/properties/photoTransition";

// Lugar de la foto principal en el esqueleto de la ficha. Si se llegó
// desde una tarjeta, muestra la foto que esa tarjeta ya tenía descargada
// (aparece al instante, sin pedir nada) con el mismo nombre de transición:
// la tarjeta se transforma acá y, cuando llega la ficha, de acá a la foto
// definitiva. Si no (link directo, recarga), es un bloque gris más.
export function PendingPhoto({ className }: { className: string }) {
  const { slug } = useParams<{ slug: string }>();
  const [src] = useState(() => cardPhotoFor(slug));

  if (!src) return <Skeleton className={`rounded-none ${className}`} />;

  return (
    <ViewTransition name={photoTransitionName(slug)} share="morph" default="none">
      <div className={`relative overflow-hidden rounded-4xl bg-sunken md:rounded-r-none ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- es la URL ya optimizada que bajó la tarjeta */}
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      </div>
    </ViewTransition>
  );
}
