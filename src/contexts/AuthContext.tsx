import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { STORAGE_KEYS } from "../lib/storageKeys";
import type { CorporateOrgRole } from "@/lib/corporatePermissions";
import { userService } from "@/services/user.service";

interface User {
  id: string;
  name: string;
  email: string;
  type: "artist" | "corporate" | "customer";
  /** From GET /users/me when user_type is corporate */
  corporateRole?: CorporateOrgRole | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userType: "artist" | "corporate" | "customer" | null;
  currentUser: User | null;
  /** Resolved org role for corporate users; null until loaded or non-corporate */
  corporateRole: CorporateOrgRole | null;
  accessToken: string | null;
  isInitialized: boolean;
  login: (
    type: "artist" | "corporate" | "customer",
    userData?: { id: string; name: string; email: string },
  ) => void;
  logout: () => void;
  /** Fetch /users/me and sync corporateRole into currentUser + localStorage */
  refreshCorporateRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<"artist" | "corporate" | "customer" | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const corporateRole: CorporateOrgRole | null =
    currentUser?.type === "corporate" ? currentUser.corporateRole ?? null : null;

  const refreshCorporateRole = useCallback(async () => {
    const token = localStorage.getItem("mgj_access_token");
    if (!token) return;
    try {
      const me = await userService.getCurrentUser();
      const ut = me.user_type ?? me.role;
      if (ut !== "corporate") return;
      const role = me.corporate_role as CorporateOrgRole | undefined;
      setCurrentUser((prev) => {
        if (!prev || prev.type !== "corporate") return prev;
        const next: User = {
          ...prev,
          name: me.name ?? prev.name,
          email: me.email ?? prev.email,
          corporateRole: role ?? null,
        };
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(next));
        return next;
      });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const storedAuth = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
    const storedUserType = localStorage.getItem(STORAGE_KEYS.USER_TYPE) as
      | "artist"
      | "corporate"
      | "customer"
      | null;
    const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    const storedToken = localStorage.getItem("mgj_access_token");

    if (storedAuth === "true" && storedUserType && storedUser) {
      setIsAuthenticated(true);
      setUserType(storedUserType);
      try {
        const u = JSON.parse(storedUser) as User;
        setCurrentUser(u);
      } catch {
        setCurrentUser(null);
      }
      if (storedToken) {
        setAccessToken(storedToken);
      }
    }

    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized || !isAuthenticated || userType !== "corporate") return;
    if (!localStorage.getItem("mgj_access_token")) return;
    void refreshCorporateRole();
  }, [isInitialized, isAuthenticated, userType, refreshCorporateRole]);

  const login = (
    type: "artist" | "corporate" | "customer",
    userData?: { id: string; name: string; email: string },
  ) => {
    setIsAuthenticated(true);
    setUserType(type);

    const newUser: User = {
      id: userData?.id || `${type === "artist" ? "ART" : type === "corporate" ? "CRP" : "BYR"}-999`,
      name: userData?.name || "ゲストユーザー",
      email: userData?.email || "",
      type,
      corporateRole: type === "corporate" ? null : undefined,
    };

    setCurrentUser(newUser);

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
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userType,
        currentUser,
        corporateRole,
        accessToken,
        isInitialized,
        login,
        logout,
        refreshCorporateRole,
      }}
    >
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
