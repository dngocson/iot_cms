import type { MeterStatus } from "#/types/meter";

/**
 * Raw input for a gauge reading.
 *
 * - `min` / `max`    — the full displayed range.
 * - `current`        — the live reading rendered as the marker / center value.
 * - `lowLevel`       — boundary between the safe and warning zones.
 * - `highLevel`      — boundary between the warning and critical zones.
 *
 * Zones are derived as: safe `[min, lowLevel)`, warning `[lowLevel, highLevel)`,
 * critical `[highLevel, max]`. All fields are validated/clamped before use, so
 * out-of-range or inconsistent values never break rendering.
 */
export interface GaugeData {
	min: number;
	max: number;
	current: number;
	lowLevel: number;
	highLevel: number;
}

/** Whether the raw `current` fell outside the displayed range. */
export type GaugeOutOfRange = "below" | "above" | null;

/**
 * Sanitized, render-ready gauge values. Produced by `normalizeGaugeData` so the
 * component only ever works with finite, ordered, in-range numbers.
 */
export interface NormalizedGauge {
	min: number;
	max: number;
	lowLevel: number;
	highLevel: number;
	/** The raw reading, or `null` when missing/invalid. */
	current: number | null;
	/** `current` clamped into `[min, max]`; used for the marker/fill position. */
	clampedCurrent: number;
	/** Health status derived from the thresholds (`noConnection` when invalid). */
	status: MeterStatus;
	/** Marker position as a fraction of the range, `0`–`1`. */
	fraction: number;
	/** Set when the raw reading was clamped because it sat outside the range. */
	outOfRange: GaugeOutOfRange;
}

/** A single tick on the gauge scale. */
export interface GaugeTick {
	value: number;
	/** Major ticks get a label and a longer mark; minor ticks are decorative. */
	major: boolean;
}
