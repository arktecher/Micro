import { useEffect, useRef } from "react";

/**
 * Calls `callback` on a fixed interval while `enabled`, and when the tab becomes visible
 * or the window gains focus (near–real-time refresh without WebSockets).
 */
export function useRefreshOnInterval(
  callback: () => void | Promise<void>,
  enabled: boolean,
  intervalMs = 45_000,
): void {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    const run = () => {
      void cbRef.current();
    };

    const id = window.setInterval(run, intervalMs);

    const onBecameActive = () => {
      if (document.visibilityState === "visible") {
        run();
      }
    };

    document.addEventListener("visibilitychange", onBecameActive);
    window.addEventListener("focus", run);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onBecameActive);
      window.removeEventListener("focus", run);
    };
  }, [enabled, intervalMs]);
}
