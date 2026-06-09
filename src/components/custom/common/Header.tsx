import { motion } from "motion/react";
import { HeaderActions } from "./HeaderActions";
import { HeaderNav } from "./HeaderNav";

export function Header() {
	return (
		<motion.header
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: "easeOut" }}
			className="bg-linear-to-r from-amber-100 to-yellow-100 border-b border-amber-200 shadow-sm"
		>
			<div className="h-20 px-6 flex items-center w-full">
				<HeaderNav />
				<HeaderActions />
			</div>
		</motion.header>
	);
}
