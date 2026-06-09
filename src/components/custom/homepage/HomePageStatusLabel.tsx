import { useTranslation } from "react-i18next";

const LABEL = [
	{
		label: "good",
		color: "bg-green-500",
	},
	{
		label: "warning",
		color: "bg-yellow-500",
	},
	{
		label: "bad",
		color: "bg-red-500",
	},
	{
		label: "noConnection",
		color: "bg-black",
	},
] as const;

const HomePageStatusLabel = () => {
	const { t } = useTranslation();
	return (
		<div className="grid grid-cols-4 rounded-lg overflow-hidden">
			{LABEL.map((item) => (
				<div
					key={item.label}
					className={`${item.color} px-4 py-2 flex items-center justify-center text-white font-bold `}
				>
					<span className="text-base">{t(`home.labels.${item.label}`)}</span>
				</div>
			))}
		</div>
	);
};

export default HomePageStatusLabel;
