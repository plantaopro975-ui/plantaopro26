import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/panel-hud.css";
// Fonts (Libre Baskerville + IBM Plex) are loaded from Google Fonts in
// index.html. The @fontsource imports below were dead weight — they added
// 8 WOFF2 files + CSS to the initial bundle and pulled zero fonts that the
// app actually uses. Removed for mobile-perf.
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

function installInitialPerformanceModeClass() {
  try {
    const stored = localStorage.getItem('agent_low_motion');
    const isAndroid = /Android/i.test(navigator.userAgent);
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const forced = stored === '1';
    const disabled = stored === '0';
    const active = forced || (!disabled && (isAndroid || reducedMotion));

    document.documentElement.classList.toggle('low-performance-mode', active);
    document.documentElement.classList.toggle('android-performance-mode', active && isAndroid);
  } catch {
    // ignore
  }
}

installInitialPerformanceModeClass();

// Register the Service Worker ONCE (avoids multiple registrations and reload loops)
// that can cause auth refresh storms.
if ("serviceWorker" in navigator && !isSafeModeActive()) {
  const w = window as unknown as { __pp_sw_registered?: boolean };
  if (!w.__pp_sw_registered) {
    w.__pp_sw_registered = true;

    // Snapshot controller BEFORE registration. If there is no controller at
    // boot, this page was loaded without a SW — the imminent activate + claim
    // is the very first install, NOT an update, so we must not reload.
    const hadControllerAtBoot = !!navigator.serviceWorker.controller;

    // Guarded one-time reload when a new SW takes control. Uses sessionStorage
    // so a refresh storm cannot loop: we only reload once per tab session.
    const RELOAD_FLAG = "pp_sw_reloaded_once";
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "SW_ACTIVATED") {
        if (!hadControllerAtBoot) {
          pushDiagEvent('info', 'sw_activated_first_install_no_reload');
          return;
        }
        try {
          if (sessionStorage.getItem(RELOAD_FLAG)) return;
          sessionStorage.setItem(RELOAD_FLAG, "1");
        } catch {
          return;
        }
        pushDiagEvent('info', 'sw_activated_reload');
        window.location.reload();
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
