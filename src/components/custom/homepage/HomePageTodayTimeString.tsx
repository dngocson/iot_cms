import { format } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { useSettingsStore } from "#/store/settings-store";

type Props = {
	date: Date;
};

export function HomePageTodayString({ date }: Props) {
	const language = useSettingsStore((state) => state.language);

	const locale = language === "vi" ? vi : enUS;

	const formatString =
		language === "vi"
			? "EEEE, 'ngày' dd 'tháng' MM 'năm' yyyy"
			: "EEEE, MMMM dd, yyyy";

	const formatted = format(date, formatString, { locale });

	return <span>{formatted.charAt(0).toUpperCase() + formatted.slice(1)}</span>;
}
