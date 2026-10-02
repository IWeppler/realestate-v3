"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { useHideOnScroll } from "@/hooks/use-hide-on-scroll";
import { BRAND, whatsappLink } from "@/lib/brand";
import { LocaleSwitcher } from "@/features/public/v2/LocaleSwitcher";
import { EASE } from "@/features/public/v2/motion";

// Links de la barra en desktop. "Contacto" queda solo en el menú móvil y
// el footer: en la barra esa intención ya la cubre el botón de WhatsApp.
// `key`: el texto en common.nav (messages/<idioma>/common.json).
const NAV_LINKS = [
  { href: "/propiedades", key: "properties" },
  { href: "/zonas", key: "zones" },
  { href: "/tasar", key: "appraise" },
  { href: "/nosotros", key: "about" },
] as const;

const MOBILE_LINKS = [...NAV_LINKS, { href: "/contacto", key: "contact" }] as const;

// Logo: arco naranja (un umbral, una puerta) + nombre. Escala con el
// tamaño de letra del contenedor (header y footer).
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-[0.35em] ${className}`}>
      <span
        aria-hidden="true"
        className="block h-[1.05em] w-[0.75em] shrink-0 rounded-t-full bg-pop"
      />
      <span>{BRAND.name}</span>
    </span>
  );
}

// Barra fija de 64px. Desktop: logo, links y un solo CTA (WhatsApp), todo
// en una línea. Móvil: logo + "Menú", que abre una capa a pantalla
// completa con los links en tipografía grande. Con "reducir movimiento"
// la capa solo hace un fundido.
export function SiteHeader() {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [hidden, setHidden] = useHideOnScroll();
  const reduce = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Cambio de ruta (ej. atrás del navegador): el menú se cierra.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Abierto: sin scroll de fondo, la página queda inerte (fuera del Tab y
  // de lectores), Escape cierra y el foco vuelve al botón al cerrar. Si
  // la ventana pasa a desktop, el menú se cierra (ahí no hay botón).
  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const background = [
      document.getElementById("contenido"),
      document.querySelector("footer"),
    ].filter((el): el is HTMLElement => Boolean(el));
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    background.forEach((el) => (el.inert = true));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onDesktop = (e: MediaQueryListEvent) => e.matches && setOpen(false);
    desktop.addEventListener("change", onDesktop);
    const focusTimer = window.setTimeout(
      () => firstLinkRef.current?.focus({ preventScroll: true }),
      reduce ? 0 : 450,
    );
    return () => {
      document.body.style.overflow = overflow;
      background.forEach((el) => (el.inert = false));
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onDesktop);
      window.clearTimeout(focusTimer);
      trigger?.focus({ preventScroll: true });
    };
  }, [open, reduce]);

  return (
    <>
      <a
        href="#contenido"
        className="sr-only z-[60] rounded-full bg-card px-4 py-2 text-sm font-semibold text-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t("header.skipToContent")}
      </a>

      <motion.header
        className={`fixed inset-x-0 top-0 z-50 h-16 transition-colors duration-500 ${
          open
            ? "bg-transparent text-background"
            : "bg-background/90 text-foreground backdrop-blur-md"
        }`}
        // Nombre propio en las transiciones de página: queda quieto y por
        // encima de la foto que viaja de la tarjeta a la ficha.
        style={{ viewTransitionName: "site-header" }}
        initial={false}
        animate={{ y: hidden && !open ? "-100%" : "0%" }}
        transition={reduce ? { duration: 0 } : { duration: 0.3, ease: EASE }}
        // Con teclado: si el foco entra al header, se muestra.
        onFocusCapture={() => setHidden(false)}
      >
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-6 px-4 md:px-8">
          <Link
            href="/"
            onClick={close}
            className="font-display text-xl leading-none font-semibold tracking-[-0.02em] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
          >
            <BrandMark />
          </Link>

          <nav aria-label={t("header.mainNav")} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className="relative rounded-full px-4 py-2 text-[15px] font-medium whitespace-nowrap text-fg-secondary transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[current=page]:text-foreground"
                    >
                      {t(`nav.${link.key}`)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <LocaleSwitcher className="hidden h-10 items-center rounded-full px-3 text-sm font-semibold text-fg-secondary transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:inline-flex" />
            <a
              href={whatsappLink(t("header.whatsappMessage"))}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 items-center gap-2 rounded-full bg-main px-5 text-sm font-semibold whitespace-nowrap text-primary-foreground transition-[background-color,transform] hover:bg-main-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98] lg:inline-flex"
            >
              <FaWhatsapp className="h-4 w-4" aria-hidden="true" />
              {t("contactCta")}
            </a>

            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? t("header.closeMenu") : t("header.openMenu")}
              className="group -mr-2 flex h-11 cursor-pointer items-center gap-3 rounded-full px-2 text-[15px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current lg:hidden"
            >
              {/* Etiqueta que cambia con el estado; el ancho fijo evita que el ícono salte. */}
              <span
                className="relative block h-5 w-14 overflow-hidden text-right"
                aria-hidden="true"
              >
                <span
                  className={`absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "-translate-y-full" : ""}`}
                >
                  {t("header.menu")}
                </span>
                <span
                  className={`absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "" : "translate-y-full"}`}
                >
                  {t("header.close")}
                </span>
              </span>
              {/* Dos líneas que se cruzan en una X al abrir. */}
              <span className="relative block h-3 w-7" aria-hidden="true">
                <span
                  className={`absolute left-0 h-0.5 w-full bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    open ? "top-1/2 rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 h-0.5 w-full bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    open ? "top-1/2 -rotate-45" : "bottom-0"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t("header.menu")}
            className="fixed inset-0 z-40 overflow-y-auto bg-foreground text-background"
            initial={
              reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)" }
            }
            animate={
              reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" }
            }
            exit={
              reduce
                ? { opacity: 0 }
                : {
                    clipPath: "inset(0% 0% 100% 0%)",
                    transition: { duration: 0.6, ease: EASE, delay: 0.1 },
                  }
            }
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-12 px-4 pt-24 pb-10 md:px-8">
              <nav
                aria-label={t("header.mobileNav")}
                className="flex flex-1 flex-col justify-center"
              >
                <motion.ul
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={{
                    show: {
                      transition: {
                        staggerChildren: 0.07,
                        delayChildren: reduce ? 0 : 0.3,
                      },
                    },
                    hidden: {
                      transition: {
                        staggerChildren: 0.03,
                        staggerDirection: -1,
                      },
                    },
                  }}
                >
                  {MOBILE_LINKS.map((link, i) => {
                    const active = pathname === link.href;
                    return (
                      <li
                        key={link.href}
                        className="border-t border-background/12 last:border-b"
                      >
                        <Link
                          ref={i === 0 ? firstLinkRef : undefined}
                          href={link.href}
                          onClick={close}
                          aria-current={active ? "page" : undefined}
                          className="group/item flex items-center justify-between gap-4 py-[clamp(0.75rem,2dvh,1.25rem)] focus-visible:outline-none"
                        >
                          {/* Máscara: el texto sube desde abajo al abrir. */}
                          <span className="-mb-[0.15em] block min-w-0 overflow-hidden pb-[0.15em]">
                            <motion.span
                              className="block font-display text-[clamp(2.25rem,min(11vw,8dvh),4rem)] leading-[1.05] font-medium tracking-[-0.03em] group-focus-visible/item:text-pop group-aria-[current=page]/item:text-pop"
                              variants={
                                reduce
                                  ? {
                                      hidden: { opacity: 0 },
                                      show: { opacity: 1 },
                                    }
                                  : { hidden: { y: "110%" }, show: { y: "0%" } }
                              }
                              transition={{ duration: 0.9, ease: EASE }}
                            >
                              {t(`nav.${link.key}`)}
                            </motion.span>
                          </span>
                          <ArrowUpRight
                            className="h-6 w-6 shrink-0 text-background/50"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    );
                  })}
                </motion.ul>
              </nav>

              <motion.div
                className="flex flex-col gap-6 text-sm text-background/70"
                initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.7,
                    ease: EASE,
                    delay: reduce ? 0 : 0.6,
                  },
                }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                <a
                  href={whatsappLink(t("header.whatsappMessage"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-pop px-7 text-base font-semibold whitespace-nowrap text-foreground transition-[background-color,transform] hover:bg-pop-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background active:scale-[0.98]"
                >
                  <FaWhatsapp className="h-5 w-5" aria-hidden="true" />
                  {t("contactCta")}
                </a>
                <LocaleSwitcher
                  onClick={close}
                  className="inline-flex h-11 w-fit items-center rounded-full border border-background/25 px-5 text-sm font-semibold text-background transition-colors hover:border-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background"
                />
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-background/60">{t("header.email")}</dt>
                    <dd className="mt-1">
                      <a
                        href={`mailto:${BRAND.email}`}
                        className="text-background underline-offset-4 hover:underline"
                      >
                        {BRAND.email}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-background/60">{t("header.phone")}</dt>
                    <dd className="mt-1 text-background">
                      {BRAND.phoneDisplay}
                    </dd>
                  </div>
                </dl>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
