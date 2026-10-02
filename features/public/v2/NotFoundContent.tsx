import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { StatusPage, statusPrimaryClass, statusSecondaryClass } from "@/features/public/v2/StatusPage";

// 404 del sitio público: una propiedad que ya no existe (link viejo,
// publicación dada de baja) o una dirección mal escrita.
export async function NotFoundContent() {
  const t = await getTranslations("common.notFound");
  return (
    <StatusPage
      title={t("title")}
      body={t("body")}
      actions={
        <>
          <Link href="/propiedades" className={statusPrimaryClass}>
            {t("viewProperties")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/" className={statusSecondaryClass}>
            {t("home")}
          </Link>
        </>
      }
    />
  );
}
