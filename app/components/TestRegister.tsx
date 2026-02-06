"use client";

import { useState } from "react";

export default function TestRegister() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");

  const handleRegister = async () => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult(`Error: ${data.error}`);
      } else {
        setResult(`Usuario creado: ${data.email}`);
        setEmail("");
        setName("");
        setPassword("");
      }
    } catch (err) {
      console.error(err);
      setResult("Error interno");
    }
  };

  return (
    <div className="p-4 border rounded-md w-full max-w-md mt-4">
      <h3 className="font-bold mb-2">Registrar usuario de prueba</h3>
      <input
        type="text"
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />
      <button
        onClick={handleRegister}
        className="bg-blue-500 text-white p-2 rounded w-full"
      >
        Registrar
      </button>
      {result && <p className="mt-2">{result}</p>}
    </div>
  );
}
