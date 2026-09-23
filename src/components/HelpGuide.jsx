import { Copy, Pencil, Plus, Send } from "lucide-react";

export default function HelpGuide({ onGoCreate, onGoEdit }) {
  return (
    <div className="space-y-4 max-w-3xl">
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <h2 className="text-lg font-bold text-slate-800">Cómo usar esta app</h2>
        <p className="text-sm text-slate-600">
          Aquí comparamos horarios del TEC (Cartago) para ver cuándo el grupo está libre. El sitio
          <span className="font-medium"> no guarda los cambios por sí solo</span>: si quieres entrar
          o corregir tu horario, generas un JSON y se lo envías a Samuel.
        </p>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-slate-700" />
          <h3 className="font-semibold text-slate-800">Agregar tu horario (nuevo)</h3>
        </div>
        <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1.5">
          <li>
            Abre la pestaña <span className="font-medium text-slate-800">Crear horario</span>.
          </li>
          <li>Escribe tu nombre (el id se genera solo) y elige un color.</li>
          <li>
            Agrega cada <span className="font-medium">materia</span> con{" "}
            <span className="font-medium">+ Nueva materia</span>.
          </li>
          <li>
            En cada materia, pon los bloques: día, hora de inicio, hora de fin y aula. Usa{" "}
            <span className="font-medium">+ Agregar horario</span> si la clase se repite otro día.
          </li>
          <li>
            Las horas van en formato <span className="font-mono text-slate-800">HH:MM</span> de 24
            horas, por ejemplo <span className="font-mono">09:30</span> y no{" "}
            <span className="font-mono">9:30</span>.
          </li>
          <li>
            Revisa el calendario, pulsa <span className="font-medium">Copiar JSON</span> y envíaselo
            a Samuel.
          </li>
        </ol>
        <button
          type="button"
          onClick={onGoCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-700"
        >
          <Plus className="w-4 h-4" /> Ir a Crear horario
        </button>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Pencil className="w-5 h-5 text-slate-700" />
          <h3 className="font-semibold text-slate-800">Editar un horario que ya está</h3>
        </div>
        <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1.5">
          <li>
            Abre <span className="font-medium text-slate-800">Editar horario</span> (o{" "}
            <span className="font-medium">Editar</span> en la tarjeta de Personas).
          </li>
          <li>Elige tu nombre: el formulario se llena con tus materias y horas.</li>
          <li>Corrige lo que cambió, agrega o borra materias.</li>
          <li>
            <span className="font-medium">Copiar JSON</span> y envíaselo a Samuel. Debe ser el
            objeto con el <span className="font-medium">mismo id</span> para reemplazar el horario
            viejo.
          </li>
        </ol>
        <button
          type="button"
          onClick={onGoEdit}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-700"
        >
          <Pencil className="w-4 h-4" /> Ir a Editar horario
        </button>
      </section>

      <section className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-emerald-900">
          <Send className="w-5 h-5" />
          <h3 className="font-semibold">Cómo enviárselo a Samuel</h3>
        </div>
        <ul className="text-sm text-emerald-900 space-y-2">
          <li className="flex gap-2">
            <Copy className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              El botón <span className="font-medium">Copiar JSON</span> solo funciona si no hay
              errores (nombre, al menos una materia, horas válidas).
            </span>
          </li>
          <li>
            Pega ese JSON en un mensaje (WhatsApp, Discord o el chat que usen) y mándaselo a{" "}
            <span className="font-medium">Samuel</span>. Di si es <span className="font-medium">nuevo</span> o un{" "}
            <span className="font-medium">reemplazo</span>.
          </li>
          <li>
            Samuel lo pega en el archivo del sitio y lo publica. Hasta entonces, el comparador no
            cambia para el resto del grupo.
          </li>
        </ul>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 text-sm text-slate-600">
        <h3 className="font-semibold text-slate-800">Las otras pestañas</h3>
        <p>
          <span className="font-medium text-slate-800">Comparar</span> — marca 1, 2, 3 o todos y
          ves el calendario más los huecos en los que ese grupo está libre.
        </p>
        <p>
          <span className="font-medium text-slate-800">Personas</span> — lista de quienes ya están
          cargados, con un atajo a editar o a ver solo a esa persona.
        </p>
      </section>
    </div>
  );
}
