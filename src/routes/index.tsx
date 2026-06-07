import { createFileRoute } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<div className="p-8">
			<Button>Click me</Button>
		</div>
	);
}
