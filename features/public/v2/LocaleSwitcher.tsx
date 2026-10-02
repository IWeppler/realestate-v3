"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

// Cambia al otro idioma en la misma página (/propiedades ↔
// /pt/propiedades). Muestra el idioma al que lleva ("PT" / "ES"); el
// nombre completo va en aria-label. La elección queda guardada en una
// cookie (la escribe el proxy de idiomas).
export function LocaleSwitcher({ className = "", onClick }: { className?: string; onClick?: () => void }) {
  const locale = useLocale();
  const t = useTranslations("common.language");
  const pathname = usePathname();
  const other = locale === "pt-BR" ? "es-AR" : "pt-BR";

  return (
    <Link href={pathname} locale={other} hrefLang={other} aria-label={t("label")} onClick={onClick} className={className}>
      {t("short")}
    </Link>
  );
}
