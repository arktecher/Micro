import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function safeDecodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Handles Supabase email verification redirects that land on the base URL
 * (e.g. redirect_to=http://localhost:3000).
 *
 * - Detects `type=signup` in query/hash and redirects to `/#/signup/confirm?status=confirmed`
 * - If Supabase returns `#access_token=...` in the hash, stores it in localStorage
 *   and tries to infer role from JWT payload for nicer UI.
 */
export function SupabaseAuthRedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const search = window.location.search || "";
    const hash = window.location.hash || "";
    const combined = `${search}&${hash}`;

    // Check for Supabase error parameters first
    const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
    const error = hashParams.get("error");
    const errorCode = hashParams.get("error_code");
    const errorDescription = hashParams.get("error_description");

    if (error || errorCode) {
      // Handle error cases (expired link, invalid token, etc.)
      const errorType = errorCode === "otp_expired" ? "expired" : "invalid";
      window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
      navigate(`/signup/confirm?status=error&error_type=${errorType}`, { replace: true });
      return;
    }

    // Supabase may return tokens in hash like:
    //   #access_token=...&refresh_token=...&type=signup
    // This conflicts with HashRouter routing, so we normalize it.
    if (hash.startsWith("#access_token=") || hash.includes("access_token=")) {
      const accessToken = hashParams.get("access_token");
      const flowType = (hashParams.get("type") || "").toLowerCase();

      if (accessToken) {
        localStorage.setItem("mgj_access_token", accessToken);

        const payload = safeDecodeJwtPayload(accessToken);
        const userType =
          payload?.user_metadata?.user_type ||
          payload?.app_metadata?.user_type ||
          payload?.user_type;
        if (userType === "artist" || userType === "corporate" || userType === "customer") {
          localStorage.setItem("mgj_pending_signup_role", userType);
        }
      }

      if (flowType === "signup") {
        // Clean the URL before navigating (prevents the HomePage flashing).
        window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
        navigate("/signup/confirm?status=confirmed", { replace: true });
        return;
      }

      if (flowType === "recovery") {
        // Password reset flow - store both tokens and redirect to reset password page
        if (accessToken) {
          sessionStorage.setItem("mgj_reset_token", accessToken);
          
          // Also store refresh_token if available (needed for setSession)
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

    // Supabase verify redirect (no tokens) often lands with ?type=signup
    const typeMatch = /(^|[?&#])type=signup($|[&#])/i.test(combined);
    if (typeMatch) {
      window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
      navigate("/signup/confirm?status=confirmed", { replace: true });
      return;
    }

    // Password reset redirect (no tokens, just type=recovery)
    const recoveryMatch = /(^|[?&#])type=recovery($|[&#])/i.test(combined);
    if (recoveryMatch) {
      window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
      navigate("/reset-password", { replace: true });
    }
  }, [location.key, navigate]);

  return null;
}

