import { notFound } from "next/navigation";

// Cualquier dirección que no existe dentro de un idioma cae acá y muestra
// app/[locale]/(public)/not-found.tsx, con header, footer y textos traducidos.
export default function CatchAllNotFound() {
  notFound();
}
