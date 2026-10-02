import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { BRAND } from "@/lib/brand";
import { createClientServer } from "@/lib/supabase";
import { VALUES } from "@/features/public/v2/content";
import { AppraisalBand } from "@/features/public/v2/AppraisalBand";
import { CountUp, SplitHeading, StaggerItem } from "@/features/public/v2/motion";
import { Reveal } from "@/features/public/v2/Reveal";
import { getZones } from "@/features/public/zones";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Nosotros",
  description: `Conocé al equipo de ${BRAND.name}: los asesores que te acompañan a comprar, vender o alquilar.`,
};

type Agent = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: string | null;
};

const ROLE_LABEL: Record<string, string> = {
  admin: "Dirección",
  agente: "Asesor inmobiliario",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

// Equipo = asesores con al menos una propiedad publicada, del que más
// tiene al que menos (deja afuera usuarios de prueba o sin cartera).
async function getTeam() {
  const supabase = await createClientServer();
  const [{ data: agents, error }, { data: props }] = await Promise.all([
    supabase.from("agents").select("id, full_name, avatar_url, phone, role"),
    supabase.from("properties").select("agent_id").in("status", ["EN_VENTA", "EN_ALQUILER"]),
  ]);
  if (error) console.error("Error al cargar el equipo:", error.message);

  const count = new Map<string, number>();
  for (const p of props ?? []) if (p.agent_id) count.set(p.agent_id, (count.get(p.agent_id) ?? 0) + 1);

  const team = ((agents ?? []) as Agent[])
    .filter((a) => a.full_name && (count.get(a.id) ?? 0) > 0)
    .map((a) => ({ ...a, listings: count.get(a.id) ?? 0 }))
    .sort((a, b) => b.listings - a.listings);

  return { team, available: props?.length ?? 0 };
}

// Página "Nosotros": quiénes son, cifras reales de la cartera, cómo
// trabajan y el equipo (de la base, con contacto directo a cada asesor).
// Cierra con la captación de propietarios.
export default async function NosotrosPage() {
  const [{ team, available }, zones] = await Promise.all([getTeam(), getZones()]);

  const stats = [
    { value: String(available), label: available === 1 ? "propiedad disponible" : "propiedades disponibles" },
    { value: String(zones.length), label: zones.length === 1 ? "zona con propiedades" : "zonas con propiedades" },
    { value: String(team.length), label: team.length === 1 ? "asesor a tu disposición" : "asesores a tu disposición" },
  ];

  return (
    <div className="flex w-full flex-col">
      {/* --- Presentación: titular y bajada, foto en arco (como el logo) --- */}
      <section className="w-full bg-background">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-end gap-10 px-4 pt-10 pb-16 md:px-8 md:pt-14 lg:grid-cols-12 lg:gap-16 lg:pb-24">
          <div className="lg:col-span-7 lg:pb-6">
            <SplitHeading
              as="h1"
              trigger="mount"
              delay={0.1}
              text="Un equipo que te responde."
              className="max-w-[14ch] font-display text-[clamp(2.75rem,5.6vw,5.25rem)] leading-[0.95] font-medium tracking-[-0.035em] text-balance text-foreground"
            />
            <p className="site-rise mt-6 max-w-[44ch] text-lg leading-relaxed text-fg-secondary [--rise-delay:450ms] md:text-xl">
              En {BRAND.name} te acompañamos a comprar, vender o alquilar, con un asesor que conoce la zona.
            </p>
          </div>
          <div className="site-rise [--rise-delay:250ms] lg:col-span-5">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-t-full rounded-b-3xl bg-sunken lg:max-w-none">
              <Image
                src="/bghero2.jpg"
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 28rem"
                className="site-settle object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- Cifras reales de la cartera --- */}
      <section aria-label="La inmobiliaria en números" className="w-full bg-background">
        <dl className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 pb-20 sm:grid-cols-3 sm:gap-6 md:px-8 lg:pb-28">
          {stats.map((s, i) => (
            <StaggerItem key={s.label} index={i} className="flex flex-col-reverse gap-2 border-t-2 border-foreground pt-5">
              <dt className="text-sm text-fg-secondary">{s.label}</dt>
              <dd className="font-display text-6xl leading-none font-medium tracking-[-0.04em] text-foreground tabular-nums lg:text-7xl">
                <CountUp value={s.value} />
              </dd>
            </StaggerItem>
          ))}
        </dl>
      </section>

      {/* --- Cómo trabajamos: bento con una foto y tres principios --- */}
      <section aria-labelledby="values-title" className="w-full bg-surface-alt">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 lg:py-28">
          <SplitHeading
            id="values-title"
            text="Cómo trabajamos"
            className="font-display text-5xl leading-[0.95] font-medium tracking-[-0.035em] text-foreground md:text-6xl"
          />
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[repeat(2,minmax(14rem,auto))] lg:gap-5">
            <Reveal className="relative min-h-72 overflow-hidden rounded-3xl bg-sunken sm:col-span-2 lg:row-span-2">
              <Image src="/bghero3.jpg" alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </Reveal>
            {VALUES.map((v, i) => {
              const accent = i === VALUES.length - 1;
              return (
                <StaggerItem
                  key={v.title}
                  index={i}
                  columns={2}
                  className={`flex flex-col justify-end gap-3 rounded-3xl p-6 md:p-7 ${
                    accent ? "bg-pop text-foreground sm:col-span-2" : "bg-card text-foreground"
                  }`}
                >
                  <p className="font-display text-2xl leading-tight font-semibold tracking-[-0.02em] md:text-3xl">{v.title}</p>
                  <p className={`max-w-[40ch] text-[15px] leading-relaxed ${accent ? "text-foreground" : "text-fg-secondary"}`}>
                    {v.body}
                  </p>
                </StaggerItem>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- Equipo: de la base, con contacto directo a cada asesor --- */}
      {team.length > 0 && (
        <section aria-labelledby="team-title" className="w-full bg-background">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 lg:py-28">
            <SplitHeading
              id="team-title"
              text="El equipo"
              className="font-display text-5xl leading-[0.95] font-medium tracking-[-0.035em] text-foreground md:text-6xl"
            />
            <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((agent, i) => {
                const name = agent.full_name ?? "";
                const digits = agent.phone?.replace(/\D/g, "") ?? "";
                return (
                  <StaggerItem as="li" key={agent.id} index={i} className="flex flex-col">
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-pop">
                      {agent.avatar_url ? (
                        <Image
                          src={agent.avatar_url}
                          alt={`Foto de ${name}`}
                          fill
                          unoptimized
                          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                          className="object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="flex h-full w-full items-center justify-center font-display text-8xl font-medium tracking-[-0.04em] text-foreground"
                        >
                          {initials(name)}
                        </span>
                      )}
                    </div>
                    <p className="mt-4 font-display text-2xl font-semibold tracking-[-0.02em] text-foreground">{name}</p>
                    <p className="mt-1 text-sm text-fg-secondary">
                      {ROLE_LABEL[agent.role ?? ""] ?? "Asesor inmobiliario"}, {agent.listings}{" "}
                      {agent.listings === 1 ? "propiedad a cargo" : "propiedades a cargo"}
                    </p>
                    {digits && (
                      <div className="mt-4 flex gap-2">
                        <a
                          href={`https://wa.me/${digits}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-11 items-center gap-2 rounded-full bg-main px-5 text-sm font-semibold text-primary-foreground transition-[background-color,transform] hover:bg-main-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
                        >
                          <FaWhatsapp className="h-4 w-4" aria-hidden="true" />
                          WhatsApp
                        </a>
                        <a
                          href={`tel:${agent.phone?.replace(/[^\d+]/g, "")}`}
                          aria-label={`Llamar a ${name}`}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-border-strong text-foreground transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <Phone className="h-4 w-4" aria-hidden="true" />
                        </a>
                      </div>
                    )}
                  </StaggerItem>
                );
              })}
            </ul>
            <Link
              href="/propiedades"
              className="group mt-12 inline-flex h-11 items-center gap-2 rounded-full border border-border-strong px-5 text-sm font-semibold text-foreground transition-colors hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Ver las propiedades del equipo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      )}

      <div className="pt-20 lg:pt-28">
        <AppraisalBand />
      </div>
    </div>
  );
}
