import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "./api";

type AuthUser = {
  username: string;
  role: string;
  token: string;
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

  useEffect(() => {
    const token = localStorage.getItem("emi_token");
    if (token) {
      const claims = decodeJwt(token);
      if (claims?.sub) {
        setUser({ username: claims.sub, role: claims.role || "USER", token });
      }
    }
  }, []);

  async function login(usernameOrEmail: string, password: string) {
    const token = await api<string>("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ usernameOrEmail, password }),
      raw: true,
    });
    localStorage.setItem("emi_token", token);
    const claims = decodeJwt(token);
    setUser({
      username: claims?.sub || usernameOrEmail,
      role: claims?.role || "USER",
      token,
    });
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
