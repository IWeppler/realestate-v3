import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { BRAND, whatsappLink } from "@/lib/brand";
import { ContactForm } from "@/features/public/v2/ContactForm";
import { SplitHeading, StaggerItem } from "@/features/public/v2/motion";
import { getTranslations } from "next-intl/server";
import { asLocale, initLocale } from "@/i18n/server";
import { localizedAlternates, ogLocale } from "@/i18n/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = asLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "contact.page" });
  return { alternates: localizedAlternates("/contacto", locale), title: t("metaTitle"), description: t("metaDescription", { brand: BRAND.name }) };
}

const tileFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// Email cortado después de la "@" si no entra, nunca a mitad del dominio.
function EmailText({ value }: { value: string }) {
  const [user, domain] = value.split("@");
  return (
    <>
      {user}@<wbr />
      {domain}
    </>
  );
}

// Contacto: a la izquierda el titular y los canales directos en mosaico
// (WhatsApp, el más rápido, grande y en naranja; teléfono y email en filas;
// abajo una foto con la oficina si está configurada). A la derecha el
// formulario. En móvil: titular, canales, formulario.
export default async function ContactoPage({ params }: { params: Promise<{ locale: string }> }) {
  initLocale((await params).locale);
  const t = await getTranslations("contact.page");
  const tc = await getTranslations("common");
  const phoneHref = `tel:${BRAND.phoneDisplay.replace(/[^\d+]/g, "")}`;

  return (
    <section className="w-full bg-background">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-4 pt-10 pb-24 md:px-8 md:pt-14 lg:grid-cols-12 lg:gap-10 lg:pb-32">
        <div className="lg:col-span-6 xl:col-span-5">
          <SplitHeading
            as="h1"
            trigger="mount"
            text={t("heading")}
            className="max-w-[14ch] font-display text-5xl leading-[0.95] font-medium tracking-[-0.035em] text-foreground md:text-6xl"
          />
          <p className="site-rise mt-5 max-w-[42ch] text-lg leading-relaxed text-fg-secondary [--rise-delay:450ms]">
            {t("intro")}
          </p>

          <ul aria-label={t("channelsLabel")} className="mt-10 grid grid-cols-2 gap-3">
            <StaggerItem as="li" index={0} columns={1} className="col-span-2">
              <a
                href={whatsappLink(t("whatsappMessage"))}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex min-h-44 flex-col justify-between gap-8 rounded-3xl bg-pop p-6 text-foreground transition-[background-color,transform] hover:bg-pop-hover active:scale-[0.99] ${tileFocus}`}
              >
                <span className="flex items-start justify-between gap-4">
                  <FaWhatsapp className="h-7 w-7" aria-hidden="true" />
                  <ArrowUpRight
                    className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </span>
                <span>
                  <span className="block text-sm font-medium">{t("whatsapp")}</span>
                  <span className="mt-1 block font-display text-4xl leading-none font-medium tracking-[-0.035em]">
                    {tc("contactCta")}
                  </span>
                </span>
              </a>
            </StaggerItem>

            {/* Teléfono y email en filas de ancho completo: el email es largo
                y en media columna se cortaba. */}
            {[
              { icon: Phone, label: t("phone"), href: phoneHref, value: <span className="tabular-nums">{BRAND.phoneDisplay}</span> },
              { icon: Mail, label: t("email"), href: `mailto:${BRAND.email}`, value: <EmailText value={BRAND.email} /> },
            ].map(({ icon: Icon, label, href, value }, i) => (
              <StaggerItem as="li" key={label} index={i + 1} columns={1} className="col-span-2">
                <a
                  href={href}
                  className={`group flex items-center gap-4 rounded-3xl bg-card p-5 text-foreground transition-colors hover:bg-sunken ${tileFocus}`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-fg-secondary">{label}</span>
                    <span className="block font-display text-base leading-snug font-semibold tracking-[-0.015em] break-words sm:text-lg md:text-xl">
                      {value}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="h-5 w-5 shrink-0 text-fg-secondary transition-[color,transform] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                    aria-hidden="true"
                  />
                </a>
              </StaggerItem>
            ))}

            {/* Foto de cierre. Si hay oficina configurada, su dirección va
                sobre un degradé; si no, la foto queda sola. */}
            <StaggerItem as="li" index={3} columns={1} className="relative col-span-2 min-h-48 overflow-hidden rounded-3xl bg-sunken">
              <Image
                src="/bghero2.jpg"
                alt=""
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover object-[50%_70%]"
              />
              {BRAND.address && (
                <div className="absolute inset-0 flex items-end bg-linear-to-t from-[rgb(21_21_21/0.75)] to-transparent p-5">
                  <p className="flex items-start gap-2 text-background">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      <span className="block text-sm text-background/80">{t("office")}</span>
                      <span className="block text-base font-semibold">{BRAND.address}</span>
                    </span>
                  </p>
                </div>
              )}
            </StaggerItem>
          </ul>
        </div>

        <div className="lg:col-span-6 xl:col-span-6 xl:col-start-7">
          <div className="site-rise rounded-3xl bg-card p-6 shadow-[0_30px_60px_-36px_rgb(21_21_21/0.4)] [--rise-delay:300ms] md:p-8 lg:sticky lg:top-24">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground">{t("formTitle")}</h2>
            <p className="mt-1 mb-8 text-sm text-fg-secondary">{t("formIntro")}</p>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
