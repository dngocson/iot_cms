import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LanguageCode } from "#/constants/languages";
import i18n from "#/i18n";

export type Theme = "light" | "dark" | "system";
export type Language = "en" | "vi";

interface SettingsState {
	language: LanguageCode;
	theme: Theme;
	setLanguage: (language: LanguageCode) => void;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
}

/**
 * Global client settings (language, theme).
 *
 * This is the only place app-wide UI preferences live. Server data must NOT
 * be stored here — use TanStack Query for that. Persisted to localStorage so
 * preferences survive reloads.
 */

function getInitialTheme(): Theme {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function getInitialLanguage(): Language {
	if (typeof navigator === "undefined") return "en";
	return navigator.language.toLowerCase().startsWith("vi") ? "vi" : "en";
}

export const useSettingsStore = create<SettingsState>()(
	persist(
		(set) => ({
			theme: getInitialTheme(),
			language: getInitialLanguage(),
			setLanguage: (language) => {
				i18n.changeLanguage(language);
				set({ language });
			},
			setTheme: (theme) => set({ theme }),
			toggleTheme: () =>
				set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
		}),
		{
			name: "iot-cms-settings",
			// Re-apply the persisted language to i18n once the store rehydrates.
			onRehydrateStorage: () => (state) => {
				if (state) {
					i18n.changeLanguage(state.language);
				}
			},
		},
	),
);
