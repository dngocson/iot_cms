import { useLocation, useNavigate } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { headerLinks } from "./HeaderNav";

/**
 * Hamburger navigation shown on mobile and tablet (below `lg`). The inline
 * {@link HeaderNav} pills take over from `lg` upwards. Reuses `headerLinks` so
 * both navigations stay in sync.
 */
export function MobileNav() {
	const navigate = useNavigate();
	const location = useLocation();
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);

	const handleNavigation = (href: string) => {
		navigate({ to: href });
		setOpen(false);
	};

	return (
		<div className="lg:hidden">
			<DropdownMenu open={open} onOpenChange={setOpen}>
				<DropdownMenuTrigger
					render={
						<Button
							variant="ghost"
							size="icon"
							className="size-11 rounded-full border-2 border-amber-300 text-amber-700 hover:bg-amber-50"
							aria-label={t("common.menu")}
							title={t("common.menu")}
						>
							<Menu className="size-5" />
						</Button>
					}
				/>
				<DropdownMenuContent align="start" className="min-w-56">
					<DropdownMenuGroup>
						<DropdownMenuLabel>{t("common.menu")}</DropdownMenuLabel>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					{headerLinks.map((link) => {
						const isActive = location.pathname === link.href;

						return (
							<DropdownMenuItem
								key={link.href}
								onClick={() => handleNavigation(link.href)}
								className={cn(
									"gap-2.5",
									isActive && "bg-amber-100 font-semibold text-amber-900",
								)}
							>
								{link.icon}
								<span>{t(link.translationKey)}</span>
							</DropdownMenuItem>
						);
					})}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
