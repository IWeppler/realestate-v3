import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReportInsights } from "@/features/dashboard/reports/getReportInsights";
import { DemandTable } from "@/features/dashboard/reports/DemandTable";
import { ExportCsvButton } from "@/features/dashboard/reports/ExportCsvButton";
import { InventoryAgeReport } from "@/features/dashboard/reports/InventoryAgeReport";
import { PeriodNav } from "@/features/dashboard/reports/PeriodNav";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

type Delta = {
  text: string;
  // good: la variación es favorable; null = sin cambio apreciable.
  good: boolean | null;
  up: boolean;
};

// Variación relativa. `lowerIsBetter` invierte lo favorable (ej. tiempos).
function relativeDelta(
  current: number | null,
  previous: number | null | undefined,
  lowerIsBetter = false,
): Delta | null {
  if (current === null || previous === null || previous === undefined) return null;
  if (previous === 0) return null;
  const change = (current - previous) / previous;
  if (Math.abs(change) < 0.005) return { text: "0 %", good: null, up: true };
  const up = change > 0;
  return {
    text: `${up ? "+" : "−"}${Math.abs(change * 100).toLocaleString("es-AR", { maximumFractionDigits: 0 })} %`,
    good: lowerIsBetter ? !up : up,
    up,
  };
}

// Variación en puntos porcentuales, para métricas que ya son un porcentaje.
function pointsDelta(current: number | null, previous: number | null): Delta | null {
  if (current === null || previous === null) return null;
  const change = (current - previous) * 100;
  if (Math.abs(change) < 0.05) return { text: "0 pp", good: null, up: true };
  const up = change > 0;
  return {
    text: `${up ? "+" : "−"}${Math.abs(change).toLocaleString("es-AR", { maximumFractionDigits: 1 })} pp`,
    good: up,
    up,
  };
}

