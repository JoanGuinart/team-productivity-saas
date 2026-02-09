"use client";

import { useState, useEffect } from "react";

interface Member {
  id: string;
  name?: string | null;
  email?: string;
  role: string;
}

interface User {
  id: string;
  name?: string | null;
  email?: string;
}

interface Team {
  id: string;
  name: string;
  members?: Member[];
}

interface MembersManagerProps {
  teams: Team[];
  onMemberDeleted: () => void;
}

export default function MembersManager({
  teams,
  onMemberDeleted,
}: MembersManagerProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>(teams[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);

  const currentTeam = teams.find((t) => t.id === selectedTeam);
  const members = currentTeam?.members || [];

  // Buscar usuarios disponibles
  useEffect(() => {
    if (!selectedTeam || searchQuery.length < 1) {
      setAvailableUsers([]);
      return;
    }

    const searchUsers = async () => {
      try {
        const res = await fetch(
          `/api/users?search=${encodeURIComponent(searchQuery)}&teamId=${selectedTeam}`
        );
        if (!res.ok) throw new Error("Error buscando usuarios");
        const users = await res.json();
        setAvailableUsers(users);
      } catch (error) {
        console.error(error);
        setAvailableUsers([]);
      }
    };

    searchUsers();
  }, [searchQuery, selectedTeam]);

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return alert("Nombre del equipo requerido");

    setCreatingTeam(true);
    try {
      const res = await fetch("/api/teams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTeamName }),
      });

      if (!res.ok) throw new Error("Error creando equipo");
      alert("Equipo creado ✅");
      setNewTeamName("");
      onMemberDeleted(); // Recargar equipos
    } catch (error) {
      console.error(error);
      alert("Error creando equipo");
    } finally {
      setCreatingTeam(false);
    }
  };

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return alert("Selecciona un usuario");
    if (!selectedTeam) return alert("Selecciona un equipo");

    setLoading(true);
    try {
      const res = await fetch("/api/teams/add-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: selectedTeam, userId: selectedUserId, role }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error agregando miembro");
      }
      alert("Miembro agregado ✅");
      setSearchQuery("");
      setSelectedUserId("");
      onMemberDeleted(); // Recargar
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Error agregando miembro");
    } finally {
      setLoading(false);
    }
  };

  const deleteMember = async (memberId: string, memberEmail: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${memberEmail}?`))
      return;

    try {
      const res = await fetch(
        `/api/teams/${selectedTeam}/members/${memberId}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) throw new Error("Error eliminando miembro");
      onMemberDeleted();
    } catch (error) {
      console.error(error);
      alert("Error eliminando miembro");
    }
  };

  return (
    <div className="space-y-6">
      {/* Crear equipo nuevo */}
      <form onSubmit={createTeam} className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h4 className="font-semibold text-slate-900 mb-3">➕ Crear Nuevo Equipo</h4>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nombre del equipo"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            className="flex-1 border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={creatingTeam}
          />
          <button
            type="submit"
            disabled={creatingTeam || !newTeamName.trim()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {creatingTeam ? "Creando..." : "Crear"}
          </button>
        </div>
      </form>

      {/* Seleccionar equipo */}
      <div>
        <label className="block text-sm font-medium text-slate-900 mb-2">
          Selecciona un equipo
        </label>
        <select
          value={selectedTeam}
          onChange={(e) => {
            setSelectedTeam(e.target.value);
            setSearchQuery("");
            setSelectedUserId("");
          }}
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
          {/* Agregar miembro */}
          <form onSubmit={addMember} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-slate-900 mb-3">➕ Agregar Miembro</h4>
            <div className="space-y-3">
              {/* Búsqueda de usuarios */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Buscar usuario
                </label>
                <input
                  type="text"
                  placeholder="Busca por email o nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              {/* Selector de usuario */}
              {searchQuery && availableUsers.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Selecciona un usuario
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Elige un usuario --</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {searchQuery && availableUsers.length === 0 && (
                <p className="text-sm text-slate-600 italic">
                  No se encontraron usuarios. Verifica el nombre o email.
                </p>
              )}

              {/* Rol */}
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="member">Miembro</option>
                <option value="admin">Admin</option>
              </select>

              <button
                type="submit"
                disabled={loading || !selectedUserId}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Agregando..." : "Agregar"}
              </button>
            </div>
          </form>

          {/* Lista de miembros */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">
              👥 Miembros ({members.length})
            </h4>
            {members.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No hay miembros en este equipo
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {member.name || member.email}
                      </p>
                      <p className="text-xs text-slate-600 capitalize">
                        {member.role}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteMember(member.id, member.email || "")}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition"
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
    </div>
  );
}
