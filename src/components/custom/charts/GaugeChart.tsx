import { Cloud } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
	Label,
	PolarAngleAxis,
	PolarRadiusAxis,
	RadialBar,
	RadialBarChart,
} from "recharts";
import { METER_STATUS_CONFIG } from "#/components/custom/common/meter-status-config";
import {
	generateGaugeTicks,
	getZoneStatus,
	normalizeGaugeData,
} from "#/helper/gauge";
import type { GaugeData } from "#/types/gauge";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

// 270° sweep with the gap at the bottom (matches the design).
const START_ANGLE = 180;
const END_ANGLE = 0;

const ZONE_COLOR = {
	good: METER_STATUS_CONFIG.good.color,
	warning: METER_STATUS_CONFIG.warning.color,
	bad: METER_STATUS_CONFIG.bad.color,
} as const;

// Recharts v3 types these render props with internal shapes (e.g. `x` is
// `string | number`). We compute with plain numbers, so cast the props at the
// call sites rather than fighting the upstream types throughout.
type AngleAxisTicks = ComponentProps<typeof PolarAngleAxis>["ticks"];
type AngleAxisTick = ComponentProps<typeof PolarAngleAxis>["tick"];
type LabelContent = ComponentProps<typeof Label>["content"];

export interface GaugeChartProps {
	/** Range + reading + threshold boundaries. */
	data: GaugeData;
	/** Metric name shown in the header, e.g. `"COD"`. */
	label: string;
	/** Unit appended in the header and shown under the value, e.g. `"mg/l"`. */
	unit?: string;
	/** Leading header icon. Defaults to a cloud, matching the reference design. */
	icon?: ReactNode;
	/** Decimal places for the center value. Default `1`. */
	precision?: number;
	/** Number of labeled segments across the range. Default `5`. */
	segments?: number;
	className?: string;
}

const formatTickLabel = (value: number) =>
	Number.isInteger(value) ? `${value}` : value.toFixed(1);

/**
 * Reusable radial gauge built on shadcn's `ChartContainer` + Recharts.
 *
 * Renders the full `min`–`max` range as a 270° dial: a muted track, a fill arc
 * from `min` to the (clamped) `current` coloured by its zone, a zone-coloured
 * tick scale, a marker at the current position, and the live value at the
 * centre. Safe / warning / critical zones are derived from `lowLevel` /
 * `highLevel`. Fully responsive (scales with its container) and theme-aware
 * (track + text use design tokens).
 */
