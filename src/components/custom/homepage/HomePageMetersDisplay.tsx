import MeterStatusIndicator from "#/components/custom/common/MeterStatusIndicator";
import type { MeterThreshold } from "#/types/meter";

type HomePageMeter = {
	/** Stable identifier for the meter. */
	id: string;
	/** Latest reading, or `undefined` when the meter is disconnected. */
	current: number | undefined;
	goodThreshold: MeterThreshold;
	badThreshold: MeterThreshold;
};

type HomePageMetersDisplayProps = {
	title: string;
	value: HomePageMeter[];
};

const HomePageMetersDisplay = ({
	title,
	value,
}: HomePageMetersDisplayProps) => {
	return (
		<div className="flex flex-col gap-3">
			<h2 className="text-lg font-semibold">{title}</h2>
			<div className="flex flex-wrap gap-4">
				{value.map((meter) => (
					<div
						key={meter.id}
						className="flex items-center gap-2 rounded-lg border px-3 py-2"
					>
						<span className="font-medium tabular-nums">
							{meter.current ?? "--"}
						</span>
						<MeterStatusIndicator
							value={meter.current}
							goodThreshold={meter.goodThreshold}
							badThreshold={meter.badThreshold}
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default HomePageMetersDisplay;
