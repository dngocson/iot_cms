import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "#/store/settings-store";
import { Button } from "@/components/ui/button";
import { Icon } from "../custom/common/icon";

export function ThemeToggle() {
	const theme = useSettingsStore((s) => s.theme);
	const toggleTheme = useSettingsStore((s) => s.toggleTheme);
	const { t } = useTranslation();
	const isDark = theme === "dark";

	return (
		<Button
			variant="ghost"
			size="icon"
			className="size-11 lg:size-9"
			onClick={toggleTheme}
			aria-label={isDark ? t("common.lightMode") : t("common.darkMode")}
			title={isDark ? t("common.lightMode") : t("common.darkMode")}
		>
			<AnimatePresence mode="wait" initial={false}>
				<motion.span
					key={theme}
					initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
					animate={{ rotate: 0, opacity: 1, scale: 1 }}
					exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
					transition={{ duration: 0.2 }}
					className="flex items-center justify-center"
				>
					<Icon name={isDark ? "Sun" : "Moon"} className="size-[1.15rem]" />
				</motion.span>
			</AnimatePresence>
		</Button>
	);
}
