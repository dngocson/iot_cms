import type { defaultNS, resources } from "#/i18n";

/**
 * Type-safe translations: gives autocomplete and compile-time checking of
 * translation keys in `useTranslation()` / `t()`.
 */
declare module "i18next" {
	interface CustomTypeOptions {
		defaultNS: typeof defaultNS;
		resources: (typeof resources)["en"];
	}
}
