import { createFileRoute } from "@tanstack/react-router";
import { GaugeChart } from "#/components/custom/charts/GaugeChart";

export const Route = createFileRoute("/about-us/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<div className="w-100">
				<GaugeChart
					label="COD"
					unit="mg/l"
					data={{ min: 0, max: 200, current: 80, lowLevel: 60, highLevel: 150 }}
				/>
			</div>
		</div>
	);
}
