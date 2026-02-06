"use client";
import { useState, useEffect } from "react";

export default function TestAddMember() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [teamId, setTeamId] = useState(""); // <-- equipo seleccionado
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [result, setResult] = useState("");

  // Traer todos los equipos existentes
  useEffect(() => {
    fetch("/api/teams")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTeams(data);
        } else if (data?.teams && Array.isArray(data.teams)) {
          setTeams(data.teams);
        } else {
          setTeams([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setTeams([]);
      });
  }, []);

  const handleAddMember = async () => {
    if (!teamId) return alert("Selecciona un equipo");
    try {
      const res = await fetch("/api/teams/add-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: email, teamId, role }),
      });
      const data = await res.json();
      if (!res.ok) setResult(`Error: ${data.error}`);
      else setResult(`Miembro agregado exitosamente`);
    } catch (err) {
      console.error(err);
      setResult("Error interno");
    }
  };

  return (
    <div className="p-4 border rounded w-full max-w-md mt-4">
      <h3 className="font-bold mb-2">Agregar miembro a equipo</h3>
      <select
        value={teamId}
        onChange={(e) => setTeamId(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      >
        <option value="">Selecciona un equipo</option>
        {Array.isArray(teams) && teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <input
        type="email"
        placeholder="Email del usuario"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      >
        <option value="member">Member</option>
        <option value="admin">Admin</option>
      </select>

      <button
        onClick={handleAddMember}
        className="bg-green-500 text-white p-2 rounded w-full"
      >
        Agregar miembro
      </button>

      {result && <p className="mt-2">{result}</p>}
    </div>
  );
}
