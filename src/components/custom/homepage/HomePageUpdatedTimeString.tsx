import { format } from "date-fns";
import { Timer } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = {
	updatedAt: Date;
};

const HomePageUpdatedTimeString = ({ updatedAt }: Props) => {
	const { t } = useTranslation();

	return (
		<div className="flex items-center gap-2 ">
			<Timer size={16} className="shrink-0" />
			<span>
				{t("home.overviewTime", {
					time: format(updatedAt, "HH:mm"),
					date: format(updatedAt, "dd-MM-yyyy"),
				})}
			</span>
		</div>
	);
};

export default HomePageUpdatedTimeString;
