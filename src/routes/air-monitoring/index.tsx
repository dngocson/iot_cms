import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/air-monitoring/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/air-monitoring/"!</div>;
}
