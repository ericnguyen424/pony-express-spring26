import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AuthContextType {
  loggedIn: boolean;
  login: (token?: string) => void;
  logout: () => void;
  token: string | null;
}

const AUTH_STORAGE_KEY = "pony_express_auth";
const AUTHENTICATION_SCHEME: "cookie" | "bearer" = "bearer";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize from storage on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      try {
        const { token: storedToken } = JSON.parse(storedAuth);
        if (storedToken) {
          setToken(storedToken);
        }
      } catch {
        // Invalid stored data, clear it
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsHydrated(true);
  }, []);

  // Persist token to storage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      if (token) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token }));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, [token, isHydrated]);

  const login = (newToken?: string) => {
    if (AUTHENTICATION_SCHEME === "bearer" && newToken) {
      setToken(newToken);
    } else if (AUTHENTICATION_SCHEME === "cookie") {
      // For cookie authentication, we just need to set a marker
      // The cookie is automatically handled by the browser
      setToken("cookie_authenticated");
    }
  };

  const logout = () => {
    setToken(null);
  };

  const loggedIn = token !== null && token !== "";

  const value: AuthContextType = {
    loggedIn,
    login,
    logout,
    token: loggedIn ? token : null,
  };

  // Don't render children until hydrated to prevent mismatch
  if (!isHydrated) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
