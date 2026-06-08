/** Supported UI languages. Add new entries here to expand language support. */
export const LANGUAGES = [
	{ code: "en", label: "English" },
	{ code: "vi", label: "Tiếng Việt" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const DEFAULT_LANGUAGE: LanguageCode = "en";

export const SUPPORTED_LANGUAGE_CODES: LanguageCode[] = LANGUAGES.map(
	(language) => language.code,
);
