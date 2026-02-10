"use client";

import { useState } from "react";

interface ProjectFormProps {
  teamId: string;
  onProjectCreated: () => void;
}

export default function ProjectForm({ teamId, onProjectCreated }: ProjectFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("El nombre del proyecto es obligatorio");

    setLoading(true);
    try {
      const res = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, teamId }),
      });

      if (res.ok) {
        alert("Proyecto creado ✅");
        setName("");
        setDescription("");
        onProjectCreated(); // Recargar datos del dashboard
      } else {
        const data = await res.json();
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Error al crear proyecto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 sm:p-4 rounded-lg border border-green-200">
      <h4 className="font-semibold mb-3 text-slate-900 flex items-center gap-2 text-base sm:text-lg">
        <span className="text-lg">📁</span> Crear Nuevo Proyecto
      </h4>

      <input
        type="text"
        placeholder="Nombre del proyecto"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border border-slate-300 p-2 mb-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
        disabled={loading}
      />

      <textarea
        placeholder="Descripción (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border border-slate-300 p-2 mb-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
        rows={2}
        disabled={loading}
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:bg-gray-400 disabled:cursor-not-allowed w-full text-sm sm:text-base"
      >
        {loading ? "Creando..." : "Crear Proyecto"}
      </button>
    </form>
  );
}
