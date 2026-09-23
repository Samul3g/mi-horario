import { useState } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";
import suggestionsData from "../../data/materia-suggestions.json";
import { findConflicts } from "../lib/layout.js";
import {
  PROFILE_PALETTE,
  buildExportProfile,
  flattenProfileToSessions,
  profileToDraft,
  slugify,
  validateProfile,
} from "../lib/profile.js";
import { DAY_LABELS, DAY_ORDER, isValidClock, normalizeTime } from "../lib/time.js";
import WeekGrid from "./WeekGrid.jsx";

function emptyMateria() {
  return {
    key: crypto.randomUUID(),
    name: "",
    code: "",
    group: "",
    credits: "",
    teachersText: "",
    schedules: [emptyBlock()],
  };
}

function emptyBlock() {
  return { key: crypto.randomUUID(), day: "Lun", start: "07:30", end: "09:20", room: "" };
}

const TIME_OPTIONS = [
  "07:00", "07:30", "08:00", "08:20", "08:50", "09:00", "09:20", "09:30",
  "10:20", "10:30", "11:20", "12:00", "12:20", "13:00", "14:50", "15:00",
  "15:15", "16:00", "16:50", "17:00", "17:50", "18:50", "19:00", "20:50", "21:00",
];

export default function CreateSchedule({ existingIds, initialProfile = null }) {
  const isEdit = Boolean(initialProfile);
  const draft = initialProfile ? profileToDraft(initialProfile) : null;
  const [displayName, setDisplayName] = useState(draft?.displayName ?? "");
  const [idTouched, setIdTouched] = useState(isEdit);
  const [id, setId] = useState(draft?.id ?? "");
  const [color, setColor] = useState(draft?.color ?? PROFILE_PALETTE[0]);
  const [materias, setMaterias] = useState(draft?.materias ?? [emptyMateria()]);
  const [copied, setCopied] = useState(false);

  const suggestedId = slugify(displayName);
  const effectiveId = idTouched ? id : suggestedId;

  const exported = buildExportProfile({ displayName, id: effectiveId, color, materias });
  const takenIds = existingIds.filter((value) => value !== initialProfile?.id);
  const timeErrors = materias.flatMap((m, i) => {
    const label = m.name.trim() || `Materia ${i + 1}`;
    return m.schedules.flatMap((s, j) => {
      const msgs = [];
      if (!isValidClock(s.start) || !isValidClock(s.end)) {
        msgs.push(`${label}, bloque ${j + 1}: usa hora HH:MM (ej. 09:30, no 9:30).`);
      } else if (s.end <= s.start) {
        msgs.push(`${label}, bloque ${j + 1}: la hora de fin debe ser mayor que la de inicio.`);
      }
      return msgs;
    });
  });
  const errors = [...validateProfile(exported, takenIds), ...timeErrors];
  const uniqueErrors = [...new Set(errors)];
  const previewSessions = flattenProfileToSessions(exported);
  const conflicts = findConflicts(previewSessions);
  const jsonText = JSON.stringify(exported, null, 2);

  function updateMateria(key, patch) {
    setMaterias((prev) => prev.map((m) => (m.key === key ? { ...m, ...patch } : m)));
  }

  function applySuggestion(key, name) {
    const hit = suggestionsData.materias.find((m) => m.name === name);
    updateMateria(key, hit ? { name, code: hit.code ?? "" } : { name });
  }

  async function copyJson() {
    if (errors.length) return;
    await navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        {isEdit
          ? `Edita el horario de ${initialProfile.displayName}, copia el JSON y envíaselo a Samuel para que reemplace el objeto con id "${initialProfile.id}".`
          : "Crea tu horario, revisa el JSON y envíaselo a Samuel para que lo agregue al sitio."}
      </p>

      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <h3 className="font-semibold text-slate-800">1. Persona</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm text-slate-600">
            Nombre
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
              placeholder="Nombre Apellido"
            />
          </label>
          <label className="text-sm text-slate-600">
            Id (kebab-case)
            <input
              value={effectiveId}
              onChange={(e) => {
                setIdTouched(true);
                setId(e.target.value);
              }}
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono text-sm"
              placeholder="nombre-apellido"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-slate-600">Color</span>
          {PROFILE_PALETTE.map((hex) => (
            <button
              key={hex}
              type="button"
              onClick={() => setColor(hex)}
              className="w-7 h-7 rounded-full border-2"
              style={{ background: hex, borderColor: color === hex ? "#0f172a" : "transparent" }}
              aria-label={hex}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">2. Materias</h3>
          <button
            type="button"
            onClick={() => setMaterias((prev) => [...prev, emptyMateria()])}
            className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-700"
          >
            <Plus className="w-4 h-4" /> Nueva materia
          </button>
        </div>

        {materias.map((m, idx) => (
          <div key={m.key} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">Materia {idx + 1}</p>
              {materias.length > 1 && (
                <button
                  type="button"
                  onClick={() => setMaterias((prev) => prev.filter((x) => x.key !== m.key))}
                  className="text-slate-400 hover:text-red-600"
                  aria-label="Eliminar materia"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <label className="text-sm text-slate-600 sm:col-span-2">
                Nombre
                <input
                  list="materia-names"
                  value={m.name}
                  onChange={(e) => applySuggestion(m.key, e.target.value)}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  placeholder="Estructuras de datos"
                />
              </label>
              <label className="text-sm text-slate-600">
                Código
                <input
                  list="materia-codes"
                  value={m.code}
                  onChange={(e) => updateMateria(m.key, { code: e.target.value })}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  placeholder="IC2001"
                />
              </label>
              <label className="text-sm text-slate-600">
                Grupo
                <input
                  type="number"
                  min="1"
                  value={m.group}
                  onChange={(e) => updateMateria(m.key, { group: e.target.value })}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </label>
              <label className="text-sm text-slate-600">
                Créditos
                <input
                  type="number"
                  min="0"
                  value={m.credits}
                  onChange={(e) => updateMateria(m.key, { credits: e.target.value })}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </label>
              <label className="text-sm text-slate-600 sm:col-span-3">
                Profesor(es), separados por coma
                <input
                  value={m.teachersText}
                  onChange={(e) => updateMateria(m.key, { teachersText: e.target.value })}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </label>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Horarios · 24h HH:MM (07:30, 13:00)
              </p>
              {m.schedules.map((s) => (
                <div key={s.key} className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
                  <label className="text-xs text-slate-600">
                    Día
                    <select
                      value={s.day}
                      onChange={(e) =>
                        updateMateria(m.key, {
                          schedules: m.schedules.map((row) =>
                            row.key === s.key ? { ...row, day: e.target.value } : row,
                          ),
                        })
                      }
                      className="mt-1 w-full border border-slate-300 rounded-lg px-2 py-2 text-sm"
                    >
                      {DAY_ORDER.map((d) => (
                        <option key={d} value={d}>
                          {DAY_LABELS[d]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs text-slate-600">
                    Inicio
                    <input
                      list="time-options"
                      inputMode="numeric"
                      placeholder="07:30"
                      value={s.start}
                      onChange={(e) =>
                        updateMateria(m.key, {
                          schedules: m.schedules.map((row) =>
                            row.key === s.key ? { ...row, start: e.target.value } : row,
                          ),
                        })
                      }
                      onBlur={(e) =>
                        updateMateria(m.key, {
                          schedules: m.schedules.map((row) =>
                            row.key === s.key ? { ...row, start: normalizeTime(e.target.value) } : row,
                          ),
                        })
                      }
                      className={`mt-1 w-full border rounded-lg px-2 py-2 text-sm ${
                        isValidClock(s.start) ? "border-slate-300" : "border-red-400 bg-red-50"
                      }`}
                    />
                  </label>
                  <label className="text-xs text-slate-600">
                    Fin
                    <input
                      list="time-options"
                      inputMode="numeric"
                      placeholder="09:20"
                      value={s.end}
                      onChange={(e) =>
                        updateMateria(m.key, {
                          schedules: m.schedules.map((row) =>
                            row.key === s.key ? { ...row, end: e.target.value } : row,
                          ),
                        })
                      }
                      onBlur={(e) =>
                        updateMateria(m.key, {
                          schedules: m.schedules.map((row) =>
                            row.key === s.key ? { ...row, end: normalizeTime(e.target.value) } : row,
                          ),
                        })
                      }
                      className={`mt-1 w-full border rounded-lg px-2 py-2 text-sm ${
                        isValidClock(s.end) ? "border-slate-300" : "border-red-400 bg-red-50"
                      }`}
                    />
                  </label>
                  <label className="text-xs text-slate-600">
                    Aula
                    <input
                      value={s.room}
                      onChange={(e) =>
                        updateMateria(m.key, {
                          schedules: m.schedules.map((row) =>
                            row.key === s.key ? { ...row, room: e.target.value } : row,
                          ),
                        })
                      }
                      className="mt-1 w-full border border-slate-300 rounded-lg px-2 py-2 text-sm"
                    />
                  </label>
                  {m.schedules.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        updateMateria(m.key, { schedules: m.schedules.filter((row) => row.key !== s.key) })
                      }
                      className="text-slate-400 hover:text-red-600 justify-self-start mb-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => updateMateria(m.key, { schedules: [...m.schedules, emptyBlock()] })}
                className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Agregar horario
              </button>
            </div>
          </div>
        ))}
      </section>

      <datalist id="materia-names">
        {suggestionsData.materias.map((m) => (
          <option key={m.name} value={m.name} />
        ))}
      </datalist>
      <datalist id="materia-codes">
        {suggestionsData.materias.filter((m) => m.code).map((m) => (
          <option key={m.code} value={m.code} />
        ))}
      </datalist>
      <datalist id="time-options">
        {TIME_OPTIONS.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>

      <section className="space-y-3">
        <h3 className="font-semibold text-slate-800">3. Revisar y copiar</h3>
        {uniqueErrors.length > 0 && (
          <ul className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 space-y-1">
            {uniqueErrors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
        {conflicts.length > 0 && (
          <p className="text-sm text-red-700">Hay choques en este horario. Revísalos antes de enviarlo.</p>
        )}
        {previewSessions.length > 0 && (
          <WeekGrid sessions={previewSessions} useProfileColor={false} />
        )}
        <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs overflow-x-auto max-h-80">
          {jsonText}
        </pre>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={uniqueErrors.length > 0}
            onClick={copyJson}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-40 hover:bg-slate-700"
          >
            <Copy className="w-4 h-4" />
            {copied ? "Copiado" : "Copiar JSON"}
          </button>
          <p className="text-sm text-slate-500">
            {isEdit
              ? "Reemplaza el perfil con el mismo id en data/profiles.json."
              : "Envía este JSON a Samuel para que lo agregue a data/profiles.json."}
          </p>
        </div>
      </section>
    </div>
  );
}
