import { BellRing } from "lucide-react";
import { useTranslations } from "next-intl";
import { SearchAlertDialog, type AlertOptions } from "@/features/public/v2/SearchAlert";
import type { SearchCriteria } from "@/features/public/searchCriteria";

// "Avisame cuando entre algo así" dentro de la grilla: guarda la búsqueda
// actual como alerta (llega al panel como lead con los criterios).
export function AlertTile({ criteria, options }: { criteria: SearchCriteria; options: AlertOptions }) {
  const t = useTranslations("searchAlert.tile");
  return (
    <li className="flex">
      <div className="flex min-h-72 w-full flex-col justify-between gap-8 rounded-[8px] bg-pop p-6 text-foreground">
        <BellRing className="h-7 w-7" strokeWidth={1.75} aria-hidden="true" />
        <div>
          <p className="font-display text-3xl leading-[1] font-medium tracking-[-0.03em]">{t("title")}</p>
          <p className="mt-3 max-w-[32ch] text-[15px] leading-relaxed">
            {t("body")}
          </p>
          <SearchAlertDialog criteria={criteria} options={options}>
            <button
              type="button"
              className="mt-6 inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-main px-5 text-sm font-semibold text-primary-foreground transition-[background-color,transform] hover:bg-main-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-pop active:scale-[0.98]"
            >
              {t("cta")}
            </button>
          </SearchAlertDialog>
        </div>
      </div>
    </li>
  );
}
