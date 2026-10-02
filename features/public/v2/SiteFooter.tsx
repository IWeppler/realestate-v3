import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BRAND, whatsappLink } from "@/lib/brand";
import { BrandMark } from "@/features/public/v2/SiteHeader";

const COLUMNS = [
  {
    title: "propertiesTitle",
    links: [
      { href: "/propiedades?tipo=venta", label: "buy" },
      { href: "/propiedades?tipo=alquiler", label: "rent" },
      { href: "/propiedades?vista=mapa", label: "map" },
      { href: "/zonas", label: "zones" },
    ],
  },
  {
    title: "agencyTitle",
    links: [
      { href: "/tasar", label: "appraise" },
      { href: "/nosotros", label: "about" },
      { href: "/contacto", label: "contact" },
      { href: "/login", label: "login" },
    ],
  },
] as const;

// Footer claro, mismo tema que la página: columnas de links arriba y el
// nombre de la marca en grande como cierre. Solo datos reales de BRAND:
// lo que no está configurado (dirección, Instagram) no se muestra.
export async function SiteFooter() {
  const t = await getTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-surface-alt">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-6 gap-y-12 px-4 pt-16 md:grid-cols-12 md:px-8 md:pt-20">
        <p className="col-span-2 max-w-[28ch] text-lg leading-snug text-foreground md:col-span-5">{BRAND.tagline}</p>

        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={t(`footer.${col.title}`)} className="md:col-span-2">
            <h2 className="text-sm text-fg-secondary">{t(`footer.${col.title}`)}</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[15px] font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {t(`footer.${link.label}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="col-span-2 md:col-span-3">
          <h2 className="text-sm text-fg-secondary">{t("footer.contactTitle")}</h2>
          <ul className="mt-4 flex flex-col gap-3 text-[15px] font-medium text-foreground">
            <li>
              <a
                href={whatsappLink(t("header.whatsappMessage"))}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
              >
                {BRAND.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${BRAND.email}`} className="break-all underline-offset-4 hover:underline">
                {BRAND.email}
              </a>
            </li>
            {BRAND.address && <li className="font-normal text-fg-secondary">{BRAND.address}</li>}
            {BRAND.instagram && (
              <li>
                <a
                  href={`https://instagram.com/${BRAND.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-4 hover:underline"
                >
                  {t("footer.instagram", { handle: BRAND.instagram })}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-16 md:px-8 md:pt-24">
        <Link
          href="/"
          aria-label={t("footer.homeAria", { brand: BRAND.name })}
          className="block font-display text-[clamp(2.5rem,7.6vw,7.5rem)] leading-[0.9] font-semibold tracking-[-0.045em] break-words text-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <BrandMark />
        </Link>
      </div>

      <div className="mx-auto mt-10 flex w-full max-w-7xl flex-col gap-2 border-t border-border px-4 py-6 text-xs text-fg-secondary sm:flex-row sm:justify-between md:px-8">
        <p>{t("footer.rights", { year, brand: BRAND.name })}</p>
        <p>
          {t.rich("footer.credits", {
            link: (chunks) => (
              <a
                href="https://www.ignacioweppler.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:underline"
              >
                {chunks}
              </a>
            ),
          })}
        </p>
      </div>
    </footer>
  );
}
