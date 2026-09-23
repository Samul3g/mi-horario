import { useState } from "react";
import { CalendarDays, CircleHelp, GraduationCap, Pencil, Plus, Users } from "lucide-react";
import profilesData from "../data/profiles.json";
import CompareView from "./components/CompareView.jsx";
import CreateSchedule from "./components/CreateSchedule.jsx";
import HelpGuide from "./components/HelpGuide.jsx";
import ProfileList from "./components/ProfileList.jsx";

const TABS = [
  { id: "inicio", label: "Cómo usar", icon: CircleHelp },
  { id: "crear", label: "Crear horario", icon: Plus },
  { id: "editar", label: "Editar horario", icon: Pencil },
  { id: "comparar", label: "Comparar", icon: CalendarDays },
  { id: "personas", label: "Personas", icon: Users },
];

function App() {
  const profiles = profilesData.profiles;
  const [tab, setTab] = useState("inicio");
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingId, setEditingId] = useState("");
  const editingProfile = profiles.find((p) => p.id === editingId) ?? null;

  function toggle(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function openTab(next) {
    if (next === "comparar") setSelectedIds([]);
    if (next === "editar") setEditingId("");
    setTab(next);
  }

  function viewInCompare(id) {
    setSelectedIds([id]);
    setTab("comparar");
  }

  function editProfile(id) {
    setEditingId(id);
    setTab("editar");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <header className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-6 h-6 text-slate-700" />
            <h1 className="text-xl font-bold text-slate-800">Comparador de horarios · II Semestre 2026</h1>
          </div>
          <p className="text-sm text-slate-500">
            TEC, Sede Cartago · crea o edita tu horario y envía el JSON a Samuel
          </p>
        </header>

        <nav className="flex flex-wrap gap-2 mb-5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => openTab(t.id)}
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

        {tab === "inicio" && (
          <HelpGuide onGoCreate={() => setTab("crear")} onGoEdit={() => openTab("editar")} />
        )}
        {tab === "comparar" && (
          <CompareView
            profiles={profiles}
            selectedIds={selectedIds}
            onToggle={toggle}
            onSelectAll={() => setSelectedIds(profiles.map((p) => p.id))}
            onClear={() => setSelectedIds([])}
          />
        )}
        {tab === "personas" && (
          <ProfileList profiles={profiles} onViewInCompare={viewInCompare} onEdit={editProfile} />
        )}
        {tab === "crear" && <CreateSchedule existingIds={profiles.map((p) => p.id)} />}
        {tab === "editar" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {profiles.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setEditingId(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                    editingId === p.id
                      ? "text-white border-transparent"
                      : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                  }`}
                  style={editingId === p.id ? { background: p.color, borderColor: p.color } : undefined}
                >
                  {p.displayName}
                </button>
              ))}
            </div>
            {editingProfile ? (
              <CreateSchedule
                key={editingProfile.id}
                initialProfile={editingProfile}
                existingIds={profiles.map((p) => p.id)}
              />
            ) : (
              <p className="text-sm text-slate-500">Elige a alguien para editar su horario.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
