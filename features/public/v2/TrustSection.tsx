import { STATS, TESTIMONIALS } from "@/features/public/v2/content";
import { Reveal } from "@/features/public/v2/Reveal";
import { CountUp, SplitHeading, StaggerItem } from "@/features/public/v2/motion";

// Prueba social en dos franjas: cifras grandes en fila (sin cards, solo
// una línea arriba de cada una) y debajo una reseña destacada con dos
// secundarias apiladas al costado.
export function TrustSection() {
  const [featured, ...rest] = TESTIMONIALS;

  return (
    <section aria-labelledby="v2-trust-title" className="w-full bg-surface-alt">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 lg:py-28">
        <SplitHeading
          id="v2-trust-title"
          text="Quienes ya operaron con nosotros"
          className="max-w-[16ch] font-display text-5xl leading-[0.95] font-medium tracking-[-0.035em] text-foreground md:text-6xl"
        />

        <dl className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
          {STATS.map((stat, i) => (
            <StaggerItem key={stat.label} index={i} className="flex flex-col-reverse gap-2 border-t-2 border-foreground pt-5">
              <dt className="max-w-[24ch] text-sm text-fg-secondary">{stat.label}</dt>
              <dd className="font-display text-6xl leading-none font-medium tracking-[-0.04em] text-foreground tabular-nums lg:text-7xl">
                <CountUp value={stat.value} />
              </dd>
            </StaggerItem>
          ))}
        </dl>

        <Reveal delay={0.15} className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          <figure className="lg:col-span-7">
            <blockquote className="font-display text-2xl leading-snug font-medium tracking-[-0.015em] text-foreground md:text-3xl">
              “{featured.quote}”
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3 text-sm">
              <span aria-hidden="true" className="block h-4 w-3 rounded-t-full bg-pop" />
              <span>
                <span className="font-semibold text-foreground">{featured.name}</span>
                <span className="text-fg-secondary"> · {featured.role}</span>
              </span>
            </figcaption>
          </figure>

          <div className="flex flex-col gap-10 lg:col-span-4 lg:col-start-9">
            {rest.map((t) => (
              <figure key={t.name}>
                <blockquote className="text-base leading-relaxed text-fg-secondary">“{t.quote}”</blockquote>
                <figcaption className="mt-3 text-sm">
                  <span className="font-semibold text-foreground">{t.name}</span>
                  <span className="text-fg-secondary"> · {t.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
