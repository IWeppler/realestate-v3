// Transición tarjeta → ficha: la foto de la tarjeta se transforma en la
// foto principal de la ficha (React <ViewTransition> con el mismo nombre
// en los dos lados).
//
// La ficha es dinámica y muestra su esqueleto (loading.tsx) mientras
// carga, así que la foto destino no existe en el primer cuadro. Para que
// el morph tenga a dónde ir, al hacer click se guarda la foto que la
// tarjeta ya tiene descargada y el esqueleto la muestra en el lugar de la
// principal; cuando llega la ficha, pasa de esa a la definitiva.

export const photoTransitionName = (id: string) => `property-photo-${id}`;

let lastClicked: { id: string; src: string } | null = null;

export function rememberCardPhoto(id: string, src: string | null | undefined) {
  lastClicked = src ? { id, src } : null;
}

export function cardPhotoFor(id: string) {
  return lastClicked?.id === id ? lastClicked.src : null;
}
