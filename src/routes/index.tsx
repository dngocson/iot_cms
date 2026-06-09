import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import HomePageStatusLabel from "#/components/custom/homepage/HomePageStatusLabel";
import { HomePageTodayString } from "#/components/custom/homepage/HomePageTodayTimeString";
import HomePageUpdatedTimeString from "#/components/custom/homepage/HomePageUpdatedTimeString";
export const Route = createFileRoute("/")({ component: Home });

function Home() {
	const { t } = useTranslation();
	return (
		<div className="p-8 flex flex-col gap-6">
			<div className="flex items-end justify-between">
				<div>
					<HomePageTodayString date={new Date()} />
					<h1>{t("home.overview")}</h1>
					<HomePageUpdatedTimeString updatedAt={new Date()} />
				</div>
				<HomePageStatusLabel />
			</div>
		</div>
	);
}