function DeltaBadge({ delta, versus }: { delta: Delta; versus: string }) {
  const tone =
    delta.good === null
      ? "text-muted-foreground"
      : delta.good
        ? "text-success"
        : "text-danger";
  const Icon = delta.up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 font-medium tabular-nums ${tone}`}
      title={versus}
    >
      {delta.good !== null && <Icon className="size-3.5" aria-hidden />}
      {delta.text}
      <span className="sr-only"> {versus}</span>
    </span>
  );
}

function Metric({
  label,
  value,
  detail,
  delta,
  versus,
}: {
  label: string;
  value: string;
  detail: string;
  delta?: Delta | null;
  versus?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl font-semibold tabular-nums tracking-tight">
          {value}
        </p>
        {delta && versus && (
          <span className="text-xs">
            <DeltaBadge delta={delta} versus={versus} />
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function formatDuration(minutes: number | null) {
  if (minutes === null) return "—";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  if (minutes < 1440)
    return `${(minutes / 60).toLocaleString("es-AR", { maximumFractionDigits: 1 })} h`;
  return `${(minutes / 1440).toLocaleString("es-AR", { maximumFractionDigits: 1 })} días`;
}

function Funnel({ insights }: { insights: ReportInsights }) {
  const max = Math.max(1, insights.funnel[0]?.count ?? 0);
  // Etapa con la mayor caída respecto de la anterior (si hay alguna real).
  let worstIndex = -1;
  insights.funnel.forEach((stage, index) => {
    const drop = stage.dropPercent ?? 0;
    if (drop > 0 && drop > (insights.funnel[worstIndex]?.dropPercent ?? 0)) {
      worstIndex = index;
    }
  });
  const worst = worstIndex > 0 ? insights.funnel[worstIndex] : null;
  return (
    <div className="space-y-3">
      {insights.funnel.map((stage) => (
        <div
          key={stage.key}
          className="grid grid-cols-[112px_1fr_88px] items-center gap-2 text-xs sm:grid-cols-[135px_1fr_100px] sm:text-sm"
        >
          <span>{stage.label}</span>
          <div className="h-5 overflow-hidden rounded-sm bg-muted">
            <div
              className={`h-full rounded-sm ${worst?.key === stage.key ? "bg-pop" : "bg-primary"}`}
              style={{
                width: `${stage.count ? Math.max(3, (stage.count / max) * 100) : 0}%`,
              }}
            />
          </div>
          <span className="text-right tabular-nums">
            {stage.count.toLocaleString("es-AR")}
            {stage.dropPercent !== null && (
              <span
                className={`ml-1 text-xs ${worst?.key === stage.key ? "font-semibold text-pop" : "text-muted-foreground"}`}
              >
                −{Math.round(stage.dropPercent * 100)}%
              </span>
            )}
          </span>
        </div>
      ))}
      {worst && (
        <p className="pt-1 text-xs text-muted-foreground">
          <span className="font-medium text-pop">Mayor caída:</span> entre{" "}
          {insights.funnel[worstIndex - 1].label} y {worst.label} (
          {Math.round((worst.dropPercent ?? 0) * 100)} %).
        </p>
      )}
    </div>
  );
}

function Sources({ sources }: { sources: ReportInsights["sources"] }) {
  if (!sources.length)
    return (
      <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
        Todavía no hay leads en este período.
      </p>
    );
  const max = Math.max(1, ...sources.map((source) => source.leads));
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Canal</TableHead>
            <TableHead className="text-right">Leads</TableHead>
            <TableHead className="text-right">Cerrados</TableHead>
            <TableHead className="text-right">Conversión</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sources.map((source) => (
            <TableRow key={source.key}>
              <TableCell className="min-w-[150px] font-medium">
                {source.label}
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(source.leads / max) * 100}%` }}
                  />
                </div>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {source.leads}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {source.closed}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {source.leads
                  ? `${(source.conversion * 100).toLocaleString("es-AR", { maximumFractionDigits: 1 })} %`
                  : "—"}
                {source.leads < 10 && (
                  <span className="block text-[11px] text-muted-foreground">
                    Muestra chica
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ReportsView({
  insights,
  isAdmin,
}: {
  insights: ReportInsights;
  isAdmin: boolean;
}) {
  const { firstContact, scope, previous } = insights;
  const selected =
    insights.periodDays === null ? "todo" : String(insights.periodDays);
  const versus = `vs. ${insights.periodDays} días previos`;
  const conversion = scope.leads ? scope.closed / scope.leads : null;
  const previousConversion = previous?.leads
    ? previous.closed / previous.leads
    : null;
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Actividad comercial
          </h2>
          <p className="text-xs text-muted-foreground">
            {previous
              ? `Variación ${versus}.`
              : "Sin comparación en el período histórico."}
          </p>
        </div>
        <PeriodNav selected={selected} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Leads captados"
          value={scope.leads.toLocaleString("es-AR")}
          detail="Cohorte del período seleccionado"
          delta={relativeDelta(scope.leads, previous?.leads)}
          versus={versus}
        />
        <Metric
          label="Cerrados actualmente"
          value={scope.closed.toLocaleString("es-AR")}
          detail="De los leads captados en el período"
          delta={relativeDelta(scope.closed, previous?.closed)}
          versus={versus}
        />
        <Metric
          label="Conversión a cierre"
          value={
            scope.leads
              ? `${((scope.closed / scope.leads) * 100).toLocaleString("es-AR", { maximumFractionDigits: 1 })} %`
              : "—"
          }
          detail={`${scope.discarded} descartados incluidos en la base`}
          delta={pointsDelta(conversion, previousConversion)}
          versus={versus}
        />
        <Metric
          label="Tiempo hasta Contactado"
          value={formatDuration(firstContact.medianMinutes)}
          detail={`${firstContact.measured}/${firstContact.total} medidos · ${firstContact.withoutRecordedContact} sin registro`}
          delta={relativeDelta(
            firstContact.medianMinutes,
            previous?.medianMinutes,
            true,
          )}
          versus={versus}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section
          title="Origen de leads"
          subtitle="Cierres actuales / leads captados en el período."
          action={
            <ExportCsvButton
              filename="origen-de-leads.csv"
              header={["Canal", "Leads", "Cerrados", "Conversión (%)"]}
              rows={insights.sources.map((source) => [
                source.label,
                source.leads,
                source.closed,
                Number((source.conversion * 100).toFixed(1)),
              ])}
            />
          }
        >
          <Sources sources={insights.sources} />
        </Section>
        <Section
          title="Embudo registrado"
          subtitle="Progreso de la misma cohorte por etapas confirmadas en el historial."
        >
          <Funnel insights={insights} />
        </Section>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Cartera y demanda
          </h2>
          <p className="text-xs text-muted-foreground">
            La antigüedad de la cartera actual se muestra independientemente del
            período de leads elegido arriba.
          </p>
        </div>
        <InventoryAgeReport items={insights.inventory} asOf={insights.asOf} />
        <div className="grid items-start gap-6 xl:grid-cols-2">
          <Section
            title={
              isAdmin
                ? "Propiedades con más consultas"
                : "Propiedades con más consultas asignadas"
            }
            subtitle="Leads captados en el período seleccionado."
          >
            <DemandTable rows={insights.ranking} />
          </Section>
          <Section
            title={
              isAdmin
                ? "Sin consultas en 30 días"
                : "Sin consultas asignadas en 30 días"
            }
            subtitle={`Propiedades disponibles dadas de alta hace al menos 30 días.`}
          >
            <DemandTable rows={insights.silent} silent />
          </Section>
        </div>
      </div>
    </div>
  );
}
