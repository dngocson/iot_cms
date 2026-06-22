import { useNavigate } from "@tanstack/react-router";
import { Globe } from "lucide-react";
import { motion, type Variants } from "motion/react";
import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LANGUAGES, type LanguageCode } from "#/constants/languages";
import { useAuth } from "#/hooks/use-auth";
import { useSettingsStore } from "#/store/settings-store";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./theme-toggle";

const containerVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.05,
			delayChildren: 0.1,
		},
	},
};

const itemVariants: Variants = {
	hidden: { opacity: 0, y: -10 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			type: "spring",
			stiffness: 100,
			damping: 12,
		},
	},
};

const UserMenu = memo(function UserMenu() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { user, logout } = useAuth();
	const [userModalOpen, setUserModalOpen] = useState(false);

	const handleLogout = () => {
		setUserModalOpen(false);
		logout();
		navigate({ to: "/login" });
	};

	const displayName = user?.name ?? "";
	const initial = displayName.charAt(0).toUpperCase() || "U";

	return (
		<motion.div
			variants={itemVariants}
			className="flex items-center gap-2 ml-2"
		>
			<div className="hidden text-right md:block">
				<p className="text-xs text-amber-700">{t("header.greeting")}</p>
				<p className="text-sm font-semibold text-amber-900">{displayName}</p>
			</div>

			<DropdownMenu open={userModalOpen} onOpenChange={setUserModalOpen}>
				<DropdownMenuTrigger
					render={
						<motion.button
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.3, duration: 0.3 }}
							className="w-10 h-10 rounded-full bg-linear-to-br from-blue-300 to-purple-400 flex items-center justify-center text-white font-bold shadow-md"
						>
							{initial}
						</motion.button>
					}
				/>
				<DropdownMenuContent className="min-w-56">
					<DropdownMenuGroup>
						<DropdownMenuLabel className={"text-md text-black "}>
							{t("home.userModal.label")}
						</DropdownMenuLabel>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem>
						{t("home.userModal.accountSettings")}
					</DropdownMenuItem>
					<DropdownMenuItem>
						{t("home.userModal.accountManagement")}
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={handleLogout}>
						{t("home.userModal.logout")}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</motion.div>
	);
});

export const HeaderActions = memo(function HeaderActions() {
	const { t } = useTranslation();
	const language = useSettingsStore((state) => state.language);
	const setLanguage = useSettingsStore((state) => state.setLanguage);
	const [langOpen, setLangOpen] = useState(false);

	const handleLanguageChange = (languageCode: string) => {
		setLanguage(languageCode as LanguageCode);
		setLangOpen(false);
	};

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			className="flex items-center gap-2 md:gap-4 ml-auto lg:ml-12"
		>
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="flex items-center gap-2 md:gap-3"
			>
				<DropdownMenu open={langOpen} onOpenChange={setLangOpen}>
					<DropdownMenuTrigger
						render={
							<motion.button
								variants={itemVariants}
								className="p-2.5 rounded-full border-2 border-amber-300 hover:bg-amber-50 transition-colors duration-200 text-amber-700"
								title={t("language.label")}
							>
								<Globe className="w-5 h-5" />
							</motion.button>
						}
					/>
					<DropdownMenuContent className="min-w-56">
						<DropdownMenuGroup>
							<DropdownMenuLabel>{t("language.label")}</DropdownMenuLabel>
							<DropdownMenuRadioGroup
								value={language}
								onValueChange={handleLanguageChange}
							>
								{LANGUAGES.map((lang) => (
									<DropdownMenuRadioItem key={lang.code} value={lang.code}>
										{lang.label}
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>

				<ThemeToggle />
			</motion.div>

			<UserMenu />
		</motion.div>
	);
});
