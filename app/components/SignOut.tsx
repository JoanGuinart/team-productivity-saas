"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        signOut({ callbackUrl: "/" });
        router.refresh(); // fuerza que la página y fetch se actualicen
      }}
      className="bg-red-500 text-white p-2 rounded"
    >
      Cerrar sesión
    </button>
  );
}
