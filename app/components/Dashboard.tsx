"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function Dashboard() {
  const { status } = useSession();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      // Avoid synchronous setState inside an effect body
      Promise.resolve().then(() => setUser(null));
      return;
    }

    fetch("/api/dashboard") // endpoint que devuelve datos del usuario si hay sesión
      .then((res) => {
        if (!res.ok) throw new Error("No autorizado");
        return res.json();
      })
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, [status]);

  if (!user) return <p>Debes iniciar sesión para ver el dashboard</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Dashboard</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
