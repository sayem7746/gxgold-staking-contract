"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const expiryTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearSession = useCallback(() => {
    localStorage.removeItem("gxgold_user");
    localStorage.removeItem("gxgold_token");
    setIsAuthenticated(false);
    setUser(null);
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
  }, []);

  const scheduleAutoLogout = useCallback((expiresAt: number) => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
    }
    const msUntilExpiry = expiresAt * 1000 - Date.now();
    if (msUntilExpiry <= 0) {
      clearSession();
      return;
    }
    expiryTimerRef.current = setTimeout(() => {
      clearSession();
    }, msUntilExpiry);
  }, [clearSession]);

  // Verify existing token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem("gxgold_token");
      const storedUser = localStorage.getItem("gxgold_user");

      if (!storedToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: storedToken }),
        });

        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          setUser(data.user);
          if (data.exp) {
            scheduleAutoLogout(data.exp);
          }
        } else {
          // Token expired or invalid - clear session
          clearSession();
        }
      } catch {
        clearSession();
      }

      setIsLoading(false);
    };

    verifyToken();
  }, [clearSession, scheduleAutoLogout]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        return false;
      }

      const data = await res.json();

      localStorage.setItem("gxgold_user", data.user);
      localStorage.setItem("gxgold_token", data.token);
      setIsAuthenticated(true);
      setUser(data.user);

      // Schedule auto-logout when token expires (10 minutes)
      const expiresAt = Math.floor(Date.now() / 1000) + data.expiresIn;
      scheduleAutoLogout(expiresAt);

      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    clearSession();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
