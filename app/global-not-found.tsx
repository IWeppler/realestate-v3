import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Página no encontrada" };

// Último recurso: una dirección que no coincide con ninguna ruta, ni
// siquiera con un idioma (en la práctica casi nunca: el proxy manda todo a
// /[locale] y ahí los 404 los muestra app/[locale]/(public)/not-found.tsx, con
// header, footer y traducciones). Sin idioma no hay chrome: es una página
// mínima que lleva al inicio.
export default function GlobalNotFound() {
  return (
    <html lang="es-AR">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background p-6 text-center text-foreground antialiased">
        <h1 className="text-2xl font-semibold">Página no encontrada</h1>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- fuera del router de idiomas */}
        <a href="/" className="underline underline-offset-4">
          Ir al inicio
        </a>
      </body>
    </html>
  );
}
