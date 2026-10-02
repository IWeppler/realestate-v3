import type { Metadata } from "next";
import Image from "next/image";
import { ChartColumn, Hammer, MapPin, Ruler } from "lucide-react";
import { createClientServer } from "@/lib/supabase";
import { AppraisalForm } from "@/features/public/v2/AppraisalForm";
import { APPRAISAL_STEPS } from "@/features/public/v2/content";
import { Parallax, SplitHeading, StaggerItem } from "@/features/public/v2/motion";
import { Reveal } from "@/features/public/v2/Reveal";
import { CardImage } from "@/features/properties/CardImage";
import { getTranslations } from "next-intl/server";
import { asLocale, initLocale } from "@/i18n/server";
import { localizedAlternates, ogLocale } from "@/i18n/seo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = asLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "appraisal.page" });
  return { alternates: localizedAlternates("/tasar", locale), title: t("metaTitle"), description: t("metaDescription") };
}

const FACTORS = [
  { icon: MapPin, key: "location" },
  { icon: Hammer, key: "condition" },
  { icon: Ruler, key: "surface" },
  { icon: ChartColumn, key: "comparables" },
] as const;

const FAQ_KEYS = ["cost", "method", "documents", "commitment", "types"] as const;

// Alto de cada arco de "Cómo funciona" en desktop: suben como una
// escalera, del primer contacto al informe.
const STEP_HEIGHTS = ["sm:h-[22rem]", "sm:h-[26rem]", "sm:h-[30rem]"];

async function getData() {
  const supabase = await createClientServer();
  const [{ data: types }, { data: featured }] = await Promise.all([
    supabase.from("property_types").select("name").order("name"),
    // Foto de apoyo: una propiedad real de la cartera (la más vista con foto).
    supabase
      .from("properties")
      .select("title, property_images ( image_url, order )")
      .in("status", ["EN_VENTA", "EN_ALQUILER"])
      .order("views_count", { ascending: false, nullsFirst: false })
      .limit(5),
  ]);

  const photo = (featured ?? [])
    .map((p) => {
      const imgs = [...((p.property_images ?? []) as { image_url: string | null; order: number | null }[])].sort(
        (a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER),
      );
      return { title: p.title as string, src: imgs.find((i) => i.image_url)?.image_url ?? null };
    })
    .find((p) => p.src);

  return { propertyTypes: (types ?? []).map((t) => t.name as string), photo };
}

