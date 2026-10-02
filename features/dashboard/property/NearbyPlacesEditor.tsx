"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  NEARBY_CATEGORIES,
  NEARBY_ICONS,
  NEARBY_LABELS_ES,
  type NearbyCategory,
} from "@/features/properties/nearby-categories";

export type NearbyDraft = {
  key: string;
  category: NearbyCategory;
  name: string;
  distance_m: number | null;
};

// Alta manual de lugares cercanos; el padre los guarda al enviar el formulario.
export function NearbyPlacesEditor({
  value,
  onChange,
}: {
  value: NearbyDraft[];
  onChange: (next: NearbyDraft[]) => void;
}) {
  const [category, setCategory] = useState<NearbyCategory>("park");
  const [name, setName] = useState("");
  const [meters, setMeters] = useState("");

  const add = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) return;
    const m = meters.trim() === "" ? null : Math.round(Number(meters));
    onChange([
      ...value,
      {
        key: crypto.randomUUID(),
        category,
        name: trimmed,
        distance_m: m !== null && Number.isFinite(m) && m >= 0 ? m : null,
      },
    ]);
    setName("");
    setMeters("");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as NearbyCategory)}
          aria-label="Categoría"
          className="h-9 rounded-md border border-border bg-background px-2 text-sm"
        >
          {NEARBY_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {NEARBY_LABELS_ES[c]}
            </option>
          ))}
        </select>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Nombre (ej. Plaza San Martín)"
          className="min-w-48 flex-1"
        />
        <Input
          type="number"
          min={0}
          value={meters}
          onChange={(e) => setMeters(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Metros"
          aria-label="Distancia en metros"
          className="w-28"
        />
        <Button type="button" variant="outline" onClick={add}>
          <Plus /> Agregar
        </Button>
      </div>

      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((p) => {
            const Icon = NEARBY_ICONS[p.category];
            return (
              <li
                key={p.key}
                className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs"
              >
                <Icon className="size-3" />
                {p.name}
                {p.distance_m !== null && (
                  <span className="text-muted-foreground">· {p.distance_m} m</span>
                )}
                <button
                  type="button"
                  aria-label={`Quitar ${p.name}`}
                  onClick={() => onChange(value.filter((x) => x.key !== p.key))}
                  className="text-muted-foreground hover:text-danger"
                >
                  <X className="size-3" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
