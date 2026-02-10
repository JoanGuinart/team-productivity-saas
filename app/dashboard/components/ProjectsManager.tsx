"use client";

import { useState } from "react";

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface Team {
  id: string;
  name: string;
  projects?: Project[];
}

interface ProjectsManagerProps {
  teams: Team[];
  onProjectCreated: () => void;
  onProjectDeleted: () => void;
}

export default function ProjectsManager({
  teams,
  onProjectCreated,
  onProjectDeleted,
}: ProjectsManagerProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>(teams[0]?.id || "");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const currentTeam = teams.find((t) => t.id === selectedTeam);
  const projects = currentTeam?.projects || [];

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Nombre del proyecto requerido");
    if (!selectedTeam) return alert("Selecciona un equipo");

    setLoading(true);
    try {
      const res = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, teamId: selectedTeam }),
      });

      if (!res.ok) throw new Error("Error creando proyecto");
      alert("Proyecto creado ✅");
      setName("");
      setDescription("");
      onProjectCreated();
    } catch (error) {
      console.error(error);
      alert("Error creando proyecto");
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${projectName}"? Se borrarán todas sus tareas.`))
      return;

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error eliminando proyecto");
      onProjectDeleted();
    } catch (error) {
      console.error(error);
      alert("Error eliminando proyecto");
    }
  };

  return (
    <div className="space-y-6">
      {teams.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            ¡Crea tu primer equipo!
          </h3>
          <p className="text-slate-600 mb-4">
            Para crear proyectos, primero necesitas crear un equipo.
          </p>
          <p className="text-sm text-slate-500">
            Ve a la pestaña <span className="font-semibold">👥 Equipo</span> para comenzar.
          </p>
        </div>
      ) : (
        <>
          {/* Seleccionar equipo */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Selecciona un equipo
            </label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Selecciona equipo --</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTeam && (
            <>
              {/* Crear proyecto */}
              <form onSubmit={createProject} className="bg-green-50 p-4 sm:p-6 rounded-lg border border-green-200">
                <h4 className="font-semibold text-slate-900 mb-3">📁 Crear Nuevo Proyecto</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nombre del proyecto"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={loading}
                  />

                  <textarea
                    placeholder="Descripción (opcional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={loading}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:bg-gray-400"
                  >
                    {loading ? "Creando..." : "Crear Proyecto"}
                  </button>
                </div>
              </form>

              {/* Lista de proyectos */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">
                  📂 Proyectos ({projects.length})
                </h4>
                {projects.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No hay proyectos en este equipo
                  </div>
                ) : (
                  <div className="space-y-2">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md transition"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 break-words">{project.name}</p>
                          {project.description && (
                            <p className="text-sm text-slate-600 mt-1 break-words">
                              {project.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteProject(project.id, project.name)}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition whitespace-nowrap self-start sm:self-auto"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
