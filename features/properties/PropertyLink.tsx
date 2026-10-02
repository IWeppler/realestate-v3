"use client";

import { Link } from "@/i18n/navigation";
import { rememberCardPhoto } from "@/features/properties/photoTransition";

// Link a la ficha desde una tarjeta: antes de navegar guarda la foto que
// la tarjeta ya mostró (la versión exacta que bajó el navegador), para
// que el esqueleto de la ficha la tenga al instante.
export function PropertyLink({
  id,
  ...props
}: Omit<React.ComponentProps<typeof Link>, "href"> & { id: string }) {
  return (
    <Link
      {...props}
      href={`/propiedades/${id}`}
      // El fundido de página (globals.css) corre solo en esta navegación,
      // no cuando el esqueleto se reemplaza por la ficha.
      transitionTypes={["property-open"]}
      onClick={(e) => {
        const img = e.currentTarget.closest("article")?.querySelector("img");
        rememberCardPhoto(id, img?.complete ? img.currentSrc : null);
        props.onClick?.(e);
      }}
    />
  );
}
