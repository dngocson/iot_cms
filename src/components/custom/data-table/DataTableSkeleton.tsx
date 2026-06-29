import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DataTableSkeleton({ rows = 5 }: { rows?: number }) {
	return (
		<Card className="w-full">
			<CardHeader>
				<div className="flex items-center justify-between">
					<Skeleton className="h-6 w-32" />
					<Skeleton className="h-10 w-64" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{/* Table header */}
					<div className="flex gap-4 border-b pb-3">
						{[1, 2, 3, 4, 5].map((i) => (
							<Skeleton key={i} className="h-4 flex-1" />
						))}
					</div>

					{/* Table rows */}
					{Array.from({ length: rows }).map((_, i) => (
						<div key={i} className="flex gap-4 py-3">
							{[1, 2, 3, 4, 5].map((j) => (
								<Skeleton key={j} className="h-6 flex-1" />
							))}
						</div>
					))}

					{/* Pagination */}
					<div className="flex items-center justify-between pt-4">
						<Skeleton className="h-4 w-32" />
						<div className="flex gap-2">
							<Skeleton className="h-9 w-9" />
							<Skeleton className="h-9 w-9" />
							<Skeleton className="h-9 w-9" />
							<Skeleton className="h-9 w-9" />
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
