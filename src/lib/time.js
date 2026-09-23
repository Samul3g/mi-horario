export const DAY_ORDER = ["Lun", "Mar", "Mie", "Jue", "Vie"];
export const DAY_LABELS = {
  Lun: "Lunes",
  Mar: "Martes",
  Mie: "Miércoles",
  Jue: "Jueves",
  Vie: "Viernes",
};
export const START_MIN = 7 * 60;
export const END_MIN = 22 * 60;
export const HOUR_PX = 56;
export const MIN_GAP = 20;
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidClock(t) {
  return TIME_RE.test(t);
}

export function toMin(t) {
  if (!t || !t.includes(":")) return NaN;
  const [h, m] = t.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return NaN;
  return h * 60 + m;
}

export function normalizeTime(t) {
  if (t == null) return "";
  const trimmed = String(t).trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{1,2})$/);
  if (!match) return trimmed;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (!Number.isInteger(h) || !Number.isInteger(m) || h > 23 || m > 59) return trimmed;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function fmtMin(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function yFor(min) {
  return (min - START_MIN) * (HOUR_PX / 60);
}

export function hourMarks() {
  const hours = [];
  for (let h = 7; h <= 22; h++) hours.push(h);
  return hours;
}

export function timelineHeight() {
  return (END_MIN - START_MIN) * (HOUR_PX / 60);
}
