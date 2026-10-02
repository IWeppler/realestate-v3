import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { APPRAISAL_STEPS } from "@/features/public/v2/content";
import { Reveal } from "@/features/public/v2/Reveal";
import { Parallax, SplitHeading, StaggerItem } from "@/features/public/v2/motion";

// Bloque de captación para propietarios: la conversión secundaria del
// sitio y el único bloque en naranja de la página. Sobre el naranja todo
// el texto va en off-black (los grises no pasan AA ahí).
export function AppraisalBand() {
  const t = useTranslations("appraisal.band");
  const tSteps = useTranslations("common.appraisalSteps");
  return (
    <section aria-labelledby="v2-appraisal-title" className="w-full bg-background px-4 pb-20 md:px-8 lg:pb-28">
      <Reveal className="mx-auto grid w-full max-w-7xl grid-cols-1 overflow-hidden rounded-4xl bg-pop text-foreground lg:grid-cols-12">
        <Parallax className="min-h-72 lg:order-none lg:col-span-5 lg:min-h-full">
          <Image
            src="/contact.webp"
            alt={t("imageAlt")}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
        </Parallax>

        <div className="flex flex-col px-6 py-14 md:px-14 md:py-20 lg:col-span-7 lg:py-24">
          <SplitHeading
            id="v2-appraisal-title"
            text={t("title")}
            delay={0.2}
            className="max-w-[16ch] font-display text-5xl leading-[0.95] font-medium tracking-[-0.035em] md:text-6xl"
          />
          <p className="mt-6 max-w-[44ch] text-lg leading-relaxed md:text-xl">
            {t("body")}
          </p>

          <ol className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {APPRAISAL_STEPS.map((step, i) => (
              <StaggerItem as="li" key={step} index={i} className="flex flex-col gap-1.5 border-t-2 border-foreground pt-4">
                <p className="font-display text-xl font-semibold tracking-[-0.01em]">{tSteps(`${step}.title`)}</p>
                <p className="text-sm leading-relaxed">{tSteps(`${step}.body`)}</p>
              </StaggerItem>
            ))}
          </ol>

          <Link
            href="/tasar"
            className="group mt-12 inline-flex h-[52px] w-fit items-center gap-2 rounded-full bg-main px-8 text-base font-semibold whitespace-nowrap text-primary-foreground transition-[background-color,transform] hover:bg-main-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-pop active:scale-[0.98]"
          >
            {t("cta")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
