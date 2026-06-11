import { useTranslation } from "react-i18next";
import {
	METER_STATUS_CONFIG,
	METER_STATUS_ORDER,
} from "#/components/custom/common/meter-status-config";

const HomePageStatusLabel = () => {
	const { t } = useTranslation();
	return (
		<div className="grid grid-cols-4 rounded-lg overflow-hidden">
			{METER_STATUS_ORDER.map((status) => {
				const { color, labelKey } = METER_STATUS_CONFIG[status];
				return (
					<div
						style={{ backgroundColor: color }}
						key={status}
						className={`px-4 py-2 flex items-center justify-center text-white font-bold `}
					>
						<span className="text-base">{t(labelKey)}</span>
					</div>
				);
			})}
		</div>
	);
};

export default HomePageStatusLabel;
