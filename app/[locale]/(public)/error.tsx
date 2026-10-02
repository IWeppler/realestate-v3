"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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
  const t = useTranslations("common.error");
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      title={t("title")}
      body={t("body")}
      actions={
        <>
          <button type="button" onClick={() => retry()} className={`${statusPrimaryClass} cursor-pointer`}>
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            {t("retry")}
          </button>
          <Link href="/" className={statusSecondaryClass}>
            {t("home")}
          </Link>
        </>
      }
    />
  );
}
