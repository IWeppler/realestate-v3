"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, CalendarDays, Check, Loader2, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { createLeadFromPublic } from "@/features/actions/createLeadActions";
import { propertyUrl, whatsappLink } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { Field, inputClass, invalidProps, submitClass } from "@/features/public/v2/formParts";

type Agent = { full_name: string | null; avatar_url: string | null; phone: string | null } | null;

type ContactProps = {
  propertyId: string;
  title: string;
  available: boolean;
  priceDisplay: string;
  priceLabel: string;
  expensasDisplay: string | null;
  agent: Agent;
};

// Acción principal en naranja (agendar visita, la conversión de la ficha);
// sin agendar disponible, WhatsApp pasa a ser la principal en negro.
const popClass =
  "inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-pop px-6 text-base font-semibold whitespace-nowrap text-foreground transition-[background-color,transform] hover:bg-pop-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-[0.99]";
const primaryClass =
  "inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-main px-6 text-base font-semibold whitespace-nowrap text-primary-foreground transition-[background-color,transform] hover:bg-main-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99]";
const secondaryClass =
  "inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full border border-border-strong px-6 text-base font-semibold whitespace-nowrap text-foreground transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

type PropertyT = ReturnType<typeof useTranslations<"contact.property">>;

// Mismo texto en servidor y cliente (sin window): la URL sale de la marca.
function waMessage(t: PropertyT, title: string, id: string) {
  return t("whatsappMessage", { title, url: propertyUrl(id) });
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

// Tarjeta de contacto de la ficha (columna derecha, fija al scrollear):
// precio, acción principal (agendar visita) y secundaria (WhatsApp), y el
// asesor a cargo. Si la propiedad ya no está disponible, se ofrece
// consultar por otras parecidas en lugar de agendar.
export function PropertyContactCard({
  propertyId,
  title,
  available,
  priceDisplay,
  priceLabel,
  expensasDisplay,
  agent,
}: ContactProps) {
  const t = useTranslations("contact.property");
  return (
    <div className="rounded-3xl bg-card p-6 shadow-[0_30px_60px_-36px_rgb(21_21_21/0.4)] md:p-7">
      <p className="text-sm text-fg-secondary">{priceLabel}</p>
      <p className="mt-1 font-display text-4xl leading-none font-medium tracking-[-0.035em] text-foreground md:text-5xl">
        {priceDisplay}
      </p>
      {expensasDisplay && (
        <p className="mt-2 text-sm text-fg-secondary">
          {t("expensas", { amount: expensasDisplay })}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3">
        {available ? (
          <Link href={`/agendar/${propertyId}`} className={popClass}>
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
            {t("book")}
          </Link>
        ) : (
          <p className="rounded-2xl bg-main-soft px-4 py-3 text-sm text-foreground">
            {t("unavailable")}
          </p>
        )}
        <a
          href={whatsappLink(waMessage(t, title, propertyId))}
          target="_blank"
          rel="noopener noreferrer"
          className={available ? secondaryClass : primaryClass}
        >
          <FaWhatsapp className="h-5 w-5" aria-hidden="true" />
          {t("whatsapp")}
        </a>
      </div>

      {agent?.full_name && (
        <div className="mt-8 flex items-center gap-4 border-t border-border pt-6">
          {agent.avatar_url ? (
            <Image
              src={agent.avatar_url}
              alt=""
              width={48}
              height={48}
              unoptimized
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pop text-sm font-semibold text-foreground"
              aria-hidden="true"
            >
              {initials(agent.full_name)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-foreground">{agent.full_name}</p>
            <p className="text-sm text-fg-secondary">{t("agentRole")}</p>
          </div>
          {agent.phone && (
            <a
              href={`tel:${agent.phone.replace(/[^\d+]/g, "")}`}
              aria-label={t("callAgent", { name: agent.full_name })}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border-strong text-foreground transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

type FormState = { success: boolean; message: string };
type Errors = Partial<Record<"name" | "phone" | "email", string>>;
const initialState: FormState = { success: false, message: "" };

type InquiryT = ReturnType<typeof useTranslations<"contact.property.inquiry">>;

function validate(data: FormData, t: InquiryT): Errors {
  const v = (k: string) => String(data.get(k) ?? "").trim();
  const errors: Errors = {};
  if (v("name").length < 3) errors.name = t("errors.name");
  if (v("phone").replace(/\D/g, "").length < 8) errors.phone = t("errors.phone");
  const email = v("email");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = t("errors.email");
  return errors;
}

// Consulta por la propiedad (createLeadFromPublic): llega al asesor de la
// propiedad con el vínculo a la ficha. Mismas piezas que los otros
// formularios del sitio.
export function PropertyInquiryForm({ propertyId, title }: { propertyId: string; title: string }) {
  const t = useTranslations("contact.property.inquiry");
  const [state, formAction, pending] = useActionState(createLeadFromPublic, initialState);
  const [errors, setErrors] = useState<Errors>({});

  if (state.success) {
    return (
      <div role="status" className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pop text-foreground">
          <Check className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-lg font-semibold text-foreground">{t("successTitle")}</p>
          <p className="mt-1 text-base text-fg-secondary">{t("successBody")}</p>
        </div>
      </div>
    );
  }

  const described = (key: keyof Errors) => invalidProps(errors[key], key);

  return (
    <form
      noValidate
      action={formAction}
      onSubmit={(e) => {
        const found = validate(new FormData(e.currentTarget), t);
        setErrors(found);
        if (Object.keys(found).length > 0) {
          e.preventDefault();
          e.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(found)[0]}"]`)?.focus();
        }
      }}
      onChange={(e) => {
        const name = (e.target as unknown as HTMLInputElement).name as keyof Errors;
        if (!errors[name]) return;
        setErrors((prev) => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }}
      className="flex flex-col gap-6"
    >
      <input type="hidden" name="propertyId" value={propertyId} />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field id="name" label={t("name")} error={errors.name}>
          <input id="name" name="name" autoComplete="name" className={inputClass} {...described("name")} />
        </Field>
        <Field id="phone" label={t("phone")} error={errors.phone}>
          <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" className={inputClass} {...described("phone")} />
        </Field>
      </div>
      <Field id="email" label={t("email")} hint={t("optional")} error={errors.email}>
        <input id="email" name="email" type="email" autoComplete="email" className={inputClass} {...described("email")} />
      </Field>
      <Field id="consulta" label={t("message")} hint={t("optional")}>
        <textarea
          id="consulta"
          name="consulta"
          rows={3}
          defaultValue={t("defaultMessage", { title })}
          className={cn(inputClass, "h-auto resize-none py-3 leading-relaxed")}
        />
      </Field>

      {state.message && !state.success && (
        <p role="alert" className="rounded-xl bg-destructive/8 px-4 py-3 text-sm text-destructive">
          {state.message}
        </p>
      )}

      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            {t("sending")}
          </>
        ) : (
          <>
            {t("submit")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}

// Barra fija inferior en mobile: precio + acción principal siempre a mano.
export function MobileContactBar({
  propertyId,
  title,
  available,
  priceDisplay,
  priceLabel,
}: Pick<ContactProps, "propertyId" | "title" | "available" | "priceDisplay" | "priceLabel">) {
  const t = useTranslations("contact.property");
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-fg-secondary">{priceLabel}</p>
          <p className="truncate font-display text-xl font-semibold tracking-[-0.02em] text-foreground">{priceDisplay}</p>
        </div>
        <a
          href={whatsappLink(waMessage(t, title, propertyId))}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("whatsapp")}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border-strong text-foreground"
        >
          <FaWhatsapp className="h-5 w-5" aria-hidden="true" />
        </a>
        {available && (
          <Link
            href={`/agendar/${propertyId}`}
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-pop px-5 text-sm font-semibold text-foreground active:scale-[0.98]"
          >
            {t("book")}
          </Link>
        )}
      </div>
    </div>
  );
}
