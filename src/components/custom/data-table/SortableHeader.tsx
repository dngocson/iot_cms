import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SortableHeaderProps<TData> {
	column: Column<TData, unknown>;
	label: string;
}

/**
 * Clickable column header with a sort-direction indicator. Reused by every
 * sortable column so the sorting UX stays consistent.
 */
export function SortableHeader<TData>({
	column,
	label,
}: SortableHeaderProps<TData>) {
	const sorted = column.getIsSorted();

	return (
		<Button
			variant="ghost"
			size="sm"
			className="-ml-2.5 h-8 gap-1.5 data-[active]:text-foreground"
			data-active={sorted || undefined}
			onClick={() => column.toggleSorting(sorted === "asc")}
		>
			{label}
			{sorted === "asc" ? (
				<ArrowUp className="size-3.5" />
			) : sorted === "desc" ? (
				<ArrowDown className="size-3.5" />
			) : (
				<ChevronsUpDown className="size-3.5 opacity-50" />
			)}
		</Button>
	);
}
