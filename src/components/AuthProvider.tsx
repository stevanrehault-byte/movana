"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
}

interface Operator {
  id: string;
  name: string;
  slug: string;
  tier: string;
}

interface AuthContextType {
  user: User | null;
  operator: Operator | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  token: string | null;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  operatorName?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load token from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("movana_token");
    if (stored) {
      setToken(stored);
      fetchMe(stored);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMe = async (accessToken: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setOperator(data.operator);
      } else {
        localStorage.removeItem("movana_token");
        setToken(null);
      }
    } catch {
      localStorage.removeItem("movana_token");
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) return { ok: false, error: data.error };

      localStorage.setItem("movana_token", data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);
      setOperator(data.operator);
      return { ok: true };
    } catch {
      return { ok: false, error: "Network error" };
    }
  }, []);

  const register = useCallback(async (regData: RegisterData) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regData),
      });
      const data = await res.json();

      if (!res.ok) return { ok: false, error: data.error };

      localStorage.setItem("movana_token", data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);
      setOperator(data.operator);
      return { ok: true };
    } catch {
      return { ok: false, error: "Network error" };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("movana_token");
    setToken(null);
    setUser(null);
    setOperator(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, operator, loading, login, register, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}
