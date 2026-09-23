import { useState } from "react";
import { CalendarDays, GraduationCap, Plus, Users } from "lucide-react";
import profilesData from "../data/profiles.json";
import CompareView from "./components/CompareView.jsx";
import CreateSchedule from "./components/CreateSchedule.jsx";
import ProfileList from "./components/ProfileList.jsx";

const TABS = [
  { id: "comparar", label: "Comparar", icon: CalendarDays },
  { id: "personas", label: "Personas", icon: Users },
  { id: "crear", label: "Crear horario", icon: Plus },
];

function App() {
  const profiles = profilesData.profiles;
  const [tab, setTab] = useState("comparar");
  const [selectedIds, setSelectedIds] = useState(profiles.map((p) => p.id));

  function toggle(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function viewInCompare(id) {
    setSelectedIds([id]);
    setTab("comparar");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <header className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-6 h-6 text-slate-700" />
            <h1 className="text-xl font-bold text-slate-800">Comparador de horarios · II Semestre 2026</h1>
          </div>
          <p className="text-sm text-slate-500">TEC, Sede Cartago · elige 1, 2, 3 o todos para ver cuándo están libres</p>
        </header>

        <nav className="flex flex-wrap gap-2 mb-5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${
                  active
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </nav>

        {tab === "comparar" && (
          <CompareView
            profiles={profiles}
            selectedIds={selectedIds}
            onToggle={toggle}
            onSelectAll={() => setSelectedIds(profiles.map((p) => p.id))}
            onClear={() => setSelectedIds([])}
          />
        )}
        {tab === "personas" && <ProfileList profiles={profiles} onViewInCompare={viewInCompare} />}
        {tab === "crear" && <CreateSchedule existingIds={profiles.map((p) => p.id)} />}
      </div>
    </div>
  );
}

export default App;
