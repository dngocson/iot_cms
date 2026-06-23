import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";

import { A_COLUMN_KEYS, type SensorRecord } from "#/types/record";
import { SortableHeader } from "./SortableHeader";

/**
 * Column definitions for the records table.
 *
 * A factory (not a static array) so the date header can be translated and the
 * editable date cell can be wired to the parent's update handler — while still
 * living outside any component body. Memoize the result in the consumer.
 */
export function createRecordColumns(
	t: TFunction,
	_onUpdateDate: (id: string, isoDate: string) => void,
): ColumnDef<SensorRecord>[] {
	const dateColumn: ColumnDef<SensorRecord> = {
		accessorKey: "date",
		header: ({ column }) => (
			<SortableHeader column={column} label={t("records.columns.date")} />
		),

		cell: ({ getValue }) => (
			// <EditableDateCell
			// 	rowId={row.original.id}
			// 	isoDate={row.original.date}
			// 	onChange={onUpdateDate}
			// />
			<span className="tabular-nums">{getValue<string>()}</span>
		),
		// ISO strings sort chronologically; compare explicitly for clarity.
		sortingFn: (a, b) => a.original.date.localeCompare(b.original.date),
	};

	const readingColumns: ColumnDef<SensorRecord>[] = A_COLUMN_KEYS.map(
		(key) => ({
			accessorKey: key,
			header: ({ column }) => <SortableHeader column={column} label={key} />,
			cell: ({ getValue }) => (
				<span className="tabular-nums">{getValue<number>()}</span>
			),
		}),
	);

	return [dateColumn, ...readingColumns];
}
