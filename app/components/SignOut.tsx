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
      className="w-full rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600"
    >
      Cerrar sesión
    </button>
  );
}
