import React, { createContext, useContext, useState, useEffect } from "react";
import { STORAGE_KEYS } from "../lib/storageKeys";

interface User {
  id: string;
  name: string;
  email: string;
  type: "artist" | "corporate" | "customer";
}

interface AuthContextType {
  isAuthenticated: boolean;
  userType: "artist" | "corporate" | "customer" | null;
  currentUser: User | null;
  login: (type: "artist" | "corporate" | "customer", userData?: { id: string; name: string; email: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<"artist" | "corporate" | "customer" | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // 初期化時にlocalStorageから読み込み
  useEffect(() => {
    const storedAuth = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
    const storedUserType = localStorage.getItem(STORAGE_KEYS.USER_TYPE) as "artist" | "corporate" | "customer" | null;
    const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    
    if (storedAuth === "true" && storedUserType && storedUser) {
      setIsAuthenticated(true);
      setUserType(storedUserType);
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (type: "artist" | "corporate" | "customer", userData?: { id: string; name: string; email: string }) => {
    setIsAuthenticated(true);
    setUserType(type);
    
    const newUser: User = {
      id: userData?.id || `${type === 'artist' ? 'ART' : type === 'corporate' ? 'CRP' : 'BYR'}-999`,
      name: userData?.name || "ゲストユーザー",
      email: userData?.email || "",
      type: type
    };
    
    setCurrentUser(newUser);
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, "true");
    localStorage.setItem(STORAGE_KEYS.USER_TYPE, type);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserType(null);
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
    localStorage.removeItem(STORAGE_KEYS.USER_TYPE);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, currentUser, login, logout }}>
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

