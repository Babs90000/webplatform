/**
 * Client HTTP serveur-only — n'importe pas localStorage/window.
 * Utilisé exclusivement dans les Server Components et les Server Actions.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL!;

export class ServerApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ServerApiError";
  }
}

const serverFetch = async <T>(path: string, token: string): Promise<T> => {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    // Pas de cache partagé : données personnalisées par utilisateur.
    cache: "no-store",
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { message?: string; error?: string };
      message = body.message ?? body.error ?? message;
    } catch {
      message = res.statusText || message;
    }
    throw new ServerApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
};

export const apiServer = {
  get: <T>(path: string, token: string): Promise<T> =>
    serverFetch<T>(path, token),
};
