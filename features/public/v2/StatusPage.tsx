import Image from "next/image";

// Pantalla de estado del sitio público (404, error): mensaje y acciones a
// la izquierda, la foto enmarcada en arco (como el logo) a la derecha. En
// móvil la foto va arriba y más baja.
export function StatusPage({
  title,
  body,
  actions,
}: {
  title: string;
  body: string;
  actions: React.ReactNode;
}) {
  return (
    <section className="w-full bg-background">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 pt-8 pb-24 md:px-8 md:pt-12 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-12 lg:gap-16 lg:py-12">
        <div className="lg:order-2 lg:col-span-5 lg:col-start-8">
          <div className="relative mx-auto aspect-[4/3] w-full max-w-sm overflow-hidden rounded-t-full rounded-b-3xl bg-sunken sm:aspect-[4/5] lg:max-w-none">
            <Image
              src="/contact.webp"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 24rem"
              className="object-cover"
            />
          </div>
        </div>

        <div className="lg:order-1 lg:col-span-6">
          <h1 className="max-w-[14ch] font-display text-5xl leading-[0.95] font-medium tracking-[-0.035em] text-foreground md:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-fg-secondary">{body}</p>
          <div className="mt-10 flex flex-wrap gap-3">{actions}</div>
        </div>
      </div>
    </section>
  );
}

export const statusPrimaryClass =
  "inline-flex h-[52px] items-center gap-2 rounded-full bg-main px-7 text-base font-semibold whitespace-nowrap text-primary-foreground transition-[background-color,transform] hover:bg-main-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]";

export const statusSecondaryClass =
  "inline-flex h-[52px] cursor-pointer items-center gap-2 rounded-full border border-border-strong px-7 text-base font-semibold whitespace-nowrap text-foreground transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
