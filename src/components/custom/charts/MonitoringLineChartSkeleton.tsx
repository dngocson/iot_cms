import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MonitoringLineChartSkeleton() {
	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>
					<Skeleton className="h-6 w-48" />
				</CardTitle>
				<CardDescription>
					<Skeleton className="h-4 w-64" />
				</CardDescription>
				<div className="flex gap-2 mt-2">
					<Skeleton className="h-8 w-16 rounded-full" />
					<Skeleton className="h-8 w-16 rounded-full" />
					<Skeleton className="h-8 w-16 rounded-full" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="h-64 md:h-80 w-full">
					<Skeleton className="h-full w-full" />
				</div>
			</CardContent>
		</Card>
	);
}
