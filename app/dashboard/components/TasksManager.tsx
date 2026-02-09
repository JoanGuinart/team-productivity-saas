"use client";

import { useState, useEffect } from "react";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  projectId: string;
  assigneeId?: string | null;
  assignee?: {
    id: string;
    name?: string | null;
    email?: string;
  };
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
  projects?: Project[];
}

interface TasksManagerProps {
  teams: Team[];
  onTaskDeleted: () => void;
}

const statusColors = {
  todo: "bg-red-100 text-red-800",
  "in-progress": "bg-yellow-100 text-yellow-800",
  done: "bg-green-100 text-green-800",
};

const statusLabels = {
  todo: "Por hacer",
  "in-progress": "En progreso",
  done: "Completado",
};

export default function TasksManager({ teams, onTaskDeleted }: TasksManagerProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>(teams[0]?.id || "");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const currentTeam = teams.find((t) => t.id === selectedTeam);
  const projects = currentTeam?.projects || [];

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
      if (!res.ok) throw new Error("Error borrando tarea");
      setTasks(tasks.filter((t) => t.id !== taskId));
      onTaskDeleted();
    } catch (error) {
      console.error(error);
      alert("Error borrando tarea");
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Error actualizando tarea");
      const updated = await res.json();
      setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
    } catch (error) {
      console.error(error);
      alert("Error actualizando tarea");
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="grid grid-cols-2 gap-4">
        <select
          value={selectedTeam}
          onChange={(e) => {
            setSelectedTeam(e.target.value);
            setSelectedProject("");
          }}
          className="border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecciona equipo</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>

        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!selectedTeam}
        >
          <option value="">Selecciona proyecto</option>
          {projects.map((proj) => (
            <option key={proj.id} value={proj.id}>
              {proj.name}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de tareas */}
      {loading ? (
        <div className="text-center py-8">Cargando tareas...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          {selectedProject ? "No hay tareas en este proyecto" : "Selecciona un proyecto"}
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-500">👤 {task.assignee?.name || task.assignee?.email || "Sin asignar"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded font-medium ${statusColors[task.status]} border-0 cursor-pointer`}
                  >
                    <option value="todo">Por hacer</option>
                    <option value="in-progress">En progreso</option>
                    <option value="done">Completado</option>
                  </select>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition"
                  >
                    🗑️ Borrar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
