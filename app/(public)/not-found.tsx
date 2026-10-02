import type { Metadata } from "next";
import { NotFoundContent } from "@/features/public/v2/NotFoundContent";

export const metadata: Metadata = { title: "Página no encontrada" };

// notFound() dentro del sitio público (ej. una ficha que no existe): se
// muestra con el header y el footer del layout del grupo.
export default function PublicNotFound() {
  return <NotFoundContent />;
}
