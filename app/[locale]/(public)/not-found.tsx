import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NotFoundContent } from "@/features/public/v2/NotFoundContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common.notFound");
  return { title: t("metaTitle") };
}

// notFound() dentro del sitio público (ej. una ficha que no existe): se
// muestra con el header y el footer del layout del grupo.
export default function PublicNotFound() {
  return <NotFoundContent />;
}
