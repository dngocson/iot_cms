import { QueryClient } from "@tanstack/react-query";

/**
 * Single shared QueryClient for the app.
 *
 * Defaults favor a CMS/monitoring workload: data is considered fresh for a
 * short window to avoid refetch storms, and failed queries retry a couple of
 * times unless the error is a client (4xx) error.
 */
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30_000,
			gcTime: 5 * 60_000,
			refetchOnWindowFocus: false,
			retry: (failureCount, error) => {
				const status = (error as { status?: number })?.status ?? 0;
				if (status >= 400 && status < 500) {
					return false;
				}
				return failureCount < 2;
			},
		},
		mutations: {
			retry: false,
		},
	},
});
