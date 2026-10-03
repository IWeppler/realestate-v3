"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { DemandItem } from "@/features/dashboard/reports/getReportInsights";
import { SortHead, useSortable } from "@/features/dashboard/reports/useSortable";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/shared/components/ui/table";

type Key = "title" | "inquiries" | "visits" | "negotiations" | "ageDays";

const ACCESSORS = {
  title: (row: DemandItem) => row.title,
  inquiries: (row: DemandItem) => row.inquiries,
  visits: (row: DemandItem) => row.visits,
  negotiations: (row: DemandItem) => row.negotiations,
  ageDays: (row: DemandItem) => row.ageDays,
} satisfies Record<Key, (row: DemandItem) => number | string>;

export function DemandTable({ rows, silent = false }: { rows: DemandItem[]; silent?: boolean }) {
  const { sorted, sort, toggle } = useSortable<DemandItem, Key>(
    rows,
    ACCESSORS,
    silent ? { key: "ageDays", dir: "desc" } : { key: "inquiries", dir: "desc" },
  );
  if (!rows.length)
    return (
      <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
        {silent
          ? "Todas las propiedades disponibles recibieron consultas en los últimos 30 días."
          : "Todavía no hay propiedades con consultas en este período."}
      </p>
    );
  return (
    <div className="max-h-[290px] overflow-auto">
      <Table className={`table-fixed ${silent ? "min-w-[320px]" : "min-w-[560px]"}`}>
        <TableHeader>
          <TableRow>
            <SortHead label="Propiedad" sortKey="title" sort={sort} onToggle={toggle} className={silent ? "w-[70%]" : "w-[36%]"} />
            {!silent && (
              <>
                <SortHead label="Consultas" sortKey="inquiries" sort={sort} onToggle={toggle} align="right" />
                <SortHead label="Visitas" sortKey="visits" sort={sort} onToggle={toggle} align="right" />
                <SortHead label="Negociación" sortKey="negotiations" sort={sort} onToggle={toggle} align="right" />
              </>
            )}
            <SortHead label="Días" sortKey="ageDays" sort={sort} onToggle={toggle} align="right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="py-2">
                <Link
                  href={`/dashboard/propiedades/${row.id}`}
                  title={row.title}
                  className="flex max-w-[190px] items-center gap-1 font-medium hover:text-primary hover:underline"
                >
                  <span className="min-w-0 truncate">{row.title}</span>
                  <ArrowUpRight className="size-3.5 shrink-0" />
                </Link>
                {row.city && (
                  <span className="block max-w-[190px] truncate text-xs text-muted-foreground" title={row.city}>
                    {row.city}
                  </span>
                )}
              </TableCell>
              {!silent && (
                <>
                  <TableCell className="py-2 text-right tabular-nums">{row.inquiries}</TableCell>
                  <TableCell className="py-2 text-right tabular-nums">{row.visits}</TableCell>
                  <TableCell className="py-2 text-right tabular-nums">{row.negotiations}</TableCell>
                </>
              )}
              <TableCell className="py-2 text-right tabular-nums">{row.ageDays}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
