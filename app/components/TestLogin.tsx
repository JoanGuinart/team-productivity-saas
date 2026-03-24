"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface DemoConfig {
  isDemoReadonly: boolean;
  demoEmail: string;
  demoPassword: string;
}

export default function TestLogin({ demoConfig }: { demoConfig: DemoConfig }) {
  const router = useRouter();
  const [email, setEmail] = useState(
    demoConfig.isDemoReadonly ? demoConfig.demoEmail : "",
  );
  const [password, setPassword] = useState(
    demoConfig.isDemoReadonly ? demoConfig.demoPassword : "",
  );
  const [showPassword, setShowPassword] = useState(demoConfig.isDemoReadonly);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await signIn("credentials", {
      redirect: false, // no redirige automáticamente
      email,
      password,
    });

    if (result?.error) {
      setMessage("Error: " + result.error);
    } else {
      setMessage("Login exitoso! JWT creado.");
      router.refresh();
    }
  };

  return (
    <div className="p-4 sm:p-6 border rounded-lg w-full shadow-md bg-white">
      <h3 className="font-bold text-lg sm:text-xl mb-4">Iniciar sesión</h3>
      {demoConfig.isDemoReadonly && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Estás en la demo pública. Ya tienes un usuario de prueba cargado para entrar.
        </div>
      )}
      <form onSubmit={handleLogin} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 sm:p-3 w-full rounded text-sm sm:text-base"
          required
        />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 sm:p-3 w-full rounded text-sm sm:text-base"
          required
        />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
          />
          Mostrar contraseña
        </label>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 sm:p-3 rounded w-full font-medium transition text-sm sm:text-base"
        >
          Login
        </button>
        {message && <p className="text-sm sm:text-base">{message}</p>}
      </form>
    </div>
  );
}
