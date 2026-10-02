// Optimiza una foto en el navegador antes de subirla a Storage: corrige la
// orientación (EXIF), la achica a un lado máximo de MAX_EDGE y la vuelve a
// codificar en WebP con calidad alta. Una foto de celular de 5–12 MB queda
// en ~400 KB–1,2 MB sin diferencia visible. El sitio la sirve después con
// next/image en AVIF o WebP y al tamaño de cada pantalla; esto es el
// "original" del que parte.
//
// Los navegadores no codifican AVIF desde canvas, por eso el original es
// WebP. Si algo falla (HEIC en Chrome, navegador sin WebP), se sube el
// archivo tal cual: nunca se pierde una foto por optimizarla.

// Suficiente para la galería a pantalla completa en monitores grandes.
const MAX_EDGE = 2560;
// 0.85 en WebP es visualmente idéntico al original en fotos.
const WEBP_QUALITY = 0.85;
const JPEG_QUALITY = 0.88;
// Formatos que no conviene tocar (animados o vectoriales).
const SKIP = new Set(["image/gif", "image/svg+xml"]);

export type OptimizedImage = { file: File; optimized: boolean };

function canvas(w: number, h: number) {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function encode(c: OffscreenCanvas | HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  if ("convertToBlob" in c) return c.convertToBlob({ type, quality }).catch(() => null);
  return new Promise((resolve) => c.toBlob(resolve, type, quality));
}

// Achica a la mitad en pasos hasta llegar al tamaño final: un solo
// drawImage de 4000px a 1000px pierde detalle y genera serrucho.
function downscale(source: ImageBitmap, width: number, height: number) {
  let current: CanvasImageSource = source;
  let w = source.width;
  let h = source.height;
  while (w / 2 >= width && h / 2 >= height) {
    w = Math.round(w / 2);
    h = Math.round(h / 2);
    current = draw(current, w, h);
  }
  return draw(current, width, height);
}

function draw(source: CanvasImageSource, w: number, h: number) {
  const c = canvas(w, h);
  const ctx = c.getContext("2d") as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, w, h);
  return c;
}

export async function optimizeImage(file: File): Promise<OptimizedImage> {
  if (!file.type.startsWith("image/") || SKIP.has(file.type)) return { file, optimized: false };

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return { file, optimized: false };
  }

  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const out = downscale(bitmap, width, height);

    // Safari viejo no codifica WebP y devuelve PNG: ahí va JPEG.
    let blob = await encode(out, "image/webp", WEBP_QUALITY);
    if (blob?.type !== "image/webp") blob = await encode(out, "image/jpeg", JPEG_QUALITY);
    if (!blob || (blob.type !== "image/webp" && blob.type !== "image/jpeg")) return { file, optimized: false };

    // Si no hubo que achicarla y el original ya pesa menos, queda el original.
    if (scale === 1 && blob.size >= file.size) return { file, optimized: false };

    const ext = blob.type === "image/webp" ? "webp" : "jpg";
    const base = file.name.replace(/\.[^.]+$/, "") || "foto";
    return { file: new File([blob], `${base}.${ext}`, { type: blob.type }), optimized: true };
  } catch {
    return { file, optimized: false };
  } finally {
    bitmap.close();
  }
}
