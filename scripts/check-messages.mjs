// Compara las claves de cada idioma contra el español (fuente de verdad).
// Uso: node scripts/check-messages.mjs  →  sale con código 1 si falta o
// sobra alguna clave, o si un texto quedó vacío.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..", "messages");
const BASE = "es-AR";

const flatten = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" ? flatten(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]],
  );

const read = (locale, file) => Object.fromEntries(flatten(JSON.parse(fs.readFileSync(path.join(ROOT, locale, file), "utf8"))));

let problems = 0;
const files = fs.readdirSync(path.join(ROOT, BASE)).filter((f) => f.endsWith(".json"));
for (const locale of fs.readdirSync(ROOT).filter((l) => l !== BASE)) {
  for (const file of files) {
    const base = read(BASE, file);
    let other = {};
    try {
      other = read(locale, file);
    } catch {
      console.log(`${locale}/${file}: no existe`);
      problems++;
      continue;
    }
    const report = (msg) => {
      console.log(`${locale}/${file}: ${msg}`);
      problems++;
    };
    for (const key of Object.keys(base)) {
      if (!(key in other)) report(`falta ${key}`);
      else if (String(other[key]).trim() === "") report(`vacío ${key}`);
    }
    for (const key of Object.keys(other)) if (!(key in base)) report(`sobra ${key}`);
  }
}
console.log(problems ? `${problems} problema(s)` : "Mensajes OK");
process.exit(problems ? 1 : 0);
