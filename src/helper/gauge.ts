import { getMeterStatus } from "#/helper/meter-status";
import type { GaugeData, GaugeTick, NormalizedGauge } from "#/types/gauge";
import type { MeterStatus } from "#/types/meter";

/** Fallback range used when min/max are missing or invalid. */
const FALLBACK = { min: 0, max: 100 } as const;

const clamp = (value: number, low: number, high: number) =>
	Math.min(Math.max(value, low), high);

const isFiniteNumber = (value: unknown): value is number =>
	typeof value === "number" && Number.isFinite(value);

const toFinite = (value: unknown, fallback: number) =>
	isFiniteNumber(value) ? value : fallback;

/** Trim floating-point noise so generated ticks compare/dedupe cleanly. */
const round = (value: number) => Math.round(value * 1e4) / 1e4;

/**
 * Health status of a tick/value against the gauge thresholds. Thin wrapper over
 * the shared `getMeterStatus` so the gauge and the rest of the app classify
 * readings identically (safe → `good`, warning, critical → `bad`).
 */
export function getZoneStatus(
	value: number,
	lowLevel: number,
	highLevel: number,
): Exclude<MeterStatus, "noConnection"> {
	// `value` is always finite here, so this never resolves to `noConnection`.
	return getMeterStatus(value, lowLevel, highLevel) as Exclude<
		MeterStatus,
		"noConnection"
	>;
}

/**
 * Validate and clamp raw gauge input into safe, render-ready values.
 *
 * Handles every required edge case:
 * - missing/`NaN`/`Infinity` numbers fall back to sensible defaults,
 * - `min >= max` is widened to a positive range,
 * - thresholds are clamped into the range and, if `lowLevel >= highLevel`,
 *   the warning zone collapses instead of producing inverted segments,
 * - `current < min` / `current > max` are clamped for positioning while the
 *   real value is preserved for display and status.
 */
export function normalizeGaugeData(
	data: Partial<GaugeData> | undefined,
): NormalizedGauge {
	const min = toFinite(data?.min, FALLBACK.min);
	let max = toFinite(data?.max, FALLBACK.max);
	if (max <= min) {
		max = min + (FALLBACK.max - FALLBACK.min);
	}

	const span = max - min;
	const lowLevel = clamp(toFinite(data?.lowLevel, min + span / 3), min, max);
	let highLevel = clamp(
		toFinite(data?.highLevel, min + (span * 2) / 3),
		min,
		max,
	);
	// Invalid ordering (lowLevel >= highLevel) collapses the warning zone rather
	// than drawing an inverted band.
	if (highLevel < lowLevel) {
		highLevel = lowLevel;
	}

	const hasCurrent = isFiniteNumber(data?.current);
	const current = hasCurrent ? (data?.current as number) : null;
	const clampedCurrent = hasCurrent ? clamp(current as number, min, max) : min;

	let outOfRange: NormalizedGauge["outOfRange"] = null;
	if (hasCurrent && (current as number) < min) outOfRange = "below";
	else if (hasCurrent && (current as number) > max) outOfRange = "above";

	const status: MeterStatus = hasCurrent
		? getMeterStatus(current as number, lowLevel, highLevel)
		: "noConnection";

	const fraction = span === 0 ? 0 : (clampedCurrent - min) / span;

	return {
		min,
		max,
		lowLevel,
		highLevel,
		current,
		clampedCurrent,
		status,
		fraction,
		outOfRange,
	};
}

/**
 * Build the scale ticks for the gauge.
 *
 * Produces `segments` evenly spaced major ticks across `[min, max]`, always
 * includes the two threshold values as labeled majors, and fills the gaps with
 * minor ticks. Everything is derived from the data — no hardcoded positions.
 */
export function generateGaugeTicks(
	min: number,
	max: number,
	lowLevel: number,
	highLevel: number,
	segments = 5,
	minorPerSegment = 5,
): GaugeTick[] {
	const span = max - min;
	if (span <= 0 || segments <= 0) {
		return [{ value: round(min), major: true }];
	}

	const majorStep = span / segments;
	const majors = new Set<number>();
	for (let i = 0; i <= segments; i++) {
		majors.add(round(min + i * majorStep));
	}
	// Surface the thresholds so operators can read the zone boundaries.
	majors.add(round(clamp(lowLevel, min, max)));
	majors.add(round(clamp(highLevel, min, max)));

	const values = new Map<number, boolean>();
	for (const value of majors) values.set(value, true);

	const minorStep = majorStep / minorPerSegment;
	for (let i = 0; i < segments; i++) {
		for (let j = 1; j < minorPerSegment; j++) {
			const value = round(min + i * majorStep + j * minorStep);
			if (!values.has(value)) values.set(value, false);
		}
	}

	return Array.from(values.entries())
		.map(([value, major]) => ({ value, major }))
		.sort((a, b) => a.value - b.value);
}
