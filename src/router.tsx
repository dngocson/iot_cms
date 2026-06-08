import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { queryClient } from "#/lib/query-client";
import { routeTree } from "./routeTree.gen";

/** Single source of truth for the app router, wired with shared context. */
export function getRouter() {
	const router = createTanStackRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
