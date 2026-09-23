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

export function toMin(t) {
  if (!t || !t.includes(":")) return NaN;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
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
