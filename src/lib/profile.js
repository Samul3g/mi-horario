import { DAY_ORDER, isValidClock, normalizeTime, toMin } from "./time.js";

export const COURSE_COLORS = {
  IC2001: { bg: "#dbeafe", border: "#2563eb", text: "#1e3a8a" },
  MA1102: { bg: "#fef3c7", border: "#d97706", text: "#78350f" },
  IC3101: { bg: "#ede9fe", border: "#7c3aed", text: "#4c1d95" },
  IC2101: { bg: "#fce7f3", border: "#db2777", text: "#831843" },
  CI1107: { bg: "#ccfbf1", border: "#0d9488", text: "#134e4a" },
  IC1400: { bg: "#e0f2fe", border: "#0284c7", text: "#0c4a6e" },
  SE1205: { bg: "#dcfce7", border: "#16a34a", text: "#14532d" },
};

const DEFAULT_COLOR = { bg: "#f1f5f9", border: "#64748b", text: "#1e293b" };

export const PROFILE_PALETTE = [
  "#2563eb",
  "#db2777",
  "#16a34a",
  "#7c3aed",
  "#d97706",
  "#0d9488",
  "#dc2626",
  "#0284c7",
];

export function slugify(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function flattenProfileToSessions(profile) {
  const sessions = [];
  (profile.materias ?? []).forEach((materia) => {
    (materia.schedules ?? []).forEach((sch) => {
      sessions.push({
        profileId: profile.id,
        profileName: profile.displayName,
        profileColor: profile.color,
        code: materia.code ?? "",
        title: materia.name,
        group: materia.group,
        teacher: (materia.teachers ?? []).filter(Boolean).join(", "),
        day: sch.day,
        start: sch.start,
        end: sch.end,
        room: sch.room ?? "",
      });
    });
  });
  return sessions;
}

export function colorForSession(session, useProfileColor) {
  if (useProfileColor && session.profileColor) {
    return tintFromHex(session.profileColor);
  }
  if (session.code && COURSE_COLORS[session.code]) {
    return COURSE_COLORS[session.code];
  }
  if (session.profileColor) {
    return tintFromHex(session.profileColor);
  }
  return DEFAULT_COLOR;
}

export function tintFromHex(hex) {
  const clean = (hex || "#64748b").replace("#", "");
  const n = parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const mix = (c) => Math.round(c + (255 - c) * 0.82);
  return {
    bg: `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`,
    border: `#${clean}`,
    text: `rgb(${Math.round(r * 0.35)}, ${Math.round(g * 0.35)}, ${Math.round(b * 0.35)})`,
  };
}

export function buildExportProfile(draft) {
  return {
    id: (draft.id || slugify(draft.displayName)).trim(),
    displayName: draft.displayName.trim(),
    color: draft.color,
    materias: (draft.materias ?? []).map((m) => {
      const materia = {
        name: m.name.trim(),
        teachers: (m.teachersText ?? "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        schedules: (m.schedules ?? []).map((s) => {
          const row = { day: s.day, start: normalizeTime(s.start), end: normalizeTime(s.end) };
          if (s.room?.trim()) row.room = s.room.trim();
          return row;
        }),
      };
      if (m.code?.trim()) materia.code = m.code.trim().toUpperCase();
      if (m.group !== "" && m.group != null && Number.isFinite(Number(m.group))) {
        materia.group = Number(m.group);
      }
      if (m.credits !== "" && m.credits != null && Number.isFinite(Number(m.credits))) {
        materia.credits = Number(m.credits);
      }
      return materia;
    }),
  };
}

export function profileToDraft(profile) {
  const materias = (profile.materias ?? []).map((m) => ({
    key: crypto.randomUUID(),
    name: m.name ?? "",
    code: m.code ?? "",
    group: m.group ?? "",
    credits: m.credits ?? "",
    teachersText: (m.teachers ?? []).join(", "),
    schedules: (m.schedules ?? []).length
      ? m.schedules.map((s) => ({
          key: crypto.randomUUID(),
          day: s.day,
          start: s.start,
          end: s.end,
          room: s.room ?? "",
        }))
      : [
          { key: crypto.randomUUID(), day: "Lun", start: "07:30", end: "09:20", room: "" },
        ],
  }));
  return {
    displayName: profile.displayName ?? "",
    id: profile.id ?? "",
    color: profile.color ?? PROFILE_PALETTE[0],
    materias: materias.length
      ? materias
      : [
          {
            key: crypto.randomUUID(),
            name: "",
            code: "",
            group: "",
            credits: "",
            teachersText: "",
            schedules: [{ key: crypto.randomUUID(), day: "Lun", start: "07:30", end: "09:20", room: "" }],
          },
        ],
  };
}

export function validateProfile(profile, existingIds = []) {
  const errors = [];
  if (!profile.displayName?.trim()) errors.push("Escribe el nombre de la persona.");
  if (!profile.id?.trim()) errors.push("El id no puede estar vacío.");
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(profile.id)) {
    errors.push("El id debe ser kebab-case (minúsculas, números y guiones).");
  } else if (existingIds.includes(profile.id)) {
    errors.push(`El id "${profile.id}" ya existe. Cámbialo antes de copiar.`);
  }
  if (!profile.materias?.length) errors.push("Agrega al menos una materia.");

  (profile.materias ?? []).forEach((m, i) => {
    const label = m.name?.trim() || `Materia ${i + 1}`;
    if (!m.name?.trim()) errors.push(`La materia ${i + 1} necesita un nombre.`);
    if (!m.schedules?.length) errors.push(`${label}: agrega al menos un horario.`);
    (m.schedules ?? []).forEach((s, j) => {
      if (!DAY_ORDER.includes(s.day)) errors.push(`${label}, bloque ${j + 1}: día inválido.`);
      if (!isValidClock(s.start) || !isValidClock(s.end)) {
        errors.push(`${label}, bloque ${j + 1}: usa hora HH:MM (ej. 09:30, no 9:30).`);
      } else if (toMin(s.end) <= toMin(s.start)) {
        errors.push(`${label}, bloque ${j + 1}: la hora de fin debe ser mayor que la de inicio.`);
      }
    });
  });

  return errors;
}

export function totalCredits(profile) {
  return (profile.materias ?? []).reduce((acc, m) => acc + (Number(m.credits) || 0), 0);
}

export function weeklyHours(sessions) {
  return sessions.reduce((acc, s) => {
    const dur = toMin(s.end) - toMin(s.start);
    return acc + (Number.isFinite(dur) && dur > 0 ? dur / 60 : 0);
  }, 0);
}
