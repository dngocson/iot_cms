import type { MeterStatus } from "#/types/meter";

/**
 * Presentation config (badge color + translation key) for each meter status.
 * Declared with `satisfies` so `labelKey` stays a literal type and remains
 * compatible with i18next's typed translation keys.
 */
export const METER_STATUS_CONFIG = {
	good: { color: "#148228", labelKey: "home.labels.good" },
	warning: { color: "#F59E0B", labelKey: "home.labels.warning" },
	bad: { color: "#C23330", labelKey: "home.labels.bad" },
	noConnection: { color: "#000000", labelKey: "home.labels.noConnection" },
} as const satisfies Record<MeterStatus, { color: string; labelKey: string }>;

/** Display order used by the status legend. */
export const METER_STATUS_ORDER: MeterStatus[] = [
	"good",
	"warning",
	"bad",
	"noConnection",
];
