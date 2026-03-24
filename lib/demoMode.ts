export function isDemoReadonly(): boolean {
  return process.env.DEMO_READONLY === "true";
}

export function getDemoReadonlyResponse(): Response {
  return new Response(
    JSON.stringify({
      error: "Demo en modo solo lectura",
      message: "Esta accion esta deshabilitada en la demo publica",
    }),
    { status: 403 },
  );
}

export function guardDemoReadonly(): Response | null {
  if (!isDemoReadonly()) {
    return null;
  }

  return getDemoReadonlyResponse();
}
