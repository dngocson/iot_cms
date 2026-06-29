import { Cloud } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const START_ANGLE = 180;
const END_ANGLE = 0;

const ZONE_COLOR = {
	good: METER_STATUS_CONFIG.good.color,
	warning: METER_STATUS_CONFIG.warning.color,
	bad: METER_STATUS_CONFIG.bad.color,
} as const;

const ZONE_RING_THICKNESS = 3;
const ZONE_RING_GAP = 1;
const OUTER_RADIUS_PERCENT = 0.74;

type AngleAxisTicks = ComponentProps<typeof PolarAngleAxis>["ticks"];
type AngleAxisTick = ComponentProps<typeof PolarAngleAxis>["tick"];
type LabelContent = ComponentProps<typeof Label>["content"];

export interface GaugeChartProps {
	data: GaugeData;
	label: string;
	unit?: string;
	icon?: ReactNode;
	precision?: number;
	segments?: number;
	className?: string;
}

const formatTickLabel = (value: number) =>
	Number.isInteger(value) ? `${value}` : value.toFixed(1);

const valueToAngle = (value: number, min: number, max: number): number => {
	const t = (value - min) / (max - min);
	return START_ANGLE + t * (END_ANGLE - START_ANGLE); // giữ nguyên
};
const describeArc = (
	cx: number,
	cy: number,
	r: number,
	startAngle: number,
	endAngle: number,
): string => {
	const toRad = (deg: number) => (deg * Math.PI) / 180;
	const x1 = cx + r * Math.cos(toRad(startAngle));
	const x2 = cx + r * Math.cos(toRad(endAngle));
	const y1 = cy - r * Math.sin(toRad(startAngle));
	const y2 = cy - r * Math.sin(toRad(endAngle));
	const largeArc = Math.abs(startAngle - endAngle) > 180 ? 1 : 0;
	const sweep = endAngle < startAngle ? 1 : 0; // đổi > thành
	return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweep} ${x2} ${y2}`;
};
function GaugeChartComponent({
	data,
	label,
	unit = "",
	icon,
	precision = 1,
	segments = 5,
	className,
}: GaugeChartProps) {
	const { t } = useTranslation();

	const containerRef = useRef<HTMLDivElement>(null);
	const [chartSize, setChartSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const ro = new ResizeObserver(([entry]) => {
			const { width, height } = entry.contentRect;
			// Skip no-op updates so an observer firing with an unchanged size
			// (common on remount) does not schedule a wasted re-render.
			setChartSize((prev) =>
				prev.width === width && prev.height === height
					? prev
					: { width, height },
			);
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	// Validation/clamping is pure over `data`; recompute only when the reading
	// actually changes, not on resize-driven or parent-driven re-renders.
	const {
		min,
		max,
		lowLevel,
		highLevel,
		current,
		clampedCurrent,
		status,
		outOfRange,
	} = useMemo(() => normalizeGaugeData(data), [data]);

	const hasCurrent = current !== null;
	const fillColor =
		status === "noConnection" ? "var(--muted-foreground)" : ZONE_COLOR[status];
	const markerEpsilon = (max - min) * 1e-6;

	// Scale ticks + axis domain only depend on the range/thresholds/reading —
	// never on the measured pixel size, so this survives every resize render.
	const { axisTicks, majorValues } = useMemo(() => {
		const ticks = generateGaugeTicks(min, max, lowLevel, highLevel, segments);
		const majors = new Set(
			ticks.filter((tick) => tick.major).map((tick) => tick.value),
		);
		const tickValues = ticks.map((tick) => tick.value);
		const currentTickExists =
			hasCurrent &&
			tickValues.some(
				(tick) => Math.abs(tick - clampedCurrent) <= markerEpsilon,
			);
		return {
			axisTicks:
				hasCurrent && !currentTickExists
					? [...tickValues, clampedCurrent]
					: tickValues,
			majorValues: majors,
		};
	}, [
		min,
		max,
		lowLevel,
		highLevel,
		segments,
		hasCurrent,
		clampedCurrent,
		markerEpsilon,
	]);

	// Stable single-datum array for the radial bar. A fresh array reference each
	// render makes Recharts re-process its series; keeping it stable lets the bar
	// stay put across resize/parent re-renders.
	const chartData = useMemo(
		() => [{ value: hasCurrent ? clampedCurrent : min }],
		[hasCurrent, clampedCurrent, min],
	);

	const chartConfig = useMemo(
		() => ({ value: { label, color: fillColor } }) satisfies ChartConfig,
		[label, fillColor],
	);

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

	// Pixel geometry for the zone-ring overlay — the only thing that legitimately
	// depends on the measured size.
	const { cx, cy, ringR } = useMemo(() => {
		const minDim = Math.min(chartSize.width, chartSize.height);
		const outerRadiusPx = (minDim / 2) * OUTER_RADIUS_PERCENT;
		return {
			cx: chartSize.width / 2,
			cy: chartSize.height / 2,
			ringR: outerRadiusPx + ZONE_RING_GAP + ZONE_RING_THICKNESS / 2,
		};
	}, [chartSize]);

	const zones = useMemo<Array<{ from: number; to: number; color: string }>>(
		() => [
			{ from: min, to: lowLevel, color: ZONE_COLOR.good },
			{ from: lowLevel, to: highLevel, color: ZONE_COLOR.warning },
			{ from: highLevel, to: max, color: ZONE_COLOR.bad },
		],
		[min, max, lowLevel, highLevel],
	);

	const renderTick = useCallback(
		(props: {
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

			const isMajor = majorValues.has(value);
			const isCurrentMarker =
				hasCurrent && Math.abs(value - clampedCurrent) <= markerEpsilon;

			if (!isMajor && isCurrentMarker) {
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

			const color = ZONE_COLOR[getZoneStatus(value, lowLevel, highLevel)];
			const tickLength = isMajor ? r * 0.07 : r * 0.04;
			const labelRadius = r + tickLength + r * 0.12;
			const markerRadius = Math.max(4, r * 0.05);

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
					{isCurrentMarker ? (
						<circle
							cx={cx + ux * r}
							cy={cy + uy * r}
							r={markerRadius}
							fill={fillColor}
							stroke="var(--background)"
							strokeWidth={2}
						/>
					) : null}
				</g>
			);
		},
		[
			majorValues,
			hasCurrent,
			clampedCurrent,
			markerEpsilon,
			fillColor,
			lowLevel,
			highLevel,
		],
	);

	const renderCenter = useCallback(
		({
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
		},
		[fillColor, valueDisplay, unit],
	);

	return (
		<Card className={cn("w-full", className)}>
			<CardHeader className="items-center p-4 md:p-6">
				<CardTitle className="flex items-center gap-2 text-sm md:text-base">
					{icon ?? <Cloud className="size-4 md:size-5 text-muted-foreground" />}
					<span className="text-center">{title}</span>
				</CardTitle>
				<CardAction>
					<span
						className="rounded-full px-2.5 md:px-3 py-0.5 md:py-1 text-xs font-semibold text-white"
						style={{ backgroundColor: fillColor }}
					>
						{statusLabel}
					</span>
				</CardAction>
			</CardHeader>
			<CardContent>
				<div ref={containerRef} className="relative aspect-square w-full">
					<ChartContainer
						config={chartConfig}
						role="img"
						aria-label={ariaLabel}
						className="aspect-square w-full"
					>
						<RadialBarChart
							data={chartData}
							startAngle={START_ANGLE}
							endAngle={END_ANGLE}
							innerRadius="60%"
							outerRadius="72%"
							margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
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

					{/* Zone ring overlay */}
					{chartSize.width > 0 && (
						<svg
							className="pointer-events-none absolute inset-0"
							width={chartSize.width}
							height={chartSize.height}
						>
							<title>Gauge zone overlay</title>
							{zones.map(({ from, to, color }) => (
								<path
									key={`zone-ring-${from}`}
									d={describeArc(
										cx,
										cy,
										ringR,
										valueToAngle(from, min, max),
										valueToAngle(to, min, max),
									)}
									fill="none"
									stroke={color}
									strokeWidth={ZONE_RING_THICKNESS}
									strokeLinecap="butt"
									opacity={0.75}
								/>
							))}
						</svg>
					)}
				</div>

				{outOfRange ? (
					<p className="mt-1 text-center text-xs text-muted-foreground">
						{t("chart.outOfRange", { defaultValue: "Reading is out of range" })}
					</p>
				) : null}
				<p className="sr-only">{ariaLabel}</p>
			</CardContent>
		</Card>
	);
}

/**
 * Compare by the gauge's actual inputs rather than the `data` object reference.
 * Callers almost always pass an inline `data={{ ... }}` literal (a new object
 * every render), so a default shallow compare would never hit. Comparing the
 * five numeric fields lets the chart skip re-renders that carry identical
 * readings — e.g. when the parent route re-renders after its query resolves.
 */
function gaugePropsAreEqual(prev: GaugeChartProps, next: GaugeChartProps) {
	return (
		prev.label === next.label &&
		prev.unit === next.unit &&
		prev.precision === next.precision &&
		prev.segments === next.segments &&
		prev.className === next.className &&
		prev.icon === next.icon &&
		prev.data.min === next.data.min &&
		prev.data.max === next.data.max &&
		prev.data.current === next.data.current &&
		prev.data.lowLevel === next.data.lowLevel &&
		prev.data.highLevel === next.data.highLevel
	);
}

export const GaugeChart = memo(GaugeChartComponent, gaugePropsAreEqual);
