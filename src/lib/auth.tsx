import * as React from "react";
import { store, seed } from "./storage";
import type { User } from "./types";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string, role: "student" | "admin") => { ok: boolean; msg?: string };
  register: (fields: {
    name: string;
    email: string;
    password: string;
    registerNo: string;
    department: string;
    year: string;
  }) => { ok: boolean; msg?: string };
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Seed demo data on first load (client-side only)
  React.useEffect(() => {
    seed();
  }, []);

  const [user, setUser] = React.useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const session = store.getSession();
    if (!session) return null;
    return store.getUsers().find((u) => u.id === session.userId) ?? null;
  });

  function login(
    email: string,
    password: string,
    role: "student" | "admin"
  ): { ok: boolean; msg?: string } {
    const users = store.getUsers();
    const found = users.find(
      (u) => u.email === email && u.password === password && u.role === role
    );
    if (!found) return { ok: false, msg: "Invalid credentials" };
    store.setSession({ userId: found.id });
    setUser(found);
    return { ok: true };
  }

  function register(fields: {
    name: string;
    email: string;
    password: string;
    registerNo: string;
    department: string;
    year: string;
  }): { ok: boolean; msg?: string } {
    if (!fields.name.trim()) return { ok: false, msg: "Name is required" };
    if (!fields.email.trim()) return { ok: false, msg: "Email is required" };
    if (!fields.password || fields.password.length < 6)
      return { ok: false, msg: "Password must be at least 6 characters" };
    if (!fields.registerNo.trim())
      return { ok: false, msg: "Register number is required" };

    const users = store.getUsers();
    if (users.find((u) => u.email === fields.email))
      return { ok: false, msg: "Email already registered" };
    if (users.find((u) => u.registerNo === fields.registerNo))
      return { ok: false, msg: "Register number already in use" };

    const newUser: User = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      role: "student",
      name: fields.name,
      email: fields.email,
      password: fields.password,
      registerNo: fields.registerNo,
      department: fields.department,
      year: fields.year,
    };

    store.setUsers([...users, newUser]);
    store.setSession({ userId: newUser.id });
    setUser(newUser);
    return { ok: true };
  }

  function logout() {
    store.setSession(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