export default async function TasarPage({ params }: { params: Promise<{ locale: string }> }) {
  initLocale((await params).locale);
  const t = await getTranslations("appraisal.page");
  const tSteps = await getTranslations("common.appraisalSteps");
  const { propertyTypes, photo } = await getData();

  return (
    <div className="flex w-full flex-col">
      {/* --- Hero enmarcado (mismo marco que la home): titular abajo a la
          izquierda sobre la foto y el formulario en tarjeta a la derecha,
          visible al entrar porque es la acción de la página. --- */}
      <section className="w-full bg-background p-3 md:p-5 lg:px-10">
        <div className="relative isolate flex min-h-[calc(100dvh-5.5rem)] w-full overflow-hidden rounded-4xl bg-foreground md:min-h-[calc(100dvh-6.5rem)]">
          <Image
            src="/bghero5.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) calc(100vw - 5rem), (min-width: 768px) calc(100vw - 2.5rem), calc(100vw - 1.5rem)"
            className="site-settle -z-20 object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-to-t from-[rgb(21_21_21/0.85)] via-[rgb(21_21_21/0.4)] to-[rgb(21_21_21/0.15)] lg:bg-linear-to-tr lg:via-[rgb(21_21_21/0.3)] lg:to-transparent"
          />

          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 content-end gap-10 px-4 pt-32 pb-6 md:px-8 lg:grid-cols-12 lg:items-end lg:gap-10 lg:pt-12 lg:pb-12">
            <div className="lg:col-span-6">
              <SplitHeading
                as="h1"
                trigger="mount"
                delay={0.1}
                text={t("heroTitle")}
                className="font-display text-[clamp(2.75rem,5.6vw,5.25rem)] leading-[0.95] font-medium tracking-[-0.035em] text-background"
              />
              <p className="site-rise mt-5 max-w-[38ch] text-lg leading-relaxed text-background/85 [--rise-delay:450ms] md:text-xl">
                {t("heroIntro")}
              </p>
            </div>

            <div
              id="pedir-tasacion"
              className="site-rise relative z-20 w-full rounded-3xl bg-card p-5 shadow-[0_30px_60px_-30px_rgb(21_21_21/0.55)] [--rise-delay:600ms] sm:max-w-lg md:p-7 lg:col-span-6 lg:max-w-none xl:col-span-5 xl:col-start-8"
            >
              <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground">{t("formTitle")}</h2>
              <p className="mt-1 mb-6 text-sm text-fg-secondary">{t("formIntro")}</p>
              <AppraisalForm propertyTypes={propertyTypes} />
            </div>
          </div>
        </div>
      </section>

      {/* --- Cómo funciona: tres arcos (el logo es un arco) que suben
          como una escalera; el último, el informe, en naranja. --- */}
      <section aria-labelledby="tasar-steps-title" className="w-full bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 lg:py-28">
          <SplitHeading
            id="tasar-steps-title"
            text={t("stepsTitle")}
            className="font-display text-5xl leading-[0.95] font-medium tracking-[-0.035em] text-foreground md:text-6xl"
          />

          <ol className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end lg:gap-6">
            {APPRAISAL_STEPS.map((step, i) => {
              const last = i === APPRAISAL_STEPS.length - 1;
              return (
                <StaggerItem
                  as="li"
                  key={step}
                  index={i}
                  className={`flex flex-col justify-end rounded-3xl p-6 sm:rounded-t-full sm:rounded-b-3xl sm:p-7 ${STEP_HEIGHTS[i]} ${
                    last ? "bg-pop text-foreground" : "bg-card text-foreground"
                  }`}
                >
                  <span className="font-display text-6xl leading-none font-medium tracking-[-0.04em] tabular-nums" aria-hidden="true">
                    {i + 1}
                  </span>
                  <p className="mt-6 font-display text-2xl font-semibold tracking-[-0.02em]">{tSteps(`${step}.title`)}</p>
                  <p className={`mt-2 max-w-[32ch] text-[15px] leading-relaxed ${last ? "text-foreground" : "text-fg-secondary"}`}>
                    {tSteps(`${step}.body`)}
                  </p>
                </StaggerItem>
              );
            })}
          </ol>
        </div>
      </section>

      {/* --- Qué miramos: bento con una foto real de la cartera y los
          cuatro factores alrededor. --- */}
      <section aria-labelledby="tasar-factors-title" className="w-full bg-surface-alt">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 lg:py-28">
          <SplitHeading
            id="tasar-factors-title"
            text={t("factorsTitle")}
            className="max-w-[14ch] font-display text-5xl leading-[0.95] font-medium tracking-[-0.035em] text-foreground md:text-6xl"
          />

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[repeat(2,minmax(15rem,auto))] lg:gap-5">
            {photo?.src && (
              <Reveal className="min-h-72 sm:col-span-2 lg:row-span-2">
                <Parallax className="h-full min-h-72 w-full rounded-3xl bg-sunken">
                  <CardImage src={photo.src} alt={photo.title} sizes="(min-width: 1024px) 45vw, 100vw" />
                </Parallax>
              </Reveal>
            )}

            {FACTORS.map((f, i) => {
              // Una celda oscura rompe la grilla de tarjetas claras.
              const dark = i === 3;
              return (
                <StaggerItem
                  key={f.key}
                  index={i}
                  columns={2}
                  className={`flex flex-col justify-between gap-10 rounded-3xl p-6 ${
                    dark ? "bg-main text-primary-foreground" : "bg-card text-foreground"
                  } ${photo?.src ? "" : "lg:col-span-2"}`}
                >
                  <f.icon className={`h-7 w-7 ${dark ? "text-pop" : "text-foreground"}`} strokeWidth={1.5} aria-hidden="true" />
                  <div>
                    <p className="font-display text-2xl font-semibold tracking-[-0.02em]">{t(`factors.${f.key}.title`)}</p>
                    <p className={`mt-2 text-[15px] leading-relaxed ${dark ? "text-primary-foreground/80" : "text-fg-secondary"}`}>
                      {t(`factors.${f.key}.body`)}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- Preguntas frecuentes --- */}
      <section aria-labelledby="tasar-faq-title" className="w-full bg-background">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-4 py-20 md:px-8 lg:grid-cols-12 lg:gap-16 lg:py-28">
          <div className="lg:col-span-4">
            <SplitHeading
              id="tasar-faq-title"
              text={t("faqTitle")}
              className="max-w-[10ch] font-display text-5xl leading-[0.95] font-medium tracking-[-0.035em] text-foreground md:text-6xl"
            />
          </div>

          <Reveal delay={0.15} className="lg:col-span-8">
            <Accordion type="single" collapsible defaultValue="faq-0" className="border-t-2 border-foreground">
              {FAQ_KEYS.map((key, i) => (
                <AccordionItem key={key} value={`faq-${i}`} className="border-b border-border-strong">
                  <AccordionTrigger className="py-6 text-left font-display text-xl font-medium tracking-[-0.01em] text-foreground hover:no-underline md:text-2xl">
                    {t(`faq.${key}.q`)}
                  </AccordionTrigger>
                  <AccordionContent className="max-w-[60ch] pb-6 text-base leading-relaxed text-fg-secondary">
                    {t(`faq.${key}.a`)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
