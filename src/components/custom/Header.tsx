import { useLocation, useNavigate } from "@tanstack/react-router";
import {
	Archive,
	CircleGauge,
	Droplet,
	Fan,
	Globe,
	LayoutGrid,
	MessageCircleWarning,
	TriangleAlert,
	User,
} from "lucide-react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { useTranslation } from "react-i18next";
import { LANGUAGES, type LanguageCode } from "#/constants/languages";
import { useSettingsStore } from "#/store/settings-store";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const headerLinks = [
	{
		href: "/",
		icon: <LayoutGrid className="w-5 h-5" />,
		translationKey: "header.nav.dashboard",
	},
	{
		href: "/about-us",
		icon: <TriangleAlert className="w-5 h-5" />,
		translationKey: "nav.aboutUs",
	},
	{
		href: "/water-monitoring",
		icon: <Droplet className="w-5 h-5" />,
		translationKey: "header.nav.waterMonitoring",
	},
	{
		href: "/air-monitoring",
		icon: <Fan className="w-5 h-5" />,
		translationKey: "header.nav.airMonitoring",
	},
	{
		href: "/water-meter",
		icon: <CircleGauge className="w-5 h-5" />,
		translationKey: "header.nav.settings",
	},
	{
		href: "/records",
		icon: <MessageCircleWarning className="w-5 h-5" />,
		translationKey: "header.nav.records",
	},
	{
		href: "/warning-logs",
		icon: <Archive className="w-5 h-5" />,
		translationKey: "header.nav.alerts",
	},
] as const;

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

export function Header() {
	const navigate = useNavigate();
	const location = useLocation();
	const { t } = useTranslation();
	const { language, setLanguage } = useSettingsStore();

	const handleNavigation = (href: string) => {
		navigate({ to: href });
	};

	const handleLanguageChange = (languageCode: string) => {
		setLanguage(languageCode as LanguageCode);
	};

	return (
		<motion.header
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: "easeOut" }}
			className="bg-linear-to-r from-amber-100 to-yellow-100 border-b border-amber-200 shadow-sm"
		>
			<div className="h-20 px-6 flex items-center w-full">
				{/* Left Navigation Icons */}
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="flex items-center gap-3 ml-auto"
				>
					{headerLinks.map((link) => {
						const isActive = location.pathname === link.href;

						return (
							<motion.button
								key={link.href}
								onClick={() => handleNavigation(link.href)}
								animate={{
									width: isActive ? "auto" : "40px",
								}}
								transition={{
									type: "tween",
									stiffness: 300,
									damping: 22,
								}}
								className="relative flex items-center overflow-hidden rounded-full bg-white border-2 border-amber-300 shadow-sm text-amber-900 cursor-pointer"
								style={{
									height: "40px",
									minWidth: "40px",
									paddingLeft: isActive ? "10px" : "0",
									paddingRight: isActive ? "14px" : "0",
								}}
								title={t(link.translationKey)}
							>
								<AnimatePresence>
									{isActive && (
										<motion.span
											key="pulse"
											className="absolute inset-0 rounded-full border-2 border-amber-300 pointer-events-none"
											initial={{ scale: 1, opacity: 0.7 }}
											animate={{ scale: 1.3, opacity: 0 }}
											exit={{ opacity: 0 }}
											transition={{
												duration: 1.5,
												repeat: Infinity,
												ease: "easeOut",
											}}
										/>
									)}
								</AnimatePresence>

								{/* Icon */}
								<motion.div
									className="flex items-center justify-center shrink-0"
									style={{ width: "24px", height: "24px" }}
									animate={{
										rotate: isActive ? 360 : 0,
										marginLeft: isActive ? "0px" : "auto",
										marginRight: isActive ? "0px" : "auto",
									}}
									transition={{
										rotate: {
											type: "spring",
											stiffness: 200,
											damping: 15,
										},
										marginLeft: { duration: 0.3 },
										marginRight: { duration: 0.3 },
									}}
								>
									{link.icon}
								</motion.div>

								<AnimatePresence>
									{isActive && (
										<motion.span
											key="label"
											className="text-sm font-semibold text-amber-900 whitespace-nowrap overflow-hidden"
											initial={{ opacity: 0, width: 0, marginLeft: 0 }}
											animate={{ opacity: 1, width: "auto", marginLeft: "8px" }}
											exit={{ opacity: 0, width: 0, marginLeft: 0 }}
											transition={{ duration: 0.25, delay: 0.1 }}
										>
											{t(link.translationKey)}
										</motion.span>
									)}
								</AnimatePresence>
							</motion.button>
						);
					})}
				</motion.div>

				{/* Right Section */}
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="flex items-center gap-4 ml-12"
				>
					{/* Language & User icons */}
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						className="flex items-center gap-3"
					>
						<DropdownMenu>
							<DropdownMenuTrigger>
								<motion.button
									variants={itemVariants}
									className="p-2.5 rounded-full border-2 border-amber-300 hover:bg-amber-50 transition-colors duration-200 text-amber-700"
									title={t("language.label")}
								>
									<Globe className="w-5 h-5" />
								</motion.button>
							</DropdownMenuTrigger>
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

						<motion.button
							variants={itemVariants}
							className="p-2.5 rounded-full border-2 border-amber-300 hover:bg-amber-50 transition-colors duration-200 text-amber-700"
							title="Account"
						>
							<User className="w-5 h-5" />
						</motion.button>
					</motion.div>

					{/* User Greeting */}
					<motion.div
						variants={itemVariants}
						className="flex items-center gap-2 ml-2"
					>
						<div className="text-right">
							<p className="text-xs text-amber-700">{t("header.greeting")}</p>
							<p className="text-sm font-semibold text-amber-900">Robert</p>
						</div>
						<motion.div
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.3, duration: 0.3 }}
							className="w-10 h-10 rounded-full bg-linear-to-br from-blue-300 to-purple-400 flex items-center justify-center text-white font-bold shadow-md"
						>
							R
						</motion.div>
					</motion.div>
				</motion.div>
			</div>
		</motion.header>
	);
}
