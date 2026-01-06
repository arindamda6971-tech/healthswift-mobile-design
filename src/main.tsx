import { createRoot } from "react-dom/client";
import React from "react";
import "./index.css";

console.log("main.tsx: executed");

// Global handlers to surface errors to the debug banner
window.addEventListener("error", (ev) => {
  try {
    const banner = document.getElementById("debug-banner");
    const msg = ev?.message || String(ev?.error?.message || ev?.error || ev);
    console.error("window error:", ev.error || ev);
    if (banner) banner.textContent = `Uncaught error: ${msg}`;
  } catch (e) {
    console.error("Failed to update banner from error event", e);
  }
});
window.addEventListener("unhandledrejection", (ev) => {
  try {
    const banner = document.getElementById("debug-banner");
    const reason = ev?.reason || ev;
    console.error("Unhandled Rejection:", reason);
    if (banner) banner.textContent = `Unhandled Rejection: ${reason?.message || String(reason)}`;
  } catch (e) {
    console.error("Failed to update banner from unhandledrejection", e);
  }
});

(async () => {
  try {
    const rootEl = document.getElementById("root");
    if (!rootEl) throw new Error("Root element not found");

    // Dynamic import so we can catch import-time errors (static imports block evaluation)
    const { default: App } = await import("./App.tsx");

    try {
      createRoot(rootEl).render(React.createElement(App));
      console.log("App render invoked");
      // Hide the debug banner on successful mount
      const banner = document.getElementById("debug-banner");
      if (banner) {
        banner.style.display = "none";
        banner.textContent = "";
      }
    } catch (err: any) {
      console.error("Error during App.render:", err);
      const banner = document.getElementById("debug-banner");
      if (banner) banner.textContent = `JS error during render: ${err?.message || err}`;
    }
  } catch (err: any) {
    console.error("Error mounting app:", err);
    const banner = document.getElementById("debug-banner");
    if (banner) banner.textContent = `JS mount error: ${err?.message || err}`;
  }
})();
