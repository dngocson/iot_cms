import { createFileRoute } from "@tanstack/react-router";
import { GaugeChart } from "#/components/custom/charts/GaugeChart";
import { MonitoringLineChart } from "#/components/custom/charts/MonitoringLineChart";
import { WaterMeterAlertStats } from "#/components/custom/water-meter/WaterMeterAlertStats";
import {
	waterMeterAlertStatsMockData,
	waterMonitoringMockData,
} from "#/constant/mockData";

export const Route = createFileRoute("/about-us/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-col w-full gap-6">
			<div className="grid grid-cols-3 p-4 rounded-2xl gap-4 bg-sidebar-foreground ">
				<GaugeChart
					label="COD"
					unit="mg/l"
					data={{ min: 0, max: 200, current: 85, lowLevel: 20, highLevel: 140 }}
				/>
				<GaugeChart
					label="COD"
					unit="mg/l"
					data={{ min: 0, max: 200, current: 15, lowLevel: 20, highLevel: 140 }}
				/>
				<GaugeChart
					label="COD"
					unit="mg/l"
					data={{ min: 0, max: 200, current: 90, lowLevel: 20, highLevel: 140 }}
				/>
				<GaugeChart
					label="COD"
					unit="mg/l"
					data={{ min: 0, max: 200, current: 30, lowLevel: 20, highLevel: 140 }}
				/>
				<GaugeChart
					label="COD"
					unit="mg/l"
					data={{ min: 0, max: 200, current: 45, lowLevel: 20, highLevel: 140 }}
				/>
				<GaugeChart
					label="COD"
					unit="mg/l"
					data={{ min: 0, max: 200, current: 85, lowLevel: 20, highLevel: 140 }}
				/>
			</div>

			<div className="grid grid-cols-2 p-4 rounded-2xl gap-4 bg-sidebar-foreground ">
				<MonitoringLineChart data={waterMonitoringMockData} />
				<WaterMeterAlertStats data={waterMeterAlertStatsMockData} />
			</div>
		</div>
	);
}
