/**
 * Shared meter/threshold types.
 *
 * Keep these generic so any feature that renders sensor readings (homepage,
 * dashboards, tables) can describe thresholds and statuses the same way.
 */

/**
 * A threshold can be expressed as a raw number (e.g. `30`, `80`) or as a
 * percentage string (e.g. `"30%"`, `"80%"`). Percentage strings are validated
 * to fall within `0%`–`100%` when parsed.
 */
export type MeterThreshold = number | string;

/** Health status of a single meter reading. */
export type MeterStatus = "good" | "warning" | "bad" | "noConnection";
