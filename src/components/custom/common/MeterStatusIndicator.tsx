import { useTranslation } from "react-i18next";
import { getMeterStatus } from "#/lib/meter-status";
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
	showLabel?: boolean;
	className?: string;
};

/**
 * Reusable health indicator for a single meter reading. Derives its status from
 * the value/threshold rules and renders a colored dot with an optional label.
 */
const MeterStatusIndicator = ({
	value,
	goodThreshold,
	badThreshold,
	showLabel = true,
	className,
}: MeterStatusIndicatorProps) => {
	const { t } = useTranslation();
	const status = getMeterStatus(value, goodThreshold, badThreshold);
	const { color, labelKey } = METER_STATUS_CONFIG[status];

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<span className={cn("size-3 shrink-0 rounded-full", color)} aria-hidden />
			{showLabel && <span className="text-sm font-medium">{t(labelKey)}</span>}
		</div>
	);
};

export default MeterStatusIndicator;
