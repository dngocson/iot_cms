import { getMeterStatus } from "#/helper/meter-status";
import { cn } from "#/lib/utils";
import type { MeterThreshold } from "#/types/meter";
import { METER_STATUS_CONFIG } from "./meter-status-config";

type MeterStatusIndicatorProps = {
	/** Latest reading. `undefined` is treated as a lost connection. */
	value: number | undefined;
	/** Below this threshold the reading is "good". */
	goodThreshold: MeterThreshold;
	/** At or above this threshold the reading is "bad". */
	badThreshold: MeterThreshold;
	/** Hide the text label and show only the colored dot. */
	className?: string;
	name: string;
	unit: string;
};

/**
 * Reusable health indicator for a single meter reading. Derives its status from
 * the value/threshold rules and renders a colored dot with an optional label.
 */
const MeterStatusIndicator = ({
	value,
	goodThreshold,
	badThreshold,
	className,
	name,
	unit,
}: MeterStatusIndicatorProps) => {
	const status = getMeterStatus(value, goodThreshold, badThreshold);
	const { color } = METER_STATUS_CONFIG[status];
	return (
		<div
			style={{
				backgroundColor: color,
			}}
			className={cn(
				"flex items-center gap-2 w-full h-full flex-col rounded-2xl border p-3 text-white",
				className,
				color,
			)}
		>
			<span className="self-start">{name}</span>
			<span className="font-bold tabular-nums text-2xl">{value ?? "--"}</span>
			<span className="self-end">{unit}</span>
		</div>
	);
};

export default MeterStatusIndicator;
