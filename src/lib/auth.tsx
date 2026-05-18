import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "./api";

export type AuthUser = {
  username: string;
  role: string;
  token: string;
  name?: string;
  email?: string;
};

type AuthCtx = {
  user: AuthUser | null;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
};

type RegisterData = {
  name: string;
  surname: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string;
};

const Ctx = createContext<AuthCtx | null>(null);

function decodeJwt(token: string): { sub?: string; role?: string } | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  async function hydrateUser(token: string) {
    const claims = decodeJwt(token);
    if (!claims?.sub) return;
    const base: AuthUser = {
      username: claims.sub,
      role: claims.role || "USER",
      token,
    };
    try {
      const all = await api<any[]>("/api/users", { auth: true });
      const me = all.find((u) => u.username === claims.sub || u.email === claims.sub);
      if (me) {
        base.name = `${me.name || ""} ${me.surname || ""}`.trim();
        base.email = me.email;
        if (!base.name) base.name = me.username;
      }
    } catch {
      /* ignore backend errors during hydration */
    }
    setUser(base);
  }

  useEffect(() => {
    const token = localStorage.getItem("emi_token");
    if (token) hydrateUser(token);
  }, []);

  async function login(usernameOrEmail: string, password: string) {
    const token = await api<string>("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ usernameOrEmail, password }),
      raw: true,
    });
    localStorage.setItem("emi_token", token);
    await hydrateUser(token);
  }

  async function register(data: RegisterData) {
    await api("/api/users/register", {
      method: "POST",
      body: JSON.stringify(data),
      raw: true,
    });
  }

  function logout() {
    localStorage.removeItem("emi_token");
    setUser(null);
  }

  return <Ctx.Provider value={{ user, login, register, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
