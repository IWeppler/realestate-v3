export type Fact = {
  icon: React.ElementType;
  label: string;
  value: number | string;
  unit?: string;
};

// Datos principales de la ficha ("La propiedad de un vistazo"): una
// tarjeta por dato, con el ícono arriba, la cifra grande en la tipografía
// de títulos y la etiqueta abajo.
// Columnas según la cantidad de datos, para que la grilla quede completa
// (sin una tarjeta vacía al final). En móvil van de a dos; si sobra una,
// ocupa el ancho entero.
const COLUMNS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-3",
};

export function KeyFacts({ facts }: { facts: Fact[] }) {
  if (facts.length === 0) return null;
  const oddOnMobile = facts.length % 2 === 1;

  return (
    <dl className={`grid grid-cols-2 gap-3 ${COLUMNS[facts.length] ?? "sm:grid-cols-3"}`}>
      {facts.map((fact, i) => {
        const Icon = fact.icon;
        return (
          <div
            key={fact.label}
            className={`flex flex-col gap-6 rounded-2xl bg-card p-5 ${
              oddOnMobile && i === facts.length - 1 ? "col-span-2 sm:col-span-1" : ""
            }`}
          >
            <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} aria-hidden="true" />
            <div className="flex flex-col-reverse gap-1">
              <dt className="text-sm text-fg-secondary">{fact.label}</dt>
              <dd className="font-display text-3xl leading-none font-medium tracking-[-0.03em] text-foreground md:text-4xl">
                {typeof fact.value === "number" ? fact.value.toLocaleString("es-AR") : fact.value}
                {fact.unit && <span className="ml-1 font-sans text-base font-normal text-fg-secondary">{fact.unit}</span>}
              </dd>
            </div>
          </div>
        );
      })}
    </dl>
  );
}

// Dato secundario en píldora (tipo, precio por m², expensas, antigüedad).
export function FactChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null;
}) {
  if (!value) return null;
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border-strong px-4 py-2 text-sm">
      <Icon className="h-4 w-4 text-fg-secondary" aria-hidden="true" />
      <span className="text-fg-secondary">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
