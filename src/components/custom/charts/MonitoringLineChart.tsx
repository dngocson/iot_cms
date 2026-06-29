import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Area, CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

export interface WaterMonitoringDataPoint {
	station: string;
	cod: number;
	bod: number;
	oil: number;
}

type IndicatorKey = keyof Omit<WaterMonitoringDataPoint, "station">;

interface Indicator {
	key: IndicatorKey;
	label: string;
	color: string;
}

const INDICATORS: Indicator[] = [
	{ key: "cod", label: "COD", color: "#ef4444" },
	{ key: "bod", label: "BOD", color: "#60a5fa" },
	{ key: "oil", label: "OIL", color: "#9ca3af" },
];

const CHART_CONFIG = {
	cod: { label: "COD", color: "#ef4444" },
	bod: { label: "BOD", color: "#60a5fa" },
	oil: { label: "OIL", color: "#9ca3af" },
} satisfies ChartConfig;

const Y_TICKS = [5, 10, 15, 20, 25, 30, 35];

const ALL_KEYS = new Set<IndicatorKey>(["cod", "bod", "oil"]);

interface MonitoringLineChartProps {
	data: WaterMonitoringDataPoint[];
}

export function MonitoringLineChart({ data }: MonitoringLineChartProps) {
	const { t } = useTranslation();
	const [activeKeys, setActiveKeys] = useState<Set<IndicatorKey>>(
		new Set(ALL_KEYS),
	);

	const toggleKey = (key: IndicatorKey) => {
		setActiveKeys((prev) => {
			if (prev.has(key) && prev.size === 1) return prev;
			const next = new Set(prev);
			next.has(key) ? next.delete(key) : next.add(key);
			return next;
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base md:text-lg">{t("waterMonitoring.chart.title")}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3 md:space-y-4">
				<div className="flex flex-wrap items-center justify-center gap-2">
					{INDICATORS.map((indicator) => {
						const isActive = activeKeys.has(indicator.key);
						return (
							<Button
								key={indicator.key}
								variant="outline"
								size="sm"
								onClick={() => toggleKey(indicator.key)}
								className={cn(
									"gap-2 transition-opacity text-xs md:text-sm",
									!isActive && "opacity-40",
								)}
								style={
									isActive
										? {
												borderColor: indicator.color,
												color: indicator.color,
											}
										: {}
								}
							>
								<span
									className="size-2 rounded-full"
									style={{ backgroundColor: indicator.color }}
								/>
								{indicator.label}
							</Button>
						);
					})}
				</div>

				<ChartContainer
					config={CHART_CONFIG}
					className="aspect-auto h-64 md:h-80 w-full"
				>
					<ComposedChart
						data={data}
						margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
					>
						<defs>
							{INDICATORS.map((indicator) => (
								<linearGradient
									key={indicator.key}
									id={`fill-${indicator.key}`}
									x1="0"
									y1="0"
									x2="0"
									y2="1"
								>
									<stop
										offset="5%"
										stopColor={indicator.color}
										stopOpacity={0.25}
									/>
									<stop
										offset="95%"
										stopColor={indicator.color}
										stopOpacity={0}
									/>
								</linearGradient>
							))}
						</defs>
						<CartesianGrid
							strokeDasharray=""
							vertical={false}
							stroke="hsl(var(--border))"
							strokeOpacity={0.5}
						/>
						<XAxis
							dataKey="station"
							axisLine={false}
							tickLine={false}
							tick={{ fontSize: 12 }}
						/>
						<YAxis
							domain={[5, 35]}
							ticks={Y_TICKS}
							axisLine={false}
							tickLine={false}
							tick={{ fontSize: 12 }}
							width={30}
						/>
						<ChartTooltip content={<ChartTooltipContent />} />
						{INDICATORS.map((indicator) =>
							activeKeys.has(indicator.key) ? (
								<Area
									key={indicator.key}
									type="linear"
									dataKey={indicator.key}
									stroke={`var(--color-${indicator.key})`}
									strokeWidth={2}
									fill={`url(#fill-${indicator.key})`}
									fillOpacity={1}
									dot={{
										r: 4,
										fill: `var(--color-${indicator.key})`,
										strokeWidth: 0,
									}}
									activeDot={{ r: 6 }}
								/>
							) : null,
						)}
					</ComposedChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
