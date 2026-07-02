import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/panel-hud.css";
import "@fontsource/sora/400.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/sora/800.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import { pushConsoleError, pushDiagEvent } from "@/lib/diagLog";

// Capture console errors for the Diagnostics report (no sensitive values).
(function installConsoleCapture() {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    try {
      pushConsoleError(args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '));
    } catch {
      // ignore
    }
    originalError(...args);
  };
})();

function isSafeModeActive(): boolean {
  try {
    const enabled = localStorage.getItem('plantaopro_safe_mode') === 'true';
    const expiry = localStorage.getItem('plantaopro_safe_mode_expiry');
    if (!enabled) return false;
    if (!expiry) return true;
    return Date.now() < parseInt(expiry, 10);
  } catch {
    return false;
  }
}

// Register the Service Worker ONCE (avoids multiple registrations and reload loops)
// that can cause auth refresh storms.
if ("serviceWorker" in navigator && !isSafeModeActive()) {
  const w = window as unknown as { __pp_sw_registered?: boolean };
  if (!w.__pp_sw_registered) {
    w.__pp_sw_registered = true;

    // Guarded one-time reload when a new SW takes control. Uses sessionStorage
    // so a refresh storm cannot loop: we only reload once per tab session.
    const RELOAD_FLAG = "pp_sw_reloaded_once";
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "SW_ACTIVATED") {
        try {
          if (sessionStorage.getItem(RELOAD_FLAG)) return;
          sessionStorage.setItem(RELOAD_FLAG, "1");
        } catch {
          return;
        }
        // Only reload if we already had a controller (i.e. it's an UPDATE,
        // not the very first install) — avoids the boot-time double load.
        if (navigator.serviceWorker.controller) {
          window.location.reload();
        }
      }
    });

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(async (registration) => {
        pushDiagEvent('info', 'sw_registered', {
          scope: registration.scope,
          hasWaiting: !!registration.waiting,
        });

        try {
          await registration.update();
        } catch {
          // ignore
        }

        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            pushDiagEvent('info', 'sw_state', { state: newWorker.state });
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              newWorker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });

        console.log("Service Worker registered successfully");
      })
      .catch((error) => {
        pushDiagEvent('error', 'sw_register_failed', { message: String(error) });
        console.error("Service Worker registration failed:", error);
      });
  }
} else if ("serviceWorker" in navigator) {
  pushDiagEvent('warn', 'safe_mode_sw_skipped');
}

createRoot(document.getElementById("root")!).render(<App />);
