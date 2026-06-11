import { z } from "zod";
import type { MeterStatus, MeterThreshold } from "#/types/meter";

/** Matches a percentage string such as `"30%"` or `"80.5%"` (whitespace tolerant). */
const PERCENTAGE_PATTERN = /^\s*(\d+(?:\.\d+)?)\s*%\s*$/;

/**
 * Accepts a raw threshold (a finite number or a `"NN%"` string) and resolves it
 * to a comparable number. Percentage strings are validated to stay within
 * `0%`–`100%` inclusive; anything else fails validation with a clear message.
 */
export const thresholdSchema = z
	.union([z.number(), z.string()])
	.transform((raw, ctx) => {
		if (typeof raw === "number") {
			if (!Number.isFinite(raw)) {
				ctx.addIssue({
					code: "custom",
					message: "Threshold number must be finite.",
				});
				return z.NEVER;
			}
			return raw;
		}

		const match = raw.match(PERCENTAGE_PATTERN);
		if (!match) {
			ctx.addIssue({
				code: "custom",
				message: `Invalid threshold "${raw}". Expected a number or a percentage like "80%".`,
			});
			return z.NEVER;
		}

		const percent = Number(match[1]);
		if (percent < 0 || percent > 100) {
			ctx.addIssue({
				code: "custom",
				message: `Percentage threshold "${raw}" must be between 0% and 100%.`,
			});
			return z.NEVER;
		}
		return percent;
	});

/**
 * Parse a raw threshold into a comparable number.
 * Throws a `ZodError` when the threshold is invalid.
 */
export function parseThreshold(threshold: MeterThreshold): number {
	const result = thresholdSchema.safeParse(threshold);
	if (!result.success) {
		throw new Error(result.error.issues[0].message);
	}
	return result.data;
}

/**
 * Resolve the status of a meter reading against its thresholds.
 *
 * - `value` is `undefined`        → `"noConnection"`
 * - `value < goodThreshold`       → `"good"`
 * - `goodThreshold ≤ value < bad` → `"warning"`
 * - `value ≥ badThreshold`        → `"bad"`
 */
export function getMeterStatus(
	value: number | undefined,
	goodThreshold: MeterThreshold,
	badThreshold: MeterThreshold,
): MeterStatus {
	if (value === undefined) {
		return "noConnection";
	}

	const good = parseThreshold(goodThreshold);
	const bad = parseThreshold(badThreshold);

	if (value < good) {
		return "good";
	}
	if (value < bad) {
		return "warning";
	}
	return "bad";
}
