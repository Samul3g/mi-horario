import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(root, "data/profiles.json"), "utf8"));
const DAYS = new Set(["Lun", "Mar", "Mie", "Jue", "Vie"]);
const timeRe = /^\d{2}:\d{2}$/;
const errors = [];

if (!Array.isArray(data.profiles) || data.profiles.length === 0) {
  errors.push("profiles debe ser un arreglo no vacío.");
}

const ids = new Set();
for (const profile of data.profiles ?? []) {
  if (!profile.id || !profile.displayName || !profile.color) {
    errors.push(`Perfil incompleto: ${JSON.stringify(profile.id)}`);
  }
  if (ids.has(profile.id)) errors.push(`Id duplicado: ${profile.id}`);
  ids.add(profile.id);
  if (!profile.materias?.length) errors.push(`${profile.id}: sin materias.`);
  for (const m of profile.materias ?? []) {
    if (!m.name) errors.push(`${profile.id}: materia sin nombre.`);
    if (!m.schedules?.length) errors.push(`${profile.id}: ${m.name ?? "?"} sin horarios.`);
    for (const s of m.schedules ?? []) {
      if (!DAYS.has(s.day)) errors.push(`${profile.id}: día inválido ${s.day}`);
      if (!timeRe.test(s.start) || !timeRe.test(s.end)) {
        errors.push(`${profile.id}: hora inválida ${s.start}-${s.end}`);
      }
    }
  }
}

if (errors.length) {
  console.error("Validación falló:\n- " + errors.join("\n- "));
  process.exit(1);
}
console.log(`OK · ${data.profiles.length} perfiles`);
