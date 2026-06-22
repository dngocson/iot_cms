import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	Outlet,
	redirect,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { Header } from "#/components/layout/Header";
import { useTheme } from "#/hooks/use-theme";
import { useAuthStore } from "#/store/auth-store";
import "../styles.css";

export interface RouterContext {
	queryClient: QueryClient;
}

/**
 * Public routes that do NOT require authentication.
 * Easier to extend than a single prefix string.
 */
const PUBLIC_ROUTES = ["/login"];

/**
 * Check if a route is public
 */
function isPublicRoute(pathname: string) {
	return PUBLIC_ROUTES.some((path) => pathname.startsWith(path));
}

export const Route = createRootRouteWithContext<RouterContext>()({
	beforeLoad: ({ location }) => {
		const {
			isAuthenticated,
			isLoading, // 👈 important: prevent premature redirect
		} = useAuthStore.getState();

		const publicRoute = isPublicRoute(location.pathname);

		// ⛔ Wait until auth is initialized (avoid flicker redirect)
		if (isLoading) return;

		// 🔒 Protect private routes
		if (!isAuthenticated && !publicRoute) {
			throw redirect({
				to: "/login",
				search: {
					redirect: location.pathname + location.search, // safer than href
				},
			});
		}

		// Optional: prevent authenticated users from visiting login
		if (isAuthenticated && publicRoute) {
			throw redirect({
				to: "/",
			});
		}
	},

	component: RootComponent,
});

function RootComponent() {
	useTheme();

	const hideChrome = useRouterState({
		select: (state) => isPublicRoute(state.location.pathname),
	});

	return (
		<>
			{!hideChrome && <Header />}

			<Outlet />

			{/* Devtools only */}
			<TanStackDevtools
				config={{
					position: "bottom-right",
				}}
				plugins={[
					{
						name: "TanStack Router",
						render: <TanStackRouterDevtoolsPanel />,
					},
				]}
			/>
		</>
	);
}
