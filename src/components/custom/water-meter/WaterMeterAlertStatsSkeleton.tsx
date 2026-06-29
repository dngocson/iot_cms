import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function WaterMeterAlertStatsSkeleton() {
	return (
		<div className="space-y-5">
			<Skeleton className="h-7 w-48" />

			{/* Stat cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<Card className="ring-1 ring-muted">
					<CardContent className="p-4">
						<div className="flex items-start gap-3">
							<Skeleton className="h-9 w-9 rounded-lg shrink-0" />
							<div className="min-w-0 flex-1">
								<Skeleton className="h-4 w-24" />
								<div className="mt-2 flex items-baseline gap-2">
									<Skeleton className="h-8 w-16" />
									<Skeleton className="h-6 w-12 rounded" />
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="ring-1 ring-muted">
					<CardContent className="p-4">
						<div className="flex items-start gap-3">
							<Skeleton className="h-9 w-9 rounded-lg shrink-0" />
							<div className="min-w-0 flex-1">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-8 w-24 mt-2" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Indicators list */}
			<div className="space-y-2">
				{[1, 2, 3].map((i) => (
					<Card key={i}>
						<CardContent className="p-3">
							<div className="flex items-center justify-between">
								<Skeleton className="h-5 w-32" />
								<div className="flex items-center gap-3">
									<Skeleton className="h-5 w-12" />
									<Skeleton className="h-2 w-24" />
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