export function GaugeChart({
	data,
	label,
	unit = "",
	icon,
	precision = 1,
	segments = 5,
	className,
}: GaugeChartProps) {
	const { t } = useTranslation();

	const {
		min,
		max,
		lowLevel,
		highLevel,
		current,
		clampedCurrent,
		status,
		outOfRange,
	} = normalizeGaugeData(data);

	const hasCurrent = current !== null;
	const fillColor =
		status === "noConnection" ? "var(--muted-foreground)" : ZONE_COLOR[status];

	const ticks = generateGaugeTicks(min, max, lowLevel, highLevel, segments);
	const majorValues = new Set(
		ticks.filter((tick) => tick.major).map((tick) => tick.value),
	);
	const tickValues = ticks.map((tick) => tick.value);
	// Ensure the marker position is rendered even if it isn't a scale tick.
	const axisTicks = hasCurrent
		? Array.from(new Set([...tickValues, clampedCurrent]))
		: tickValues;
	const markerEpsilon = (max - min) * 1e-6;

	const chartConfig = {
		value: { label, color: fillColor },
	} satisfies ChartConfig;

	const valueDisplay = hasCurrent
		? (current as number).toFixed(precision)
		: "--";
	const statusLabel = t(METER_STATUS_CONFIG[status].labelKey);
	const title = unit ? `${label} - ${unit}` : label;

	const ariaLabel = hasCurrent
		? t("chart.gaugeSummary", {
				label,
				value: valueDisplay,
				unit,
				status: statusLabel,
				min,
				max,
			})
		: `${label}: ${statusLabel}.`;

	// Draws a tick mark (+ label for majors) or the current-value marker, laid
	// out radially from the chart centre supplied by the polar axis.
	const renderTick = (props: {
		x?: number;
		y?: number;
		cx?: number;
		cy?: number;
		payload?: { value?: number };
	}) => {
		const { cx = 0, cy = 0, x = 0, y = 0 } = props;
		const value = props.payload?.value ?? 0;
		const dx = x - cx;
		const dy = y - cy;
		const r = Math.hypot(dx, dy) || 1;
		const ux = dx / r;
		const uy = dy / r;

		if (hasCurrent && Math.abs(value - clampedCurrent) <= markerEpsilon) {
			const markerRadius = Math.max(4, r * 0.05);
			return (
				<g key={`marker-${value}`}>
					<circle
						cx={cx + ux * r}
						cy={cy + uy * r}
						r={markerRadius}
						fill={fillColor}
						stroke="var(--background)"
						strokeWidth={2}
					/>
				</g>
			);
		}

		const isMajor = majorValues.has(value);
		const color = ZONE_COLOR[getZoneStatus(value, lowLevel, highLevel)];
		const tickLength = isMajor ? r * 0.07 : r * 0.04;
		const labelRadius = r + tickLength + r * 0.12;

		return (
			<g key={`tick-${value}`}>
				<line
					x1={cx + ux * r}
					y1={cy + uy * r}
					x2={cx + ux * (r + tickLength)}
					y2={cy + uy * (r + tickLength)}
					stroke={color}
					strokeWidth={isMajor ? 2 : 1}
					strokeLinecap="round"
					opacity={isMajor ? 0.9 : 0.4}
				/>
				{isMajor ? (
					<text
						x={cx + ux * labelRadius}
						y={cy + uy * labelRadius}
						fill={color}
						fontSize={Math.max(9, r * 0.085)}
						fontWeight={600}
						textAnchor="middle"
						dominantBaseline="central"
					>
						{formatTickLabel(value)}
					</text>
				) : null}
			</g>
		);
	};

	const renderCenter = ({
		viewBox,
	}: {
		viewBox?: { cx?: number; cy?: number; innerRadius?: number };
	}) => {
		if (!viewBox || viewBox.cx == null || viewBox.cy == null) return null;
		const { cx, cy } = viewBox;
		const innerRadius = viewBox.innerRadius ?? 60;
		const valueFont = Math.max(18, innerRadius * 0.5);
		const unitFont = Math.max(10, innerRadius * 0.22);

		return (
			<text x={cx} y={cy} textAnchor="middle">
				<tspan
					x={cx}
					y={cy}
					fontSize={valueFont}
					fontWeight={700}
					fill={fillColor}
				>
					{valueDisplay}
				</tspan>
				{unit ? (
					<tspan
						x={cx}
						y={cy + valueFont * 0.85}
						fontSize={unitFont}
						fill="var(--muted-foreground)"
					>
						{unit}
					</tspan>
				) : null}
			</text>
		);
	};

	return (
		<Card className={cn("w-full", className)}>
			<CardHeader className="items-center">
				<CardTitle className="flex items-center gap-2">
					{icon ?? <Cloud className="size-5 text-muted-foreground" />}
					<span>{title}</span>
				</CardTitle>
				<CardAction>
					<span
						className="rounded-full px-3 py-1 text-xs font-semibold text-white"
						style={{ backgroundColor: fillColor }}
					>
						{statusLabel}
					</span>
				</CardAction>
			</CardHeader>
			<CardContent>
				<ChartContainer
					config={chartConfig}
					role="img"
					aria-label={ariaLabel}
					className="mx-auto aspect-square w-full max-w-70"
				>
					<RadialBarChart
						data={[{ value: hasCurrent ? clampedCurrent : min }]}
						startAngle={START_ANGLE}
						endAngle={END_ANGLE}
						innerRadius="52%"
						outerRadius="72%"
						margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
					>
						<PolarAngleAxis
							type="number"
							domain={[min, max]}
							ticks={axisTicks as unknown as AngleAxisTicks}
							tick={renderTick as unknown as AngleAxisTick}
							tickLine={false}
							axisLine={false}
						/>
						<RadialBar
							dataKey="value"
							background
							cornerRadius={5}
							fill="var(--color-value)"
							isAnimationActive={false}
						/>
						<PolarRadiusAxis tick={false} axisLine={false}>
							<Label content={renderCenter as unknown as LabelContent} />
						</PolarRadiusAxis>
					</RadialBarChart>
				</ChartContainer>
				{outOfRange ? (
					<p className="mt-1 text-center text-xs text-muted-foreground">
						{t("chart.outOfRange", {
							defaultValue: "Reading is out of range",
						})}
					</p>
				) : null}
				<p className="sr-only">{ariaLabel}</p>
			</CardContent>
		</Card>
	);
}
