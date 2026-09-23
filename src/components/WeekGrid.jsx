import { buildDayLayout } from "../lib/layout.js";
import { colorForSession } from "../lib/profile.js";
import {
  DAY_LABELS,
  DAY_ORDER,
  HOUR_PX,
  fmtMin,
  hourMarks,
  timelineHeight,
  yFor,
} from "../lib/time.js";

export default function WeekGrid({
  sessions,
  freeByDay = {},
  showFreeGaps = false,
  useProfileColor = false,
}) {
  const hours = hourMarks();
  const height = timelineHeight();

  const sessionsByDay = {};
  const layoutByDay = {};
  DAY_ORDER.forEach((d) => {
    sessionsByDay[d] = sessions.filter((s) => s.day === d);
    layoutByDay[d] = buildDayLayout(sessionsByDay[d]);
  });

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
      <div style={{ minWidth: "760px" }}>
        <div className="grid" style={{ gridTemplateColumns: "60px repeat(5, minmax(120px, 1fr))" }}>
          <div></div>
          {DAY_ORDER.map((d) => (
            <div
              key={d}
              className="text-center py-2 font-semibold text-slate-700 border-b border-slate-200 text-sm"
            >
              {DAY_LABELS[d]}
            </div>
          ))}
        </div>

        <div
          className="grid relative"
          style={{
            gridTemplateColumns: "60px repeat(5, minmax(120px, 1fr))",
            height: `${height}px`,
            backgroundImage: `repeating-linear-gradient(to bottom, #e2e8f0 0, #e2e8f0 1px, transparent 1px, transparent ${HOUR_PX}px)`,
          }}
        >
          <div className="relative">
            {hours.map((h) => (
              <div
                key={h}
                className="absolute text-xs text-slate-400"
                style={{ top: `${(h - 7) * HOUR_PX - 7}px`, right: "6px" }}
              >
                {`${String(h).padStart(2, "0")}:00`}
              </div>
            ))}
          </div>

          {DAY_ORDER.map((d) => (
            <div key={d} className="relative border-l border-slate-100">
              {showFreeGaps &&
                (freeByDay[d] ?? []).map((g, idx) => (
                  <div
                    key={`gap-${idx}`}
                    className="absolute rounded-md border border-dashed border-emerald-300 bg-emerald-50/70 flex items-center justify-center"
                    style={{
                      top: `${yFor(g.start)}px`,
                      height: `${yFor(g.end) - yFor(g.start)}px`,
                      left: "2px",
                      right: "2px",
                    }}
                  >
                    {g.end - g.start >= 40 && (
                      <span className="text-emerald-700 font-medium text-center px-1" style={{ fontSize: "10px" }}>
                        Libre · {fmtMin(g.start)}–{fmtMin(g.end)}
                      </span>
                    )}
                  </div>
                ))}

              {layoutByDay[d].map((s) => {
                const c = colorForSession(s, useProfileColor);
                const leftPct = (s.lane * 100) / s.totalCols;
                const widthPct = 100 / s.totalCols;
                const key = `${s.profileId}-${s.code}-${s.title}-${s.start}-${s.lane}`;
                return (
                  <div
                    key={key}
                    className="absolute rounded-lg px-2 py-1 overflow-hidden shadow-sm"
                    style={{
                      top: `${yFor(s.st)}px`,
                      height: `${yFor(s.en) - yFor(s.st)}px`,
                      left: `calc(${leftPct}% + 2px)`,
                      width: `calc(${widthPct}% - 4px)`,
                      background: c.bg,
                      borderLeft: `4px solid ${c.border}`,
                    }}
                  >
                    {useProfileColor && (
                      <div className="font-bold leading-tight" style={{ color: c.text, fontSize: "10px" }}>
                        {s.profileName}
                      </div>
                    )}
                    <div className="font-bold leading-tight" style={{ color: c.text, fontSize: "11px" }}>
                      {s.title}
                    </div>
                    {s.room && (
                      <div className="leading-tight mt-0.5" style={{ color: c.text, fontSize: "10px" }}>
                        {s.room}
                      </div>
                    )}
                    {s.teacher && !useProfileColor && (
                      <div className="leading-tight" style={{ color: c.text, fontSize: "10px" }}>
                        {s.teacher}
                      </div>
                    )}
                    <div className="leading-tight opacity-75" style={{ color: c.text, fontSize: "10px" }}>
                      {s.start}–{s.end}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
