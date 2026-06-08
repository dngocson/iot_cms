import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/records/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/records/"!</div>;
}
