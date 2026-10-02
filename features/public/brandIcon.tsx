import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

// Ícono de la marca (favicon y apple-icon): el arco del logo en el color
// de acento sobre un cuadrado redondeado con el color principal. Sale de
// BRAND, así cada inmobiliaria tiene el suyo configurando el env.
export function brandIcon(px: number) {
  const archW = Math.round(px * 0.42);
  const archH = Math.round(px * 0.58);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: Math.round(px * 0.2),
          backgroundColor: BRAND.color,
          borderRadius: Math.round(px * 0.22),
        }}
      >
        <div
          style={{
            width: archW,
            height: archH,
            backgroundColor: BRAND.accent,
            borderTopLeftRadius: archW / 2,
            borderTopRightRadius: archW / 2,
          }}
        />
      </div>
    ),
    { width: px, height: px },
  );
}
