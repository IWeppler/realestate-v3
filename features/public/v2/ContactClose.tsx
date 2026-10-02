import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { FaWhatsapp } from "react-icons/fa";
import { BRAND, whatsappLink } from "@/lib/brand";
import { Reveal } from "@/features/public/v2/Reveal";
import { SplitHeading } from "@/features/public/v2/motion";

// Cierre de la página, tipográfico (el hero ya usa foto). Un solo
// CTA de contacto (WhatsApp); el email va como dato, no como segundo
// botón con la misma intención.
export function ContactClose() {
  const t = useTranslations("contact.close");
  const tc = useTranslations("common");
  return (
    <section aria-labelledby="v2-contact-title" id="contacto" className="w-full bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 lg:py-32">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <SplitHeading
              id="v2-contact-title"
              text={t("title")}
              className="max-w-[16ch] font-display text-5xl leading-[0.95] font-medium tracking-[-0.04em] text-foreground md:text-7xl lg:text-[5.5rem]"
            />
            <Reveal delay={0.3}>
              <p className="mt-6 max-w-[44ch] text-xl leading-[1.5] text-fg-secondary">
                {t("body")}
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.4} className="flex flex-col items-start gap-4 lg:col-span-4 lg:items-end">
            <a
              href={whatsappLink(t("whatsappMessage"))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[52px] items-center gap-2 rounded-full bg-main px-8 text-lg font-semibold whitespace-nowrap text-primary-foreground transition-[background-color,transform] hover:bg-main-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              <FaWhatsapp className="h-5 w-5" aria-hidden="true" />
              {tc("contactCta")}
            </a>
            <a
              href={`mailto:${BRAND.email}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {BRAND.email}
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
