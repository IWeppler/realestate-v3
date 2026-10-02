"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { createContactLeadAction } from "@/features/actions/createContactLeadAction";
import { whatsappLink } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { Field, inputClass, invalidProps, submitClass } from "@/features/public/v2/formParts";

type FormState = { success: boolean; message: string };
type Errors = Partial<Record<"name" | "phone" | "email" | "message", string>>;

const initialState: FormState = { success: false, message: "" };

// Mismos valores que acepta el schema de createContactLeadAction.
const TOPICS = [
  { value: "Comprar", key: "buy" },
  { value: "Alquilar", key: "rent" },
  { value: "Vender", key: "sell" },
  { value: "Otra consulta", key: "other" },
] as const;

type T = ReturnType<typeof useTranslations<"contact.form">>;

// Mismas reglas que el schema de la Server Action, para avisar en el
// campo antes de enviar. El servidor vuelve a validar.
function validate(data: FormData, t: T): Errors {
  const v = (k: string) => String(data.get(k) ?? "").trim();
  const errors: Errors = {};
  if (v("name").length < 3) errors.name = t("errors.name");
  if (v("phone").replace(/\D/g, "").length < 8) errors.phone = t("errors.phone");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) errors.email = t("errors.email");
  if (v("message").length < 10) errors.message = t("errors.message");
  return errors;
}

// Formulario de contacto: motivo (opcional, llega en la nota del lead para
// que el agente sepa de qué se trata), datos y mensaje. Al enviar bien se
// reemplaza por la confirmación.
export function ContactForm() {
  const t = useTranslations("contact.form");
  const tc = useTranslations("common");
  const [state, formAction, pending] = useActionState(createContactLeadAction, initialState);
  const [errors, setErrors] = useState<Errors>({});

  if (state.success) {
    return (
      <div role="status" className="flex flex-col items-start gap-5 py-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-pop text-foreground">
          <Check className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 className="font-display text-4xl leading-[1] font-medium tracking-[-0.035em] text-foreground">
          {t("successTitle")}
        </h2>
        <p className="max-w-[40ch] text-lg leading-relaxed text-fg-secondary">
          {t("successBody")}
        </p>
        <a
          href={whatsappLink(t("successWhatsappMessage"))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-[52px] items-center gap-2 rounded-full bg-main px-7 text-base font-semibold whitespace-nowrap text-primary-foreground transition-colors hover:bg-main-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <FaWhatsapp className="h-5 w-5" aria-hidden="true" />
          {tc("contactCta")}
        </a>
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
          const first = Object.keys(found)[0];
          e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
        }
      }}
      // Al corregir un campo, su error se va sin esperar al próximo envío.
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
      <fieldset>
        <legend className="mb-3 text-sm font-medium text-foreground">
          {t("topicLegend")} <span className="font-normal text-fg-secondary">{t("optional")}</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((topic) => (
            <label key={topic.value}>
              <input type="radio" name="topic" value={topic.value} className="peer sr-only" />
              <span className="inline-flex h-9 cursor-pointer items-center rounded-full border border-border-strong px-3.5 text-sm font-medium text-fg-secondary transition-colors peer-checked:border-main peer-checked:bg-main peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 hover:border-foreground hover:text-foreground">
                {t(`topics.${topic.key}`)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field id="name" label={t("name")} error={errors.name}>
          <input id="name" name="name" autoComplete="name" className={inputClass} {...described("name")} />
        </Field>
        <Field id="phone" label={t("phone")} error={errors.phone}>
          <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" className={inputClass} {...described("phone")} />
        </Field>
      </div>

      <Field id="email" label={t("email")} error={errors.email}>
        <input id="email" name="email" type="email" autoComplete="email" className={inputClass} {...described("email")} />
      </Field>

      <Field id="message" label={t("message")} error={errors.message}>
        <textarea
          id="message"
          name="message"
          rows={4}
          className={cn(inputClass, "h-auto resize-none py-3 leading-relaxed")}
          placeholder={t("messagePlaceholder")}
          {...described("message")}
        />
      </Field>

      {state.message && !state.success && (
        <p role="alert" className="rounded-xl bg-destructive/8 px-4 py-3 text-sm text-destructive">
          {state.message}
        </p>
      )}

      <button type="submit" disabled={pending} className={cn(submitClass, "w-full text-base sm:w-full")}>
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
