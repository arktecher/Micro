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
  accessToken: string | null;
  isInitialized: boolean; // Track if auth state has been loaded from localStorage
  login: (type: "artist" | "corporate" | "customer", userData?: { id: string; name: string; email: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<"artist" | "corporate" | "customer" | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // Track initialization

  // 初期化時にlocalStorageから読み込み
  useEffect(() => {
    const storedAuth = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
    const storedUserType = localStorage.getItem(STORAGE_KEYS.USER_TYPE) as "artist" | "corporate" | "customer" | null;
    const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    const storedToken = localStorage.getItem("mgj_access_token");
    
    if (storedAuth === "true" && storedUserType && storedUser) {
      setIsAuthenticated(true);
      setUserType(storedUserType);
      setCurrentUser(JSON.parse(storedUser));
      if (storedToken) {
        setAccessToken(storedToken);
      }
    }
    
    // Mark as initialized after loading from localStorage
    setIsInitialized(true);
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
    
    // Get token from localStorage if available
    const token = localStorage.getItem("mgj_access_token");
    if (token) {
      setAccessToken(token);
    }
    
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, "true");
    localStorage.setItem(STORAGE_KEYS.USER_TYPE, type);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserType(null);
    setCurrentUser(null);
    setAccessToken(null);
    localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
    localStorage.removeItem(STORAGE_KEYS.USER_TYPE);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem("mgj_access_token");
    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, currentUser, accessToken, isInitialized, login, logout }}>
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

