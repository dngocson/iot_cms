import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/water-monitoring/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/water-monitoring/"!</div>;
}
