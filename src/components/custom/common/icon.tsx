import {
	ArrowDown,
	ArrowUp,
	ArrowUpRight,
	Atom,
	Award,
	Briefcase,
	Building2,
	CalendarDays,
	Check,
	ChevronRight,
	Copy,
	Download,
	ExternalLink,
	FileText,
	FlaskConical,
	Globe,
	GraduationCap,
	Handshake,
	HeartHandshake,
	Languages,
	Linkedin,
	type LucideIcon,
	Mail,
	MapPin,
	Medal,
	Menu,
	Moon,
	PackageCheck,
	Phone,
	Presentation,
	Quote,
	Sparkles,
	Star,
	Sun,
	Trophy,
	UserPlus,
	Users,
	X,
} from "lucide-react";

const iconMap = {
	ArrowDown,
	ArrowUp,
	ArrowUpRight,
	Atom,
	Award,
	Briefcase,
	Building2,
	CalendarDays,
	Check,
	ChevronRight,
	Copy,
	Download,
	ExternalLink,
	FileText,
	FlaskConical,
	Globe,
	GraduationCap,
	Handshake,
	HeartHandshake,
	Languages,
	Linkedin,
	Mail,
	MapPin,
	Medal,
	Menu,
	Moon,
	PackageCheck,
	Phone,
	Presentation,
	Quote,
	Sparkles,
	Star,
	Sun,
	Trophy,
	UserPlus,
	Users,
	X,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof iconMap;

interface IconProps extends React.ComponentProps<LucideIcon> {
	name: IconName | string;
}

/** Resolves a lucide icon by name; renders nothing for unknown names. */
export function Icon({ name, ...props }: IconProps) {
	const Component = iconMap[name as IconName];
	if (!Component) return null;
	return <Component {...props} />;
}
