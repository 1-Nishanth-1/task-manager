let cachedToken: string | null = null;
let inFlight: Promise<string | null> | null = null;

async function fetchBackendToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/backend-token");
    if (!res.ok) return null;
    const body = (await res.json()) as { token?: string };
    return body.token ?? null;
  } catch {
    return null;
  }
}

export async function getBackendToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  if (cachedToken) return cachedToken;

  if (!inFlight) {
    inFlight = fetchBackendToken().then((token) => {
      cachedToken = token;
      inFlight = null;
      return token;
    });
  }

  return inFlight;
}
