import { Clock, Users } from "lucide-react";
import { flattenFreeSlots, intersectFreeAcrossProfiles } from "../lib/availability.js";
import { findConflicts, gapsByDay } from "../lib/layout.js";
import { flattenProfileToSessions, weeklyHours } from "../lib/profile.js";
import { DAY_LABELS, fmtMin } from "../lib/time.js";
import WeekGrid from "./WeekGrid.jsx";

export default function CompareView({ profiles, selectedIds, onToggle, onSelectAll, onClear }) {
  const selected = profiles.filter((p) => selectedIds.includes(p.id));
  const allSelected = profiles.length > 0 && selected.length === profiles.length;
  const sessionLists = selected.map((p) => flattenProfileToSessions(p));
  const sessions = sessionLists.flat();
  const useProfileColor = selected.length > 1;
  const freeByDay = selected.length
    ? intersectFreeAcrossProfiles(sessionLists)
    : {};
  const freeSlots = flattenFreeSlots(freeByDay);
  const singleGaps = selected.length === 1 ? gapsByDay(sessions) : freeByDay;
  const conflicts = selected.length === 1 ? findConflicts(sessions) : [];
  const hours = weeklyHours(sessions);

  const freeLabel =
    selected.length === 0
      ? ""
      : allSelected
        ? `Libre para: todos (${selected.length})`
        : `Libre para: ${selected.map((p) => p.displayName).join(", ")}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onSelectAll}
          className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-300 bg-white hover:bg-slate-100"
        >
          Todos
        </button>
        <button
          type="button"
          onClick={onClear}
          className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-300 bg-white hover:bg-slate-100"
        >
          Limpiar
        </button>
        {profiles.map((p) => {
          const on = selectedIds.includes(p.id);
          return (
            <label
              key={p.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border cursor-pointer transition-colors ${
                on ? "text-white border-transparent" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
              }`}
              style={on ? { background: p.color, borderColor: p.color } : undefined}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={on}
                onChange={() => onToggle(p.id)}
              />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: on ? "white" : p.color }} />
              {p.displayName}
            </label>
          );
        })}
      </div>

      {selected.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
          Elige al menos una persona para ver el calendario.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-slate-200 text-sm">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-800">{selected.length}</span>
              <span className="text-slate-500">{selected.length === 1 ? "persona" : "personas"}</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-slate-200 text-sm">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-800">{hours.toFixed(1)}h</span>
              <span className="text-slate-500">de clase (suma)</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-slate-200 text-sm">
              <span className="font-semibold text-slate-800">{freeSlots.length}</span>
              <span className="text-slate-500">huecos libres</span>
            </div>
          </div>

          {conflicts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              <p className="font-semibold mb-1">Choque en el horario de {selected[0].displayName}</p>
              <ul className="text-xs space-y-0.5">
                {conflicts.map((c, i) => (
                  <li key={`${c.day}-${c.start}-${i}`}>
                    {DAY_LABELS[c.day]} {fmtMin(c.start)}–{fmtMin(c.end)}: {c.a} se solapa con {c.b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <p className="font-semibold text-emerald-800 text-sm mb-2">{freeLabel}</p>
            {freeSlots.length === 0 ? (
              <p className="text-sm text-emerald-700">No hay huecos de 20+ minutos en común.</p>
            ) : (
              <ul className="grid sm:grid-cols-2 gap-1 text-sm text-emerald-800">
                {freeSlots.map((s) => (
                  <li key={`${s.day}-${s.start}`}>
                    {DAY_LABELS[s.day]} {fmtMin(s.start)}–{fmtMin(s.end)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <WeekGrid
            sessions={sessions}
            freeByDay={singleGaps}
            showFreeGaps
            useProfileColor={useProfileColor}
          />
        </>
      )}
    </div>
  );
}
