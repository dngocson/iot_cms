import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
export const Route = createFileRoute("/")({ component: Home });

function Home() {
	const navigate = useNavigate();
	return (
		<div className="p-8">
			<Button onClick={() => navigate({ to: "/about-us" })}>Click me</Button>
		</div>
	);
}
