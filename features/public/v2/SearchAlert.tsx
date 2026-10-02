"use client";

import { useActionState, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { BellRing, Check, Loader2, SlidersHorizontal, X } from "lucide-react";
import { createSearchAlertAction } from "@/features/actions/createSearchAlertAction";
import { LocationCombobox, type LocationSuggestion } from "@/features/properties/LocationCombobox";
import { ChoiceGroup, SegmentedControl } from "@/features/public/v2/ChoiceGroup";
import { Field, inputClass, invalidProps } from "@/features/public/v2/formParts";
import { BEDROOM_OPTIONS } from "@/features/public/v2/HeroSearch";
import { criteriaChips, withoutChip, type CriteriaChip, type CriteriaKey, type SearchCriteria } from "@/features/public/searchCriteria";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";

type FormState = { success: boolean; message: string };
type Errors = Partial<Record<"name" | "phone" | "email", string>>;
const initialState: FormState = { success: false, message: "" };

// Opciones para nombrar y editar los criterios dentro del diálogo.
export type AlertOptions = {
  types: { id: number; name: string }[];
  amenities?: { id: number; name: string }[];
  locations: LocationSuggestion[];
};

type FormT = ReturnType<typeof useTranslations<"searchAlert.form">>;

function validate(data: FormData, t: FormT): Errors {
  const v = (k: string) => String(data.get(k) ?? "").trim();
  const errors: Errors = {};
  if (v("name").length < 3) errors.name = t("errors.name");
  if (v("phone").replace(/\D/g, "").length < 8) errors.phone = t("errors.phone");
  const email = v("email");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = t("errors.email");
  return errors;
}

// La búsqueda de la alerta: chips que se quitan con la cruz y, debajo, los
// filtros principales para sumar o cambiar criterios sin salir del diálogo.
// Arranca con la búsqueda de la página; los cambios no tocan el listado.
function CriteriaEditor({
  criteria,
  onChange,
  options,
}: {
  criteria: SearchCriteria;
  onChange: (next: SearchCriteria) => void;
  options: AlertOptions;
}) {
  const t = useTranslations("searchAlert.editor");
  const tChips = useTranslations("searchAlert.chips");
  const [editing, setEditing] = useState(false);
  const uid = useId();
  const chips = criteriaChips(criteria, options.types, options.amenities);
  const operations = [
    { value: "", label: t("operations.any") },
    { value: "venta", label: t("operations.buy") },
    { value: "alquiler", label: t("operations.rent") },
  ];
  // Los chips traen el texto en español (lo usa la nota del lead); acá se
  // arma el que ve el visitante. Tipo, zonas, amenities y búsqueda libre
  // son contenido de la base o del usuario y quedan tal cual.
  const chipLabel = (chip: CriteriaChip) => {
    if (chip.key === "tipo") return criteria.tipo === "venta" ? tChips("forSale") : tChips("forRent");
    if (chip.key === "bedrooms") return tChips("bedrooms", { count: criteria.bedrooms ?? "" });
    if (chip.key === "bathrooms") return tChips("bathrooms", { count: criteria.bathrooms ?? "" });
    return chip.label;
  };
  const set = (key: CriteriaKey, value: string) => {
    const next = { ...criteria };
    if (value) next[key] = value;
    else delete next[key];
    onChange(next);
  };

  return (
    <div className="rounded-2xl bg-muted p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{t("title")}</p>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          aria-expanded={editing}
          aria-controls={`${uid}-filters`}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm text-sm font-medium text-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {editing ? (
            t("done")
          ) : (
            <>
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              {chips.length ? t("edit") : t("add")}
            </>
          )}
        </button>
      </div>

      {chips.length > 0 ? (
        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <li
              key={`${chip.key}-${chip.item ?? ""}`}
              className="inline-flex items-center gap-1 rounded-full bg-card py-1 pr-1 pl-3 text-sm font-medium text-foreground"
            >
              {chipLabel(chip)}
              <button
                type="button"
                onClick={() => onChange(withoutChip(criteria, chip))}
                aria-label={t("remove", { label: chipLabel(chip) })}
                className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-fg-secondary hover:bg-main hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-fg-secondary">
          {t("empty")}
        </p>
      )}

      {editing && (
        <div id={`${uid}-filters`} className="mt-4 flex flex-col gap-5 border-t border-border pt-4">
          <SegmentedControl
            label={t("operationLabel")}
            options={operations}
            value={criteria.tipo ?? ""}
            onChange={(v) => set("tipo", v)}
          />

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">{t("zone")}</span>
            <div className="relative flex min-h-11 w-full items-center rounded-[22px] border border-border bg-card px-4 py-1 transition-colors focus-within:border-border-strong focus-within:ring-3 focus-within:ring-ring/15">
              <LocationCombobox
                locations={options.locations}
                value={{ locs: criteria.loc?.split(",").filter(Boolean) ?? [], q: criteria.q ?? "" }}
                onChange={(next) => {
                  const c = { ...criteria };
                  if (next.locs.length) c.loc = next.locs.join(",");
                  else delete c.loc;
                  if (next.q) c.q = next.q;
                  else delete c.q;
                  onChange(c);
                }}
                className="flex-1"
                inputClassName="text-sm"
              />
            </div>
          </div>

          {options.types.length > 0 && (
            <ChoiceGroup
              label={t("propertyType")}
              options={[{ label: t("allTypes"), value: "" }, ...options.types.map((t) => ({ label: t.name, value: String(t.id) }))]}
              value={criteria.typeId ?? ""}
              onChange={(v) => set("typeId", v)}
              layoutId={`${uid}-type`}
            />
          )}

          <ChoiceGroup
            label={t("bedrooms")}
            options={BEDROOM_OPTIONS.map((o) => (o.value === "" ? { ...o, label: t("allTypes") } : o))}
            value={criteria.bedrooms ?? ""}
            onChange={(v) => set("bedrooms", v)}
            layoutId={`${uid}-bedrooms`}
          />
        </div>
      )}
    </div>
  );
}

function AlertForm({ initialCriteria, options }: { initialCriteria: SearchCriteria; options: AlertOptions }) {
  const t = useTranslations("searchAlert.form");
  const [state, formAction, pending] = useActionState(createSearchAlertAction, initialState);
  const [errors, setErrors] = useState<Errors>({});
  const [criteria, setCriteria] = useState(initialCriteria);
  if (state.success) {
    return (
      <div role="status" className="flex flex-col items-start gap-4 py-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-pop text-foreground">
          <Check className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="font-display text-3xl leading-[1] font-medium tracking-[-0.035em] text-foreground">{t("successTitle")}</p>
        <p className="max-w-[40ch] text-base leading-relaxed text-fg-secondary">
          {t("successBody")}
        </p>
      </div>
    );
  }

  const described = (key: keyof Errors) => invalidProps(errors[key], `alert-${key}`);

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
      className="flex flex-col gap-5"
    >
      {Object.entries(criteria).map(([k, v]) => (
        <input key={k} type="hidden" name={`c_${k}`} value={v} />
      ))}

      <CriteriaEditor criteria={criteria} onChange={setCriteria} options={options} />

      <Field id="alert-name" label={t("name")} error={errors.name}>
        <input id="alert-name" name="name" autoComplete="name" className={inputClass} {...described("name")} />
      </Field>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field id="alert-phone" label={t("phone")} error={errors.phone}>
          <input id="alert-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" className={inputClass} {...described("phone")} />
        </Field>
        <Field id="alert-email" label={t("email")} hint={t("optional")} error={errors.email}>
          <input id="alert-email" name="email" type="email" autoComplete="email" className={inputClass} {...described("email")} />
        </Field>
      </div>

      {state.message && !state.success && (
        <p role="alert" className="rounded-xl bg-destructive/8 px-4 py-3 text-sm text-destructive">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-pop text-base font-semibold text-foreground transition-[background-color,transform] hover:bg-pop-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-wait disabled:opacity-80"
      >
        {pending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            {t("creating")}
          </>
        ) : (
          <>
            <BellRing className="h-4 w-4" aria-hidden="true" />
            {t("create")}
          </>
        )}
      </button>
    </form>
  );
}

// "Avisame cuando entre algo así": un diálogo con la búsqueda actual en
// chips y un formulario corto. El disparador lo pone quien lo usa
// (tarjeta en la grilla, estado vacío, página de zona). Los filtros se
// ajustan adentro sin salir. Al cerrar y volver a abrir, el formulario y
// la búsqueda arrancan de cero.
export function SearchAlertDialog({
  criteria,
  options,
  children,
}: {
  criteria: SearchCriteria;
  options: AlertOptions;
  children: React.ReactNode;
}) {
  const t = useTranslations("searchAlert.dialog");
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setSession((s) => s + 1);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-3xl border-0 bg-card p-6 sm:max-w-lg md:p-8">
        <DialogTitle className="pr-8 font-display text-3xl leading-[1] font-medium tracking-[-0.035em] text-foreground">
          {t("title")}
        </DialogTitle>
        <DialogDescription className="mt-3 mb-6 text-base leading-relaxed text-fg-secondary">
          {t("description")}
        </DialogDescription>
        <AlertForm key={session} initialCriteria={criteria} options={options} />
      </DialogContent>
    </Dialog>
  );
}
