import { displayToISO } from "#/components/custom/data-table/utils";
import { A_COLUMN_KEYS, type SensorRecord } from "#/types/record";

/**
 * Mock records API.
 *
 * Stands in for a real backend while one is not available. It keeps an
 * in-memory store so edits persist across refetches (mirroring real server
 * behaviour). To switch to a real backend, replace the bodies of
 * `fetchRecords` / `updateRecordDate` with `api.get`/`api.patch` calls — the
 * hooks and UI consuming them do not change.
 */

/** Simulate network latency so loading/optimistic states are observable. */
function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Build the A1–A12 reading values for a seeded row (deterministic). */
function buildReadings(seed: number): Record<string, number> {
	const readings: Record<string, number> = {};
	for (let i = 0; i < A_COLUMN_KEYS.length; i++) {
		// Deterministic variation around 100 so columns differ and sort visibly.
		readings[A_COLUMN_KEYS[i]] = 100 + ((seed * 7 + i * 13) % 50);
	}
	return readings;
}

/** Seed the store: the provided sample row plus generated history. */
function createSeedData(): SensorRecord[] {
	const baseIso = displayToISO("23-04-2026");
	const baseTime = new Date(baseIso).getTime();
	const DAY_MS = 24 * 60 * 60 * 1000;

	const sample: SensorRecord = {
		id: "rec-0",
		date: baseIso,
		...(Object.fromEntries(A_COLUMN_KEYS.map((key) => [key, 100])) as Record<
			string,
			number
		>),
	} as SensorRecord;

	const generated: SensorRecord[] = Array.from({ length: 23 }, (_, index) => {
		const day = index + 1;
		const iso = new Date(baseTime - day * DAY_MS).toISOString().slice(0, 10);
		return {
			id: `rec-${day}`,
			date: iso,
			...buildReadings(day),
		} as SensorRecord;
	});

	return [sample, ...generated];
}

/** In-memory store. Replace with the real backend when available. */
let store: SensorRecord[] = createSeedData();

/** Fetch all records. */
export async function fetchRecords(): Promise<SensorRecord[]> {
	await delay(500);
	// Return a copy so callers never mutate the store directly.
	return store.map((record) => ({ ...record }));
}

/** Update a single record's date and return the updated record. */
export async function updateRecordDate(
	id: string,
	isoDate: string,
): Promise<SensorRecord> {
	await delay(300);

	const target = store.find((record) => record.id === id);
	if (!target) {
		throw new Error(`Record "${id}" not found`);
	}

	store = store.map((record) =>
		record.id === id ? { ...record, date: isoDate } : record,
	);

	return { ...target, date: isoDate };
}
