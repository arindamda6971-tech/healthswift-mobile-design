import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Remove any debug controls injected at runtime (e.g. "Hide debug" button)
// This operates at the DOM level so we don't change UI component files.
function removeDebugControls() {
	const matchesDebugText = (text?: string) => {
		if (!text) return false;
		const t = text.trim().toLowerCase();
		return t === "hide debug" || t === "hide-debug" || t === "debug";
	};

	const cleanup = () => {
		document.querySelectorAll("button, a, div, span").forEach((el) => {
			if (matchesDebugText(el.textContent)) {
				el.remove();
			}
		});
	};

	// Initial pass
	if (typeof document !== "undefined") {
		cleanup();

		// Observe future additions and remove if they appear
		const mo = new MutationObserver(() => cleanup());
		mo.observe(document.body, { childList: true, subtree: true });
	}
}

createRoot(document.getElementById("root")!).render(<App />);

// Run after initial render to catch any debug UI inserted by dev helpers
setTimeout(removeDebugControls, 50);
