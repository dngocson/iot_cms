import { useLocation, useNavigate, useRouter } from "@tanstack/react-router";
import {
	Archive,
	CircleGauge,
	Droplet,
	Fan,
	LayoutGrid,
	MessageCircleWarning,
	TriangleAlert,
} from "lucide-react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { startTransition, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const headerLinks = [
	{
		href: "/",
		icon: <LayoutGrid className="w-5 h-5" />,
		translationKey: "header.nav.dashboard",
	},
	{
		href: "/about-us",
		icon: <TriangleAlert className="w-5 h-5" />,
		translationKey: "header.nav.aboutUs",
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

/**
 * Header navigation buttons. Owns the location subscription so that route
 * changes only re-render this section, not the whole header.
 */
export function HeaderNav() {
	const navigate = useNavigate();
	const location = useLocation();
	const { t } = useTranslation();
	const router = useRouter();

	// Optimistic active path. TanStack Router commits navigation inside
	// `React.startTransition`, and `useLocation()` updates as part of that same
	// transition — the one that also renders the (heavy) target route. If the
	// button's active state were driven straight off `location.pathname`, the
	// expand/rotate/pulse animation would be queued behind the route render and
	// only start after it commits (the ~265ms click handler).
	//
	// Driving the animation off this local state instead lets us flip it at
	// urgent priority the moment the user clicks, so the header animates and
	// paints first while the page render proceeds in the background transition.
	const [activePath, setActivePath] = useState(location.pathname);

	// Keep in sync with navigations that don't originate here (back/forward,
	// redirects, links elsewhere in the app).
	useEffect(() => {
		setActivePath(location.pathname);
	}, [location.pathname]);

	useEffect(() => {
		router.preloadRoute({
			to: "/about-us",
		});
	}, [router]);

	const handleNavigation = (href: string) => {
		if (href === activePath) return;

		setActivePath(href);

		startTransition(() => {
			navigate({ to: href });
		});
	};

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			className="hidden lg:flex items-center gap-3 ml-auto"
		>
			{headerLinks.map((link) => {
				const isActive = activePath === link.href;

				return (
					<motion.button
						key={link.href}
						onClick={() => handleNavigation(link.href)}
						onMouseEnter={() => {
							router.preloadRoute({
								to: link.href,
							});
						}}
						animate={{
							width: isActive ? "auto" : "40px",
						}}
						transition={{
							type: "tween",
							stiffness: 300,
							damping: 22,
						}}
						className="relative flex items-center justify-center overflow-hidden rounded-full bg-white border-2 border-amber-300 shadow-sm text-amber-900 cursor-pointer"
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
							}}
							transition={{
								rotate: {
									type: "spring",
									stiffness: 200,
									damping: 15,
								},
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
	);
}
