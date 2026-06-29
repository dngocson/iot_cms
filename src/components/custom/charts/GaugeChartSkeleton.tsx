import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function GaugeChartSkeleton() {
	return (
		<Card className="w-full">
			<CardHeader className="items-center">
				<CardTitle className="flex items-center gap-2">
					<Skeleton className="h-5 w-5 rounded-full" />
					<Skeleton className="h-5 w-24" />
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="relative aspect-square w-full">
					<Skeleton className="aspect-square w-full rounded-full" />
				</div>
			</CardContent>
		</Card>
	);
}
