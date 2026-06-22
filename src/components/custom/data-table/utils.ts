import { format, isValid, parse } from "date-fns";

/**
 * Date helpers for the data table.
 *
 * Single source of truth for the two date shapes the app uses:
 * - internal/stored: ISO `yyyy-MM-dd` (sortable, unambiguous)
 * - displayed/edited: `dd-MM-yyyy`
 */

export const ISO_DATE_FORMAT = "yyyy-MM-dd";
export const DISPLAY_DATE_FORMAT = "dd-MM-yyyy";

/** Parse an ISO `yyyy-MM-dd` string into a `Date`. */
export function parseISODate(iso: string): Date {
	return parse(iso, ISO_DATE_FORMAT, new Date());
}

/** Format a `Date` as an ISO `yyyy-MM-dd` string. */
export function dateToISO(date: Date): string {
	return format(date, ISO_DATE_FORMAT);
}

/** Format an ISO `yyyy-MM-dd` string for display as `dd-MM-yyyy`. */
export function isoToDisplay(iso: string): string {
	const date = parseISODate(iso);
	return isValid(date) ? format(date, DISPLAY_DATE_FORMAT) : iso;
}

/** Convert a displayed `dd-MM-yyyy` string back to ISO `yyyy-MM-dd`. */
export function displayToISO(display: string): string {
	return dateToISO(parse(display, DISPLAY_DATE_FORMAT, new Date()));
}
