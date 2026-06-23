import { createFileRoute } from "@tanstack/react-router";
import { MonitoringLineChart } from "#/components/custom/charts/MonitoringLineChart";
import { waterMonitoringMockData } from "#/constant/mockData";

export const Route = createFileRoute("/water-monitoring/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="container mx-auto px-4 py-6">
			<MonitoringLineChart data={waterMonitoringMockData} />
		</div>
	);
}
