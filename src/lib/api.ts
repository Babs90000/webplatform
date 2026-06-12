/**
 * Centralized HTTP client for the webplatform API.
 * Base URL is set via NEXT_PUBLIC_API_URL (already includes /api/v1).
 */

import { clearAuthToken, getAuthToken, isAuthRoute } from "./authToken";

const BASE = process.env.NEXT_PUBLIC_API_URL!;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends RequestInit {
  token?: string;
}

const request = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const { token: tokenOption, headers: customHeaders, ...rest } = options;

  const token = tokenOption ?? getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE}${path}`, {
    ...rest,
    headers,
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {
      message = response.statusText || message;
    }

    if (
      response.status === 401 &&
      typeof window !== "undefined" &&
      !isAuthRoute(path)
    ) {
      clearAuthToken();
      const loginUrl = new URL("/login", window.location.origin);
      loginUrl.searchParams.set("reason", "session");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign(loginUrl.toString());
      }
    }

    throw new ApiError(response.status, message);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

export const api = {
  get: <T>(path: string, token?: string): Promise<T> =>
    request<T>(path, { method: "GET", token }),

  post: <T>(path: string, body: unknown, token?: string): Promise<T> =>
    request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
      token,
    }),

  put: <T>(path: string, body: unknown, token?: string): Promise<T> =>
    request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
      token,
    }),

  patch: <T>(path: string, body: unknown, token?: string): Promise<T> =>
    request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
      token,
    }),

  delete: <T = void>(path: string, token?: string): Promise<T> =>
    request<T>(path, { method: "DELETE", token }),
};
