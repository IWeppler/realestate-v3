"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ChoiceOption = { label: string; value: string };

// Opciones de una sola elección como píldoras (buscador del hero, filtros
// del listado). `aria-pressed` en cada botón; el grupo lleva el nombre del
// campo. Con `layoutId` el fondo activo se desliza entre opciones.
export function ChoiceGroup({
  label,
  options,
  value,
  onChange,
  layoutId,
}: {
  label: string;
  options: ChoiceOption[];
  value: string;
  onChange: (v: string) => void;
  layoutId?: string;
}) {
  const reduce = useReducedMotion();
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <span id={id} className="text-sm font-medium text-foreground">
        {label}
      </span>
      <div role="group" aria-labelledby={id} className="flex flex-wrap gap-1.5">
        {options.map((op) => {
          const active = value === op.value;
          return (
            <button
              key={op.value || "all"}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(op.value)}
              className={`relative cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                active
                  ? "border-main text-primary-foreground"
                  : "border-border-strong text-fg-secondary hover:border-foreground hover:text-foreground"
              }`}
            >
              {active && (
                <motion.span
                  layoutId={layoutId}
                  className="absolute -inset-px rounded-full bg-main"
                  transition={reduce || !layoutId ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{op.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Control segmentado a todo el ancho (Comprar / Alquilar): la decisión
// principal de cada buscador.
export function SegmentedControl({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: ChoiceOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div role="group" aria-label={label} className="grid auto-cols-fr grid-flow-col rounded-full bg-muted p-1">
      {options.map((op) => {
        const active = value === op.value;
        return (
          <button
            key={op.value || "all"}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(op.value)}
            className={`cursor-pointer rounded-full py-2.5 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              active ? "bg-card text-foreground shadow-sm" : "text-fg-secondary hover:text-foreground"
            }`}
          >
            {op.label}
          </button>
        );
      })}
    </div>
  );
}
