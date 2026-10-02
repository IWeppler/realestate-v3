import "server-only";
import sharp from "sharp";

// Las piezas de imagen (next/og) solo aceptan PNG, JPEG, GIF y SVG, y las
// fotos nuevas se guardan en WebP. Esto baja la foto, la achica al ancho de
// la pieza y la pasa a JPEG como data URL. Si falla, devuelve la URL tal
// cual (una foto JPEG vieja se sigue viendo; una WebP queda sin foto en vez
// de romper la imagen entera).
export async function renderableImage(url: string | null, width: number): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const jpeg = await sharp(Buffer.from(await res.arrayBuffer()))
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch (e) {
    console.error("No se pudo preparar la foto para la pieza:", url, e);
    return /\.(webp|avif)(\?|$)/i.test(url) ? null : url;
  }
}
