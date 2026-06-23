import { AlertTriangle, Gauge, TrendingDown, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface IndicatorAlertItem {
	id: string;
	name: string;
	count: number;
	percentage: number;
}

export interface WaterMeterAlertStatsData {
	totalAlerts: number;
	/** negative = decline, positive = growth */
	totalAlertsTrend: number;
	metersOverThreshold: number;
	totalMeters: number;
	indicators: IndicatorAlertItem[];
}

interface WaterMeterAlertStatsProps {
	data: WaterMeterAlertStatsData;
}

export function WaterMeterAlertStats({ data }: WaterMeterAlertStatsProps) {
	const { t } = useTranslation();
	const isNegativeTrend = data.totalAlertsTrend < 0;
	const TrendIcon = isNegativeTrend ? TrendingDown : TrendingUp;

	return (
		<div className="space-y-5">
			<h2 className="text-lg font-semibold text-background">
				{t("waterMeter.alertStats.title")}
			</h2>

			{/* Stat cards */}
			<div className="grid grid-cols-2 gap-3">
				<Card className="ring-1 ring-destructive/40">
					<CardContent className="p-4">
						<div className="flex items-start gap-3">
							<div className="shrink-0 rounded-lg bg-destructive/10 p-2">
								<AlertTriangle className="size-5 text-destructive" />
							</div>
							<div className="min-w-0">
								<p className="text-xs text-shadow-destructive">
									{t("waterMeter.alertStats.totalAlerts")}
								</p>
								<div className="mt-0.5 flex items-baseline gap-2">
									<span className="text-2xl font-bold">{data.totalAlerts}</span>
									<span
										className={cn(
											"inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium",
											isNegativeTrend
												? "bg-destructive/10 text-destructive"
												: "bg-green-500/10 text-green-600",
										)}
									>
										<TrendIcon className="size-3" />
										{Math.abs(data.totalAlertsTrend)}%
									</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="ring-1 ring-destructive/40">
					<CardContent className="p-4">
						<div className="flex items-start gap-3">
							<div className="shrink-0 rounded-lg bg-destructive/10 p-2">
								<Gauge className="size-5 text-shadow-destructive" />
							</div>
							<div className="min-w-0">
								<p className="text-xs text-shadow-destructive">
									{t("waterMeter.alertStats.metersOverThreshold")}
								</p>
								<p className="mt-0.5 text-2xl font-bold ">
									{data.metersOverThreshold}{" "}
									<span className="text-shadow-destructive">/</span>{" "}
									{data.totalMeters}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Indicator rows */}
			<div className="space-y-3">
				{data.indicators.map((item) => (
					<div key={item.id} className="flex items-center gap-3">
						<span className="w-16 shrink-0 text-sm font-medium text-destructive">
							{item.name}
						</span>
						<div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
							<div
								className="h-full rounded-full bg-destructive transition-all duration-500"
								style={{ width: `${item.percentage}%` }}
							/>
						</div>
						<span className="w-28 shrink-0 text-right text-sm text-destructive">
							{item.count} ({item.percentage.toFixed(1)}%)
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
