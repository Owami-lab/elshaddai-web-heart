export const API_BASE =
  (typeof window !== "undefined" &&
    (window as Window & typeof globalThis & { __API_BASE__?: string }).__API_BASE__) ||
  import.meta.env.VITE_API_BASE ||
  "";

export function readStorageItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorageItem(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors on mobile/private modes and keep the app usable.
  }
}

export function removeStorageItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage errors on mobile/private modes and keep the app usable.
  }
}

function getToken(): string | null {
  return readStorageItem("emi_token") || readStorageItem("token");
}

function getCsrfToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return document.cookie
      .split(";")
      .map((cookie) => cookie.trim())
      .reduce(
        (value, cookie) => {
          if (!cookie.startsWith("XSRF-TOKEN=")) return value;
          return decodeURIComponent(cookie.substring("XSRF-TOKEN=".length));
        },
        null as string | null,
      );
  } catch {
    return null;
  }
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit & { auth?: boolean; raw?: boolean } = {},
): Promise<T> {
  const { auth, raw, headers, ...rest } = options;
  const h: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string> | undefined),
  };
  const token = getToken();
  if (auth) {
    if (!token) {
      throw new Error("Not authenticated. Please sign in again and retry your gift.");
    }
    h["Authorization"] = `Bearer ${token}`;
  }
  const csrfToken = getCsrfToken();
  if (csrfToken && !h["X-XSRF-TOKEN"]) {
    h["X-XSRF-TOKEN"] = csrfToken;
  }

  const isFormData = typeof FormData !== "undefined" && rest.body instanceof FormData;
  if ((rest.method?.toUpperCase() !== "GET" || rest.body) && !isFormData) {
    h["Content-Type"] = h["Content-Type"] ?? "application/json";
  }

  // include credentials so cookie-based session auth works from the browser
  const fetchOptions: RequestInit = {
    credentials: "include",
    ...rest,
    headers: h,
  };

  const url = API_BASE || (typeof window !== "undefined" && path.startsWith("/") ? `${window.location.origin}${path}` : path);

  let res: Response;
  try {
    res = await fetch(url, fetchOptions);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Network error: ${message}`);
  }
  const text = await res.text();
  if (!res.ok) throw new Error(text || `Request failed: ${res.status}`);
  if (raw) return text as unknown as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export type Sermon = {
  id: number;
  title: string;
  preacher: string;
  description: string;
  date: string;
  videoUrl: string;
};

export type Department = {
  id: number;
  name: string;
  description: string;
  imageUrl?: string | null;
};

export type GivingEntry = {
  id?: number;
  name?: string;
  surname?: string;
  giverName?: string;
  amount?: number | string;
  paymentMethod?: string;
  dateTime?: string;
  userId?: number | string;
  memberId?: number | string;
  user?: { id?: number | string };
  [key: string]: unknown;
};

export type UserResponse = {
  id: number;
  name: string;
  surname: string;
  email: string;
  username: string;
  role: string;
  department?: string | number | null;
  departmentId?: number | string | null;
  departmentName?: string | null;
  lastActiveAt?: string | null;
  lastActive?: string | null;
  watchedSermons?: Array<{ id?: number; title?: string; date?: string } | string> | null;
  sermonsWatched?: Array<{ id?: number; title?: string; date?: string } | string> | null;
  giving?: GivingEntry[] | null;
  gifts?: GivingEntry[] | null;
};
