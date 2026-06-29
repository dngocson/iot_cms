import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import { GaugeChart } from "#/components/custom/charts/GaugeChart";
import { MonitoringLineChart } from "#/components/custom/charts/MonitoringLineChart";
import { DataTable } from "#/components/custom/data-table/DataTable";
import { DataTableSkeleton } from "#/components/custom/data-table/DataTableSkeleton";
import { WaterMeterAlertStats } from "#/components/custom/water-meter/WaterMeterAlertStats";
import {
	waterMeterAlertStatsMockData,
	waterMonitoringMockData,
} from "#/constant/mockData";
import { useTableData } from "#/hooks/use-table-data";

export const Route = createFileRoute("/about-us/")({
	component: RouteComponent,
});

// Memoize gauge data to prevent recreating objects
const GAUGE_DATA = [
	{ min: 0, max: 200, current: 85, lowLevel: 20, highLevel: 140 },
	{ min: 0, max: 200, current: 15, lowLevel: 20, highLevel: 140 },
	{ min: 0, max: 200, current: 90, lowLevel: 20, highLevel: 140 },
	{ min: 0, max: 200, current: 30, lowLevel: 20, highLevel: 140 },
	{ min: 0, max: 200, current: 45, lowLevel: 20, highLevel: 140 },
	{ min: 0, max: 200, current: 85, lowLevel: 20, highLevel: 140 },
] as const;

function RouteComponent() {
	const { data, isLoading, isError } = useTableData();

	// Stabilize callback with useCallback
	const handleUpdateDate = useCallback((_id: string, _isoDate: string) => {
		// TODO: Implement date update logic
	}, []);

	// Memoize gauge charts to prevent unnecessary re-renders
	const gaugeCharts = useMemo(
		() =>
			GAUGE_DATA.map((gaugeData, index) => (
				<GaugeChart
					key={`cod-${index}`}
					label="COD"
					unit="mg/l"
					data={gaugeData}
				/>
			)),
		[]
	);

	return (
		<div className="flex flex-col w-full gap-4 md:gap-6 pb-6">
			{/* Gauge Charts Grid - Responsive: 1 col mobile, 2 cols tablet, 3 cols desktop */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-3 md:p-4 rounded-xl md:rounded-2xl gap-3 md:gap-4 bg-sidebar-foreground">
				{gaugeCharts}
			</div>

			{/* Charts Grid - Responsive: 1 col mobile, 2 cols desktop */}
			<div className="grid grid-cols-1 lg:grid-cols-2 p-3 md:p-4 rounded-xl md:rounded-2xl gap-3 md:gap-4 bg-sidebar-foreground">
				<MonitoringLineChart data={waterMonitoringMockData} />
				<WaterMeterAlertStats data={waterMeterAlertStatsMockData} />
			</div>

			{/* Data Table with Loading State */}
			{isLoading ? (
				<DataTableSkeleton rows={5} />
			) : isError ? (
				<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
					<p className="text-sm text-destructive">
						Failed to load data. Please try again.
					</p>
				</div>
			) : (
				<DataTable data={data ?? []} onUpdateDate={handleUpdateDate} />
			)}
		</div>
	);
}
