/**
 * Sensor record domain types.
 *
 * A record is one timestamped row of readings from sensors A1–A12. Dates are
 * stored internally as ISO `yyyy-MM-dd` strings (sortable + parser-friendly)
 * and only formatted to `dd-MM-yyyy` for display.
 */

/** The 12 sensor columns, declared once and reused by types and table config. */
export const A_COLUMN_KEYS = [
	"A1",
	"A2",
	"A3",
	"A4",
	"A5",
	"A6",
	"A7",
	"A8",
	"A9",
	"A10",
	"A11",
	"A12",
] as const;

export type AColumnKey = (typeof A_COLUMN_KEYS)[number];

/** One row in the data table. */
export type SensorRecord = {
	/** Stable row identity — required for sorting/optimistic updates. */
	id: string;
	/** ISO `yyyy-MM-dd`. Displayed as `dd-MM-yyyy`. */
	date: string;
} & Record<AColumnKey, number>;

/** Payload for editing a record's date. */
export interface UpdateRecordDateInput {
	id: string;
	/** New date as ISO `yyyy-MM-dd`. */
	isoDate: string;
}
