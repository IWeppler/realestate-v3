import { brandIcon } from "@/features/public/brandIcon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Ícono para la pantalla de inicio de iOS: el mismo arco, más grande.
export default function AppleIcon() {
  return brandIcon(size.width);
}
