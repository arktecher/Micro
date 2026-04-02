import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
function safeDecodeJwtPayload(token: string): any | null {
    try {
        const parts = token.split(".");
        if (parts.length < 2)
            return null;
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
        const json = decodeURIComponent(atob(padded)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""));
        return JSON.parse(json);
    }
    catch {
        return null;
    }
}
export function SupabaseAuthRedirectHandler() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    useEffect(() => {
        const search = window.location.search || "";
        const hash = window.location.hash || "";
        const combined = `${search}&${hash}`;
        const searchParams = new URLSearchParams(search);
        if (searchParams.get("error") || searchParams.get("error_code")) {
            const errorType = searchParams.get("error_code") === "otp_expired" ? "expired" : "invalid";
            window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
            navigate(`/signup/confirm?status=error&error_type=${errorType}`, {
                replace: true,
            });
            return;
        }
        const pkceCode = searchParams.get("code");
        if (pkceCode) {
            const supabase = getSupabaseBrowser();
            if (!supabase) {
                return;
            }
            let cancelled = false;
            void (async () => {
                const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
                if (cancelled)
                    return;
                if (error) {
                    console.error("exchangeCodeForSession:", error);
                    window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
                    navigate(`/signup/confirm?status=error&error_type=invalid`, {
                        replace: true,
                    });
                    return;
                }
                const isRecovery = searchParams.get("recovery") === "1";
                window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
                if (isRecovery) {
                    navigate("/reset-password", { replace: true });
                }
                else {
                    navigate("/signup/confirm?status=confirmed", { replace: true });
                }
            })();
            return () => {
                cancelled = true;
            };
        }
        const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
        const error = hashParams.get("error");
        const errorCode = hashParams.get("error_code");
        if (error || errorCode) {
            const errorType = errorCode === "otp_expired" ? "expired" : "invalid";
            window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
            navigate(`/signup/confirm?status=error&error_type=${errorType}`, {
                replace: true,
            });
            return;
        }
        if (hash.startsWith("#access_token=") || hash.includes("access_token=")) {
            const accessToken = hashParams.get("access_token");
            const flowType = (hashParams.get("type") || "").toLowerCase();
            if (accessToken) {
                localStorage.setItem("mgj_access_token", accessToken);
                const refreshToken = hashParams.get("refresh_token");
                if (refreshToken) {
                    localStorage.setItem("mgj_refresh_token", refreshToken);
                }
                const payload = safeDecodeJwtPayload(accessToken);
                const userType = payload?.user_metadata?.user_type ||
                    payload?.app_metadata?.user_type ||
                    payload?.user_type;
                const userId = payload?.sub || payload?.user_id;
                const userName = payload?.user_metadata?.name || payload?.name || "";
                const userEmail = payload?.email || "";
                if (userType === "artist" ||
                    userType === "corporate" ||
                    userType === "customer") {
                    localStorage.setItem("mgj_pending_signup_role", userType);
                }
                if (flowType === "signup" && userType && userId) {
                    api
                        .get<{
                        id: string;
                        email: string;
                        name: string;
                        user_type: string;
                    }>("/users/me")
                        .then((userData) => {
                        login(userType as "artist" | "corporate" | "customer", {
                            id: userData.id,
                            name: userData.name,
                            email: userData.email,
                        });
                    })
                        .catch(() => {
                        login(userType as "artist" | "corporate" | "customer", {
                            id: userId,
                            name: userName || "ユーザー",
                            email: userEmail,
                        });
                    });
                }
            }
            if (flowType === "signup") {
                window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
                navigate("/signup/confirm?status=confirmed", { replace: true });
                return;
            }
            if (flowType === "recovery") {
                if (accessToken) {
                    sessionStorage.setItem("mgj_reset_token", accessToken);
                    const refreshToken = hashParams.get("refresh_token");
                    if (refreshToken) {
                        sessionStorage.setItem("mgj_reset_refresh_token", refreshToken);
                    }
                }
                window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
                navigate("/reset-password", { replace: true });
                return;
            }
        }
        const typeMatch = /(^|[?&#])type=signup($|[&#])/i.test(combined);
        if (typeMatch) {
            window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
            navigate("/signup/confirm?status=confirmed", { replace: true });
            return;
        }
        const recoveryMatch = /(^|[?&#])type=recovery($|[&#])/i.test(combined);
        if (recoveryMatch) {
            window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
            navigate("/reset-password", { replace: true });
        }
    }, [location.key, navigate, login]);
    return null;
}
