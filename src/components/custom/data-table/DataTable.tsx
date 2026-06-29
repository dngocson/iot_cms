import {
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { SensorRecord } from "#/types/record";
import { Button } from "@/components/ui/button";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
} from "@/components/ui/pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { createRecordColumns } from "./columns";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const DEFAULT_PAGE_SIZE = 10;

interface DataTableProps {
	data: SensorRecord[];
	/** Commit a new ISO date for a row (parent owns the optimistic mutation). */
	onUpdateDate: (id: string, isoDate: string) => void;
}

/**
 * Records data table: sortable, paginated, with an editable date column.
 *
 * Pure presentation + table mechanics — it receives rows and an update
 * callback and holds no fetching/mutation logic. Columns and the table
 * instance are memoized to avoid needless re-renders.
 *
 * Pagination/sorting are kept client-side here but modelled as state objects,
 * so switching to a server-driven table is a matter of setting
 * `manualPagination`/`manualSorting` and feeding the state to the query.
 */
export function DataTable({ data, onUpdateDate }: DataTableProps) {
	const { t } = useTranslation();

	const [sorting, setSorting] = useState<SortingState>([]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: DEFAULT_PAGE_SIZE,
	});

	const columns = useMemo(
		() => createRecordColumns(t, onUpdateDate),
		[t, onUpdateDate],
	);

	const table = useReactTable({
		data,
		columns,
		state: { sorting, pagination },
		onSortingChange: setSorting,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getRowId: (row) => row.id,
		// Preserve the current page when a row's date is edited optimistically.
		autoResetPageIndex: false,
		// Client-side for now; flip these to go server-side.
		manualPagination: false,
		manualSorting: false,
	});

	const pageCount = table.getPageCount();

	return (
		<div className="flex flex-col gap-3 md:gap-4">
			{/* Horizontal scroll wrapper for mobile */}
			<div className="rounded-lg border overflow-x-auto">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id} className="whitespace-nowrap">
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id} className="whitespace-nowrap">
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center text-muted-foreground"
								>
									{t("states.empty")}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Responsive pagination */}
			<Pagination>
				<div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground">
					<span className="hidden sm:inline">{t("table.rowsPerPage")}</span>
					{PAGE_SIZE_OPTIONS.map((size) => (
						<Button
							key={size}
							variant={pagination.pageSize === size ? "secondary" : "ghost"}
							size="sm"
							onClick={() => table.setPageSize(size)}
							className="h-8 px-2 md:px-3"
						>
							{size}
						</Button>
					))}
				</div>

				<PaginationContent>
					<PaginationItem>
						<span className="px-1 md:px-2 text-xs md:text-sm text-muted-foreground">
							{t("table.pageInfo", {
								page: pagination.pageIndex + 1,
								total: Math.max(pageCount, 1),
							})}
						</span>
					</PaginationItem>
					<PaginationItem>
						<Button
							variant="outline"
							size="icon-sm"
							aria-label={t("table.firstPage")}
							onClick={() => table.firstPage()}
							disabled={!table.getCanPreviousPage()}
							className="h-8 w-8"
						>
							<ChevronsLeft className="h-4 w-4" />
						</Button>
					</PaginationItem>
					<PaginationItem>
						<Button
							variant="outline"
							size="icon-sm"
							aria-label={t("table.previousPage")}
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
							className="h-8 w-8"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
					</PaginationItem>
					<PaginationItem>
						<Button
							variant="outline"
							size="icon-sm"
							aria-label={t("table.nextPage")}
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
							className="h-8 w-8"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</PaginationItem>
					<PaginationItem>
						<Button
							variant="outline"
							size="icon-sm"
							aria-label={t("table.lastPage")}
							onClick={() => table.lastPage()}
							disabled={!table.getCanNextPage()}
							className="h-8 w-8"
						>
							<ChevronsRight />
						</Button>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}
