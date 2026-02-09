"use client";

import { useState } from "react";

interface Props {
  projects: { id: string; name: string }[];
}

export default function NewTaskForm({ projects }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !projectId) return;

    setLoading(true);

    const res = await fetch("/api/tasks/create", {
      method: "POST",
      body: JSON.stringify({ title, description, projectId }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setTitle("");
      setDescription("");
      alert("Tarea creada ✅");
    } else {
      const data = await res.json();
      alert("Error: " + data.error);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-4 border rounded">
      <h3 className="text-xl font-semibold">Nueva Tarea</h3>

      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <textarea
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <select
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        className="w-full p-2 border rounded"
        required
      >
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Creando..." : "Crear Tarea"}
      </button>
    </form>
  );
}
