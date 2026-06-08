import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_LANGUAGE, type LanguageCode } from "#/constants/languages";
import i18n from "#/i18n";

export type Theme = "light" | "dark" | "system";

interface SettingsState {
	language: LanguageCode;
	theme: Theme;
	setLanguage: (language: LanguageCode) => void;
	setTheme: (theme: Theme) => void;
}

/**
 * Global client settings (language, theme).
 *
 * This is the only place app-wide UI preferences live. Server data must NOT
 * be stored here — use TanStack Query for that. Persisted to localStorage so
 * preferences survive reloads.
 */
export const useSettingsStore = create<SettingsState>()(
	persist(
		(set) => ({
			language: DEFAULT_LANGUAGE,
			theme: "system",
			setLanguage: (language) => {
				i18n.changeLanguage(language);
				set({ language });
			},
			setTheme: (theme) => set({ theme }),
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
