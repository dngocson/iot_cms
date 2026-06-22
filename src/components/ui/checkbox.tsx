import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Styled checkbox built on the Base UI primitive, matching the project's
 * shadcn-style component conventions (see `button.tsx`).
 */
function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
	return (
		<CheckboxPrimitive.Root
			data-slot="checkbox"
			className={cn(
				"flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input bg-background shadow-sm outline-none transition-colors",
				"focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
				"data-[checked]:border-primary data-[checked]:bg-primary data-[checked]:text-primary-foreground",
				"disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		>
			<CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
				<Check className="size-3.5" />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	);
}

export { Checkbox };
