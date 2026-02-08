"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";

const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

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
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearSession = useCallback(() => {
    localStorage.removeItem("gxgold_user");
    localStorage.removeItem("gxgold_token");
    localStorage.removeItem("gxgold_last_activity");
    setIsAuthenticated(false);
    setUser(null);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  // Reset the inactivity timer — called on every user interaction
  const resetInactivityTimer = useCallback(() => {
    if (!localStorage.getItem("gxgold_token")) return;

    // Record last activity timestamp
    localStorage.setItem("gxgold_last_activity", Date.now().toString());

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      clearSession();
    }, INACTIVITY_TIMEOUT_MS);
  }, [clearSession]);

  // Listen for user activity events to reset inactivity timer
  useEffect(() => {
    if (!isAuthenticated) return;

    const activityEvents = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    const handleActivity = () => {
      resetInactivityTimer();
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Start the inactivity timer
    resetInactivityTimer();

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };
  }, [isAuthenticated, resetInactivityTimer]);

  // Verify existing token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem("gxgold_token");
      const storedUser = localStorage.getItem("gxgold_user");

      if (!storedToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      // Check if user was inactive for too long before page reload
      const lastActivity = localStorage.getItem("gxgold_last_activity");
      if (lastActivity) {
        const elapsed = Date.now() - parseInt(lastActivity, 10);
        if (elapsed >= INACTIVITY_TIMEOUT_MS) {
          clearSession();
          setIsLoading(false);
          return;
        }
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
        } else {
          clearSession();
        }
      } catch {
        clearSession();
      }

      setIsLoading(false);
    };

    verifyToken();
  }, [clearSession]);

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
      localStorage.setItem("gxgold_last_activity", Date.now().toString());
      setIsAuthenticated(true);
      setUser(data.user);

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
