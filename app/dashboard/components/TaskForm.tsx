"use client";

import { useState } from "react";

interface Project {
  id: string;
  name: string;
}

interface Member {
  id: string;
  name?: string | null;
  email?: string | null;
}

interface TaskFormProps {
  teamId: string;
  projects: Project[];
  members: Member[];
}

export default function TaskForm({ teamId, projects, members }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !projectId) return alert("Debes poner título y proyecto");

    const res = await fetch("/api/tasks/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        projectId,
        assigneeId,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      }),
    });

    if (res.ok) {
      alert("Tarea creada ✅");
      setTitle("");
      setDescription("");
      setProjectId("");
      setAssigneeId("");
      setPriority("medium");
      setDueDate("");
    } else {
      const data = await res.json();
      alert("Error: " + data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
      <h3 className="font-semibold mb-3 text-slate-900 flex items-center gap-2">
        <span className="text-lg">✅</span> Nueva Tarea
      </h3>

      {projects.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-3 py-2 rounded-lg mb-3 text-sm">
          ⚠️ No hay proyectos en este equipo. Crea un proyecto primero.
        </div>
      )}

      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border border-slate-300 p-2 mb-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={projects.length === 0}
      />

      <textarea
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border border-slate-300 p-2 mb-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={2}
        disabled={projects.length === 0}
      />

      <div className="grid grid-cols-2 gap-2 mb-2">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="border border-slate-300 p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={projects.length === 0}
        >
          <option value="low">Prioridad: baja</option>
          <option value="medium">Prioridad: media</option>
          <option value="high">Prioridad: alta</option>
          <option value="urgent">Prioridad: urgente</option>
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="border border-slate-300 p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={projects.length === 0}
        />
      </div>

      <select
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        className="border border-slate-300 p-2 mb-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={projects.length === 0}
      >
        <option value="">Selecciona proyecto</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <select
        value={assigneeId}
        onChange={(e) => setAssigneeId(e.target.value)}
        className="border border-slate-300 p-2 mb-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Asignar a...</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name || m.email || "Usuario sin nombre"}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={projects.length === 0}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:bg-gray-400 disabled:cursor-not-allowed w-full"
      >
        Crear Tarea
      </button>
    </form>
  );
}
