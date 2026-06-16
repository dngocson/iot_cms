import { useEffect } from "react";
import { useSettingsStore } from "#/store/settings-store";

const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

function applyDarkClass(isDark: boolean) {
	document.documentElement.classList.toggle("dark", isDark);
}

/**
 * Bridges the persisted `theme` setting to the DOM.
 *
 * The dark variant is class-based (`@custom-variant dark (&:is(.dark *))` in
 * styles.css), so dark styles only apply when `.dark` is present on the root
 * element. The store on its own never touches the DOM — this hook is what makes
 * toggling actually change the theme. `"system"` is resolved against the OS
 * preference and kept live while the user stays on that setting.
 *
 * Call once, high in the tree (the root component).
 */
export function useTheme() {
	const theme = useSettingsStore((s) => s.theme);

	useEffect(() => {
		if (theme !== "system") {
			applyDarkClass(theme === "dark");
			return;
		}

		const media = window.matchMedia(DARK_MEDIA_QUERY);
		applyDarkClass(media.matches);

		const handleChange = (event: MediaQueryListEvent) =>
			applyDarkClass(event.matches);
		media.addEventListener("change", handleChange);
		return () => media.removeEventListener("change", handleChange);
	}, [theme]);
}
