import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { dateToISO, isoToDisplay, parseISODate } from "./utils";

interface EditableDateCellProps {
	rowId: string;
	/** Current date as ISO `yyyy-MM-dd`. */
	isoDate: string;
	/** Called with the new ISO date when the user picks one. */
	onChange: (id: string, isoDate: string) => void;
}

/**
 * Editable date cell: shows the date as `dd-MM-yyyy` and, on click, opens a
 * calendar in a popover. Selecting a day commits the new ISO date via
 * `onChange` (the parent applies it optimistically). Pure UI — it holds no
 * server logic.
 */
export function EditableDateCell({
	rowId,
	isoDate,
	onChange,
}: EditableDateCellProps) {
	const [open, setOpen] = useState(false);
	const selected = parseISODate(isoDate);

	const handleSelect = (date?: Date) => {
		if (!date) return;
		onChange(rowId, dateToISO(date));
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<Button
						variant="ghost"
						size="sm"
						className="-ml-2.5 h-8 gap-2 font-normal tabular-nums"
					>
						{isoToDisplay(isoDate)}
						<CalendarIcon className="size-3.5 opacity-60" />
					</Button>
				}
			/>
			<PopoverContent align="start" className="w-auto p-0">
				<Calendar
					mode="single"
					selected={selected}
					defaultMonth={selected}
					onSelect={handleSelect}
					autoFocus
				/>
			</PopoverContent>
		</Popover>
	);
}
