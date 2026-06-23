import type { Resource } from "i18next";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
	DEFAULT_LANGUAGE,
	SUPPORTED_LANGUAGE_CODES,
} from "#/constants/languages";
import enCommon from "./locales/en/common.json";
import viCommon from "./locales/vi/common.json";

/** Default namespace used when none is specified in `t()`. */
export const defaultNS = "common";

/**
 * All translation resources, keyed by language then namespace.
 * Add a namespace here (e.g. `dashboard`, `alerts`) as features grow.
 */
export const resources = {
	en: { common: enCommon },
	vi: { common: viCommon },
} satisfies Resource;

i18n.use(initReactI18next).init({
	resources,
	lng: DEFAULT_LANGUAGE,
	fallbackLng: DEFAULT_LANGUAGE,
	supportedLngs: SUPPORTED_LANGUAGE_CODES,
	defaultNS,
	ns: ["common"],
	interpolation: {
		// React already escapes values, so i18next doesn't need to.
		escapeValue: false,
	},
});

export default i18n;
