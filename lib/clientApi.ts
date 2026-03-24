function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function getApiErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const payload = await response.json();

    if (isObject(payload)) {
      if (typeof payload.message === "string" && payload.message.trim()) {
        return payload.message;
      }

      if (typeof payload.error === "string" && payload.error.trim()) {
        return payload.error;
      }
    }
  } catch {
    // Ignore parse errors and fall back to generic messaging.
  }

  return fallbackMessage;
}

export function isDemoReadonlyMessage(message: string): boolean {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("modo solo lectura") ||
    normalized.includes("demo publica") ||
    normalized.includes("deshabilitada en la demo")
  );
}

export async function showApiErrorAlert(
  response: Response,
  fallbackMessage: string,
): Promise<void> {
  const message = await getApiErrorMessage(response, fallbackMessage);

  if (response.status === 403 && isDemoReadonlyMessage(message)) {
    alert("Estas en la demo publica. Puedes explorar la app, pero aqui no se guardan cambios.");
    return;
  }

  alert(`Error: ${message}`);
}
