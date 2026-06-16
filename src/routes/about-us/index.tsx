import { createFileRoute } from "@tanstack/react-router";
import { GaugeChart } from "#/components/custom/charts/GaugeChart";

export const Route = createFileRoute("/about-us/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-col">
			<div className="grid grid-cols-5">
				<GaugeChart
					label="COD"
					unit="mg/l"
					data={{ min: 0, max: 200, current: 85, lowLevel: 20, highLevel: 140 }}
				/>
			</div>
		</div>
	);
}
