import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Pagination structure primitives (shadcn pattern). The data table composes
 * these with `Button` to build accessible page controls.
 */

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
	return (
		<nav
			aria-label="pagination"
			data-slot="pagination"
			className={cn("flex w-full items-center justify-between", className)}
			{...props}
		/>
	);
}

function PaginationContent({
	className,
	...props
}: React.ComponentProps<"ul">) {
	return (
		<ul
			data-slot="pagination-content"
			className={cn("flex items-center gap-1", className)}
			{...props}
		/>
	);
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
	return <li data-slot="pagination-item" {...props} />;
}

export { Pagination, PaginationContent, PaginationItem };
