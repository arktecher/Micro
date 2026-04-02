import { useEffect, useRef } from "react";
export function useRefreshOnInterval(callback: () => void | Promise<void>, enabled: boolean, intervalMs = 45000): void {
    const cbRef = useRef(callback);
    cbRef.current = callback;
    useEffect(() => {
        if (!enabled)
            return;
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
