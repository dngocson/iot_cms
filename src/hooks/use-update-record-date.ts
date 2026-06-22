import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "#/lib/query-keys";
import { updateRecordDate } from "#/lib/records-api";
import type { SensorRecord, UpdateRecordDateInput } from "#/types/record";

interface MutationContext {
	previous?: SensorRecord[];
}

/**
 * Optimistic "edit record date" mutation.
 *
 * Writes the new date into the query cache immediately (so the row updates and
 * re-sorts without waiting for the network), rolls back on error, and
 * revalidates on settle. The table re-derives sorting from the cache, so order
 * stays consistent after an edit.
 */
export function useUpdateRecordDate() {
	const queryClient = useQueryClient();
	const queryKey = queryKeys.records.list();

	return useMutation<
		SensorRecord,
		Error,
		UpdateRecordDateInput,
		MutationContext
	>({
		mutationFn: ({ id, isoDate }) => updateRecordDate(id, isoDate),

		onMutate: async ({ id, isoDate }) => {
			// Cancel in-flight refetches so they don't overwrite the optimistic value.
			await queryClient.cancelQueries({ queryKey });

			const previous = queryClient.getQueryData<SensorRecord[]>(queryKey);

			queryClient.setQueryData<SensorRecord[]>(queryKey, (old) =>
				old?.map((record) =>
					record.id === id ? { ...record, date: isoDate } : record,
				),
			);

			return { previous };
		},

		onError: (_error, _input, context) => {
			if (context?.previous) {
				queryClient.setQueryData(queryKey, context.previous);
			}
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey });
		},
	});
}
