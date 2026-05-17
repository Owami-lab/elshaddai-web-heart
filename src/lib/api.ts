export const API_BASE =
  (typeof window !== "undefined" && (window as any).__API_BASE__) ||
  import.meta.env.VITE_API_BASE ||
  "http://localhost:8080";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("emi_token");
}

export async function api<T = any>(
  path: string,
  options: RequestInit & { auth?: boolean; raw?: boolean } = {}
): Promise<T> {
  const { auth, raw, headers, ...rest } = options;
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string> | undefined),
  };
  const token = getToken();
  if (auth && token) h["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers: h });
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
};

export type UserResponse = {
  id: number;
  name: string;
  surname: string;
  email: string;
  username: string;
  role: string;
};
