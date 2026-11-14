export class AdminApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

function readCsrfCookie(): string {
  if (typeof document === "undefined") return "";
  const prefix = "gg_supply_admin_csrf=";
  const part = document.cookie.split(";").map((item) => item.trim()).find((item) => item.startsWith(prefix));
  if (!part) return "";
  try {
    return decodeURIComponent(part.slice(prefix.length));
  } catch {
    return "";
  }
}

export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (method !== "GET" && method !== "HEAD") {
    const csrf = readCsrfCookie();
    if (csrf) headers.set("x-gg-supply-csrf", csrf);
  }

  const response = await fetch(path, { ...init, method, headers, credentials: "include", cache: "no-store" });
  const data = await response.json().catch(() => null) as { error?: string } | null;
  if (!response.ok) throw new AdminApiError(data?.error ?? `Request failed (${response.status}).`, response.status);
  return data as T;
}
