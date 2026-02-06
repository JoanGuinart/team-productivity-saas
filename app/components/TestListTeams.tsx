"use client";

import { useEffect, useState } from "react";

interface User {
  name?: string;
  email: string;
}

interface Member {
  user: User;
}

interface Team {
  id: string;
  name: string;
  members: Member[];
}

export default function TestListTeams({
  refreshToken = 0,
}: {
  refreshToken?: number;
}) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/teams");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Error al obtener equipos");
        } else {
          setTeams(data as Team[]);
        }
      } catch (err) {
        console.error(err);
        setError("Error al obtener equipos");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [refreshToken]);

  if (loading) return <p>Cargando equipos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4 border rounded-md w-full max-w-md mt-4">
      <h2 className="text-lg font-bold mb-2">Mis Equipos</h2>
      {teams.length === 0 && <p>No perteneces a ningún equipo</p>}
      <ul>
        {teams.map((team) => (
          <li key={team.id} className="border-b py-1">
            <strong>{team.name}</strong> - miembros:{" "}
            {team.members
              .map((m: Member) => m.user.name || m.user.email)
              .join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}
