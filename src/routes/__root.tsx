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

/** Route prefix that is reachable without authentication. */
const PUBLIC_PREFIX = "/login";

export const Route = createRootRouteWithContext<RouterContext>()({
	/**
	 * Global route guard. Every route inherits this, so unauthenticated users
	 * are redirected to the login page from anywhere in the app. The login page
	 * itself is exempt (and handles redirecting already-authenticated users).
	 */
	beforeLoad: ({ location }) => {
		const isAuthenticated = useAuthStore.getState().isAuthenticated;
		const isPublic = location.pathname.startsWith(PUBLIC_PREFIX);

		if (!isAuthenticated && !isPublic) {
			throw redirect({
				to: "/login",
				search: { redirect: location.href },
			});
		}
	},
	component: RootComponent,
});

function RootComponent() {
	useTheme();

	// Hide the app chrome on public pages (e.g. login).
	const hideChrome = useRouterState({
		select: (state) => state.location.pathname.startsWith(PUBLIC_PREFIX),
	});

	return (
		<>
			{!hideChrome && <Header />}
			<Outlet />
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
