"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";
import { StatusPage, statusPrimaryClass, statusSecondaryClass } from "@/features/public/v2/StatusPage";

// Error inesperado en una página del sitio público (ej. Supabase no
// responde). El header y el footer siguen en pie; "Reintentar" vuelve a
// pedir y renderizar el segmento.
export default function PublicError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      title="Algo no cargó bien"
      body="Tuvimos un problema para mostrar esta página. Probá de nuevo en unos segundos."
      actions={
        <>
          <button type="button" onClick={() => retry()} className={`${statusPrimaryClass} cursor-pointer`}>
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            Reintentar
          </button>
          <Link href="/" className={statusSecondaryClass}>
            Ir al inicio
          </Link>
        </>
      }
    />
  );
}
