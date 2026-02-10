"use client";

import { useState } from "react";

export default function TestRegister() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [result, setResult] = useState("");

  const handleRegister = async () => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password, adminPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult(`Error: ${data.error}`);
      } else {
        setResult(`Usuario creado: ${data.email}`);
        setEmail("");
        setName("");
        setPassword("");
        setAdminPassword("");
      }
    } catch (err) {
      console.error(err);
      setResult("Error interno");
    }
  };

  return (
    <div className="p-4 sm:p-6 border rounded-lg w-full shadow-md bg-white">
      <h3 className="font-bold text-lg sm:text-xl mb-4">Registrar usuario</h3>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 sm:p-3 w-full rounded text-sm sm:text-base"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 sm:p-3 w-full rounded text-sm sm:text-base"
        />
        <input
          type="password"
          placeholder="Contraseña del usuario"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 sm:p-3 w-full rounded text-sm sm:text-base"
        />
        <input
          type="password"
          placeholder="Contraseña de administrador"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          className="border p-2 sm:p-3 w-full rounded text-sm sm:text-base"
        />
        <button
          onClick={handleRegister}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 sm:p-3 rounded w-full font-medium transition text-sm sm:text-base"
        >
          Registrar
        </button>
      </div>
      {result && <p className="mt-3 text-sm sm:text-base">{result}</p>}
    </div>
  );
}
