"use client";

import { useActionState, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { createAppraisalLeadAction } from "@/features/actions/createAppraisalLeadAction";
import { whatsappLink } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { Field, inputClass, invalidProps } from "@/features/public/v2/formParts";
import { SegmentedControl } from "@/features/public/v2/ChoiceGroup";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

type FormState = { success: boolean; message: string };
type Key = "operationType" | "propertyType" | "address" | "name" | "phone" | "email";
type Errors = Partial<Record<Key, string>>;

const initialState: FormState = { success: false, message: "" };

const STEPS = [
  { label: "stepProperty", keys: ["operationType", "propertyType", "address"] as Key[] },
  { label: "stepContact", keys: ["name", "phone", "email"] as Key[] },
] as const;

const OPERATIONS = [
  { value: "VENTA", key: "sell" },
  { value: "ALQUILER", key: "rent" },
] as const;

type T = ReturnType<typeof useTranslations<"appraisal.form">>;

// Mismas reglas que el schema de la Server Action (createAppraisalLeadAction),
// para avisar en el campo antes de enviar. El servidor vuelve a validar.
function validate(data: FormData, t: T): Errors {
  const v = (k: string) => String(data.get(k) ?? "").trim();
  const errors: Errors = {};
  if (!v("operationType")) errors.operationType = t("errors.operationType");
  if (!v("propertyType")) errors.propertyType = t("errors.propertyType");
  if (v("address").length < 5) errors.address = t("errors.address");
  if (v("name").length < 3) errors.name = t("errors.name");
  if (v("phone").replace(/\D/g, "").length < 8) errors.phone = t("errors.phone");
  const email = v("email");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = t("errors.email");
  return errors;
}

const pick = (errors: Errors, keys: Key[]) =>
  Object.fromEntries(Object.entries(errors).filter(([k]) => keys.includes(k as Key))) as Errors;

// Formulario de tasación en dos pasos (la propiedad, después tus datos)
// para que la tarjeta no sea una pared de campos. Es un solo <form>: el
// paso oculto sigue dentro y viaja en el envío, con los mismos nombres de
// campo de siempre. Al enviar bien, se reemplaza por la confirmación.
export function AppraisalForm({ propertyTypes }: { propertyTypes: string[] }) {
  const t = useTranslations("appraisal.form");
  const tc = useTranslations("common");
  const [state, formAction, pending] = useActionState(createAppraisalLeadAction, initialState);
  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState(0);
  const [operation, setOperation] = useState("VENTA");
  const [propertyType, setPropertyType] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  if (state.success) {
    return (
      <div role="status" className="flex flex-col items-start gap-5 py-4">
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

  const described = (key: Key) => invalidProps(errors[key], key);

  const focusField = (name: string) =>
    // Después del render: el paso puede estar recién visible.
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`#${name}`)?.focus());

  const goTo = (target: number) => {
    setStep(target);
    focusField(STEPS[target].keys[target === 0 ? 2 : 0]);
  };

  const next = () => {
    if (!formRef.current) return;
    const found = pick(validate(new FormData(formRef.current), t), STEPS[0].keys);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusField(Object.keys(found)[0]);
      return;
    }
    goTo(1);
  };

  const clear = (name: Key) => {
    if (!errors[name]) return;
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  return (
    <form
      ref={formRef}
      noValidate
      action={formAction}
      onSubmit={(e) => {
        const found = validate(new FormData(e.currentTarget), t);
        setErrors(found);
        if (Object.keys(found).length > 0) {
          e.preventDefault();
          const first = Object.keys(found)[0] as Key;
          const target = STEPS[0].keys.includes(first) ? 0 : 1;
          setStep(target);
          focusField(first);
        }
      }}
      // Al corregir un campo, su error se va sin esperar al próximo envío.
      onChange={(e) => clear((e.target as unknown as HTMLInputElement).name as Key)}
      className="flex flex-col gap-6"
    >
      {/* Progreso: los dos pasos con su nombre; el primero se puede volver a abrir. */}
      <ol className="grid grid-cols-2 gap-2" aria-label={t("stepsLabel")}>
        {STEPS.map((s, i) => {
          const active = step === i;
          const done = step > i;
          return (
            <li key={s.label}>
              <button
                type="button"
                onClick={() => (i === 0 ? goTo(0) : next())}
                aria-current={active ? "step" : undefined}
                className="flex w-full cursor-pointer flex-col gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                <span className={cn("block h-1 w-full rounded-full transition-colors duration-500", active || done ? "bg-foreground" : "bg-border")} />
                <span className={cn("flex items-center gap-1.5 text-sm font-medium", active || done ? "text-foreground" : "text-fg-secondary")}>
                  {done && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                  {t(s.label)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div hidden={step !== 0} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">{t("operationQuestion")}</span>
          <SegmentedControl
            label={t("operationLabel")}
            options={OPERATIONS.map((o) => ({ value: o.value, label: t(`operations.${o.key}`) }))}
            value={operation} onChange={setOperation} />
          <input type="hidden" name="operationType" value={operation} />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field id="propertyType" label={t("propertyType")} error={errors.propertyType}>
            {/* Select de shadcn (Radix): el valor viaja en el input oculto. */}
            <Select
              value={propertyType}
              onValueChange={(v) => {
                setPropertyType(v);
                clear("propertyType");
              }}
            >
              <SelectTrigger
                id="propertyType"
                className="h-12! w-full cursor-pointer rounded-xl border-input bg-background px-4 text-base hover:border-border-strong focus-visible:border-foreground focus-visible:ring-3 focus-visible:ring-ring/15 data-[state=open]:border-foreground"
                {...described("propertyType")}
              >
                <SelectValue placeholder={t("propertyTypePlaceholder")} />
              </SelectTrigger>
              <SelectContent className="max-h-72 rounded-xl border-border bg-popover p-1 shadow-[0_16px_40px_-12px_rgb(21_21_21/0.35)]">
                {propertyTypes.map((t) => (
                  <SelectItem key={t} value={t} className="cursor-pointer rounded-lg py-2.5 pl-3 text-[15px] text-foreground focus:bg-muted focus:text-foreground">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="propertyType" value={propertyType} />
          </Field>

          <Field id="address" label={t("address")} error={errors.address}>
            <input
              id="address"
              name="address"
              autoComplete="street-address"
              placeholder={t("addressPlaceholder")}
              className={inputClass}
              {...described("address")}
            />
          </Field>
        </div>

        <button
          type="button"
          onClick={next}
          className="group inline-flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-main text-base font-semibold text-primary-foreground transition-[background-color,transform] hover:bg-main-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99]"
        >
          {t("continue")}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </button>
      </div>

      <div hidden={step !== 1} className="flex flex-col gap-6">
        <Field id="name" label={t("name")} error={errors.name}>
          <input id="name" name="name" autoComplete="name" className={inputClass} {...described("name")} />
        </Field>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field id="phone" label={t("phone")} error={errors.phone}>
            <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" className={inputClass} {...described("phone")} />
          </Field>
          <Field id="email" label={t("email")} hint={t("optional")} error={errors.email}>
            <input id="email" name="email" type="email" autoComplete="email" className={inputClass} {...described("email")} />
          </Field>
        </div>

        <Field id="consulta" label={t("notes")} hint={t("optional")}>
          <textarea
            id="consulta"
            name="consulta"
            rows={3}
            className={cn(inputClass, "h-auto resize-none py-3 leading-relaxed")}
            placeholder={t("notesPlaceholder")}
          />
        </Field>

        {state.message && !state.success && (
          <p role="alert" className="rounded-xl bg-destructive/8 px-4 py-3 text-sm text-destructive">
            {state.message}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => goTo(0)}
            aria-label={t("back")}
            className="flex h-[52px] w-[52px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-border-strong text-foreground transition-colors hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="submit"
            disabled={pending}
            className="group inline-flex h-[52px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-pop text-base font-semibold text-foreground transition-[background-color,transform] hover:bg-pop-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-wait disabled:opacity-80"
          >
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
        </div>
      </div>
    </form>
  );
}
