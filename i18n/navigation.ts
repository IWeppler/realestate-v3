import { createNavigation } from "next-intl/navigation";
import { routing } from "@/i18n/routing";

// Navegación que respeta el idioma actual: en el sitio público se usan
// estos en lugar de next/link y next/navigation. `Link href="/propiedades"`
// lleva a /pt/propiedades si se está en portugués; usePathname devuelve la
// ruta sin el prefijo.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
