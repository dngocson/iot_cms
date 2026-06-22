import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { DataTable } from "#/components/custom/data-table/DataTable";
import { useTableData } from "#/hooks/use-table-data";
import { useUpdateRecordDate } from "#/hooks/use-update-record-date";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/records/")({
	component: RecordsPage,
});

function RecordsPage() {
	const { t } = useTranslation();
	const { data, isLoading, isError, refetch } = useTableData();
	const { mutate } = useUpdateRecordDate();

	const handleUpdateDate = useCallback(
		(id: string, isoDate: string) => mutate({ id, isoDate }),
		[mutate],
	);

	return (
		<div className="flex flex-col gap-6 p-8">
			<div>
				<h1 className="text-2xl font-semibold">{t("records.title")}</h1>
				<p className="text-muted-foreground">{t("records.subtitle")}</p>
			</div>

			{isLoading && (
				<p className="text-muted-foreground">{t("states.loading")}</p>
			)}

			{isError && (
				<div className="flex items-center gap-3">
					<p className="text-destructive">{t("states.error")}</p>
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						{t("actions.retry")}
					</Button>
				</div>
			)}

			{!isLoading && !isError && (
				<DataTable data={data ?? []} onUpdateDate={handleUpdateDate} />
			)}
		</div>
	);
}
