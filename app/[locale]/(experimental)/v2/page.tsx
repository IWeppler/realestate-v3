import type { Metadata } from "next";
import { architectureDisplay, architectureBody } from "@/features/experimental-v2/fonts";
import { ArchitectureLanding } from "@/features/experimental-v2/ArchitectureLanding";
import { initLocale } from "@/i18n/server";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Casa Verde | Concepto de arquitectura",
  description: "Una exploración de arquitectura, naturaleza y profundidad en una landing inmobiliaria.",
  robots: { index: false, follow: false },
};

export default async function ExperimentalPage({ params }: { params: Promise<{ locale: string }> }) {
  initLocale((await params).locale);
  return (
    <div className={architectureBody.className} style={{ "--architecture-display": architectureDisplay.style.fontFamily } as React.CSSProperties}>
      <ArchitectureLanding brand={BRAND.name} />
    </div>
  );
}
