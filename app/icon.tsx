import { brandIcon } from "@/features/public/brandIcon";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Favicon: el arco de la marca (ver features/public/brandIcon.tsx).
export default function Icon() {
  return brandIcon(size.width);
}
