import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StatusPage, statusPrimaryClass, statusSecondaryClass } from "@/features/public/v2/StatusPage";

// 404 del sitio público: una propiedad que ya no existe (link viejo,
// publicación dada de baja) o una dirección mal escrita.
export function NotFoundContent() {
  return (
    <StatusPage
      title="No encontramos esta página"
      body="Puede que la propiedad ya no esté publicada o que el enlace tenga un error. Mirá las que están disponibles."
      actions={
        <>
          <Link href="/propiedades" className={statusPrimaryClass}>
            Ver propiedades
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/" className={statusSecondaryClass}>
            Ir al inicio
          </Link>
        </>
      }
    />
  );
}
