import { createFileRoute } from "@tanstack/react-router";
import { WaterMeterAlertStats } from "#/components/custom/water-meter/WaterMeterAlertStats";
import { waterMeterAlertStatsMockData } from "#/constant/mockData";

export const Route = createFileRoute("/water-meter/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="container mx-auto max-w-md px-4 py-6">
			<WaterMeterAlertStats data={waterMeterAlertStatsMockData} />
		</div>
	);
}
