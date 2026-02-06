"use client";

import { useState } from "react";

export default function TestCreateTeam({
  onCreated,
}: {
  onCreated?: () => void;
}) {
  const [name, setName] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/teams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult(`Error: ${data.error || "desconocido"}`);
      } else {
        setResult(`Equipo creado: ${data.name} (ID: ${data.id})`);
        setName(""); // limpia el input
        onCreated?.();
      }
    } catch (err) {
      console.error(err);
      setResult("Error al crear el equipo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md w-full max-w-md">
      <h2 className="text-lg font-bold mb-2">Crear Equipo</h2>
      <input
        type="text"
        placeholder="Nombre del equipo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />
      <button
        onClick={handleCreate}
        disabled={loading || !name}
        className="bg-blue-500 text-white p-2 rounded w-full mb-2"
      >
        {loading ? "Creando..." : "Crear Equipo"}
      </button>
      {result && <p className="mt-2">{result}</p>}
    </div>
  );
}
