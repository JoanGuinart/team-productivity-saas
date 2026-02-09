"use client";

import { useState, useEffect } from "react";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  createdAt: string;
  assignee?: {
    id: string;
    name?: string | null;
    email?: string;
  };
}

interface Project {
  id: string;
  name: string;
}

interface ProjectsViewProps {
  teamId: string;
  projects: Project[];
}

const statusColors = {
  todo: "bg-red-100 text-red-800",
  "in-progress": "bg-yellow-100 text-yellow-800",
  done: "bg-green-100 text-green-800",
};

const statusLabels = {
  todo: "📌 Por hacer",
  "in-progress": "⚙️ En progreso",
  done: "✅ Completado",
};

export default function ProjectsView({ teamId, projects }: ProjectsViewProps) {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [tasksbyProject, setTasksByProject] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState(false);

  const loadProjectTasks = async (projectId: string) => {
    if (tasksbyProject[projectId]) {
      setExpandedProject(expandedProject === projectId ? null : projectId);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/project/${projectId}`);
      if (!res.ok) throw new Error("Error cargando tareas");
      const tasks = await res.json();
      setTasksByProject((prev) => ({
        ...prev,
        [projectId]: Array.isArray(tasks) ? tasks : [],
      }));
      setExpandedProject(projectId);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-3">
      <h4 className="font-semibold text-lg text-gray-800">📂 Proyectos y Tareas</h4>

      {projects.length === 0 ? (
        <p className="text-gray-500 italic">No hay proyectos aún</p>
      ) : (
        <div className="space-y-2">
          {projects.map((project) => (
            <div key={project.id} className="border rounded-lg overflow-hidden">
              {/* Header del proyecto */}
              <button
                onClick={() => loadProjectTasks(project.id)}
                className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 flex justify-between items-center transition"
              >
                <span className="font-medium text-blue-900">{project.name}</span>
                <span className="text-xl">
                  {expandedProject === project.id ? "▼" : "▶"}
                </span>
              </button>

              {/* Tareas del proyecto */}
              {expandedProject === project.id && (
                <div className="bg-white p-4 space-y-2 border-t">
                  {loading ? (
                    <p className="text-gray-500">Cargando tareas...</p>
                  ) : tasksbyProject[project.id]?.length === 0 ? (
                    <p className="text-gray-500 italic">No hay tareas en este proyecto</p>
                  ) : (
                    <div className="space-y-2">
                      {tasksbyProject[project.id]?.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{task.title}</h5>
                              {task.description && (
                                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                              )}
                            </div>
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${
                                statusColors[task.status]
                              }`}
                            >
                              {statusLabels[task.status]}
                            </span>
                          </div>

                          {/* Asignado a */}
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <span className="text-gray-600">👤</span>
                            {task.assignee ? (
                              <span className="text-gray-800 font-medium">
                                {task.assignee.name || task.assignee.email}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">Sin asignar</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
