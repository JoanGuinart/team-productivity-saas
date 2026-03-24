"use client";

import { useEffect, useMemo, useState } from "react";
import TaskForm from "./TaskForm";
import { showApiErrorAlert } from "@/lib/clientApi";

type StatusType = "todo" | "in-progress" | "done";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: StatusType;
  projectId: string;
  assigneeId?: string | null;
  assignee?: {
    id: string;
    name?: string | null;
    email?: string;
  };
  priority?: "low" | "medium" | "high" | "urgent";
  dueDate?: string | null;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
}

interface Member {
  id: string;
  name?: string | null;
  email?: string | null;
}

interface Team {
  id: string;
  name: string;
  projects?: Project[];
  members?: Member[];
}

interface TasksManagerProps {
  teams: Team[];
  onTaskDeleted: () => void;
}

const statusColumns: { id: StatusType; label: string }[] = [
  { id: "todo", label: "📌 Por hacer" },
  { id: "in-progress", label: "⚙️ En progreso" },
  { id: "done", label: "✅ Completado" },
];

const priorityStyles: Record<string, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

export default function TasksManager({ teams, onTaskDeleted }: TasksManagerProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>(teams[0]?.id || "");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  // Mostrar mensaje si no hay equipos
  if (teams.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          ¡Crea tu primer equipo!
        </h3>
        <p className="text-slate-600 mb-4">
          Para gestionar tareas, primero necesitas crear un equipo y luego un proyecto.
        </p>
        <p className="text-sm text-slate-500">
          Ve a la pestaña <span className="font-semibold">👥 Equipo</span> para comenzar.
        </p>
      </div>
    );
  }

  const currentTeam = teams.find((t) => t.id === selectedTeam);
  const projects = currentTeam?.projects || [];

  useEffect(() => {
    if (!selectedTeam) {
      setSelectedProject("");
      setTasks([]);
      return;
    }

    if (projects.length > 0) {
      setSelectedProject((prev) => prev || projects[0].id);
    } else {
      setSelectedProject("");
      setTasks([]);
    }
  }, [selectedTeam, projects.length]);

  useEffect(() => {
    if (selectedProject) {
      loadTasks();
    }
  }, [selectedProject]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/project/${selectedProject}`);
      if (!res.ok) throw new Error("Error cargando tareas");
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm("¿Estás seguro de que quieres borrar esta tarea?")) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) {
        await showApiErrorAlert(res, "No se pudo borrar la tarea");
        return;
      }

      setTasks(tasks.filter((t) => t.id !== taskId));
      onTaskDeleted();
    } catch (error) {
      console.error(error);
      alert("Error borrando tarea");
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: StatusType) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        await showApiErrorAlert(res, "No se pudo actualizar la tarea");
        return;
      }

      const updated = await res.json();
      setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
    } catch (error) {
      console.error(error);
      alert("Error actualizando tarea");
    }
  };

  const groupedTasks = useMemo(() => {
    return statusColumns.reduce<Record<StatusType, Task[]>>((acc, col) => {
      acc[col.id] = tasks.filter((t) => t.status === col.id);
      return acc;
    }, { "todo": [], "in-progress": [], "done": [] });
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Equipo</label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="border border-slate-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona equipo</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Proyecto</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="border border-slate-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!selectedTeam || projects.length === 0}
          >
            <option value="">Selecciona proyecto</option>
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedTeam && projects.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h4 className="font-semibold text-slate-900 mb-3">➕ Crear tarea</h4>
          <TaskForm
            teamId={selectedTeam}
            projects={projects}
            members={currentTeam?.members || []}
          />
        </div>
      )}

      {!selectedTeam ? (
        <div className="bg-white rounded-lg p-6 text-center border border-slate-200">
          Selecciona un equipo para ver sus tareas.
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-900 rounded-lg p-6 text-center">
          Este equipo no tiene proyectos. Ve a la pestaña <b>Proyectos</b> y crea uno.
        </div>
      ) : loading ? (
        <div className="text-center py-8">Cargando tareas...</div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 lg:hidden">
            Desliza horizontalmente para ver cada columna del tablero.
          </p>
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
          {statusColumns.map((col) => (
            <div
              key={col.id}
              className="min-h-[300px] min-w-[85vw] snap-start rounded-lg border border-slate-200 bg-slate-50 p-3 sm:min-w-[23rem] lg:min-w-0"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggingTaskId) {
                  updateTaskStatus(draggingTaskId, col.id);
                  setDraggingTaskId(null);
                }
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-900">{col.label}</h4>
                <span className="text-xs bg-slate-200 px-2 py-1 rounded">
                  {groupedTasks[col.id].length}
                </span>
              </div>

              {groupedTasks[col.id].length === 0 ? (
                <p className="text-sm text-slate-500 italic">Sin tareas</p>
              ) : (
                <div className="space-y-2">
                  {groupedTasks[col.id].map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => setDraggingTaskId(task.id)}
                      className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-md transition touch-pan-y"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h5 className="font-medium text-slate-900 text-sm flex-1">
                          {task.title}
                        </h5>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-xs text-red-500 hover:text-red-700 px-1"
                          aria-label="Eliminar tarea"
                        >
                          🗑️
                        </button>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-2 flex items-center gap-2 flex-wrap text-xs">
                        <span className="text-slate-500 truncate max-w-[120px]">
                          👤 {task.assignee?.name || task.assignee?.email || "Sin asignar"}
                        </span>
                        <span className={`px-2 py-1 rounded ${priorityStyles[task.priority || "medium"]}`}>
                          {task.priority || "medium"}
                        </span>
                        {task.dueDate && (
                          <span className="text-slate-500">
                            ⏰ {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Mobile status change buttons */}
                      <div className="mt-2 flex gap-1 lg:hidden">
                        {statusColumns
                          .filter((s) => s.id !== col.id)
                          .map((s) => (
                            <button
                              key={s.id}
                              onClick={() => updateTaskStatus(task.id, s.id)}
                              className="flex-1 rounded bg-blue-100 px-2 py-1.5 text-xs text-blue-700 transition hover:bg-blue-200"
                            >
                              → {s.label}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}
