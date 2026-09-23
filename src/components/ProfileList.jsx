import { flattenProfileToSessions, weeklyHours } from "../lib/profile.js";
import { DAY_LABELS } from "../lib/time.js";

export default function ProfileList({ profiles, onViewInCompare, onEdit }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {profiles.map((p) => {
        const sessions = flattenProfileToSessions(p);
        const hours = weeklyHours(sessions);
        return (
          <article key={p.id} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} />
                <div>
                  <h3 className="font-semibold text-slate-800">{p.displayName}</h3>
                  <p className="text-xs text-slate-500">
                    {p.materias.length} materias · {hours.toFixed(1)}h/semana · id: {p.id}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => onEdit(p.id)}
                  className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onViewInCompare(p.id)}
                  className="text-sm px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-700"
                >
                  Ver en comparador
                </button>
              </div>
            </div>
            <ul className="space-y-2">
              {p.materias.map((m) => (
                <li key={`${p.id}-${m.code ?? m.name}`} className="text-sm">
                  <div className="font-medium text-slate-800">
                    {m.name}
                    {m.code ? <span className="text-slate-400"> ({m.code}{m.group != null ? `-${m.group}` : ""})</span> : null}
                  </div>
                  <div className="text-xs text-slate-500">
                    {(m.schedules ?? [])
                      .map((s) => `${DAY_LABELS[s.day]} ${s.start}–${s.end}${s.room ? ` · ${s.room}` : ""}`)
                      .join(" · ")}
                  </div>
                </li>
              ))}
            </ul>
          </article>
        );
      })}
    </div>
  );
}
