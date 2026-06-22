import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "#/lib/query-keys";
import { fetchRecords } from "#/lib/records-api";
import type { SensorRecord } from "#/types/record";

/**
 * Records query.
 *
 * Owns the server-state read for the data table. UI components consume the
 * returned `data`/`isLoading`/`isError` and stay decoupled from the API layer,
 * so swapping the mock for a real backend touches nothing here.
 */
export function useTableData() {
	return useQuery<SensorRecord[]>({
		queryKey: queryKeys.records.list(),
		queryFn: fetchRecords,
	});
}
