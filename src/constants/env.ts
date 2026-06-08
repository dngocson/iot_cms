/**
 * Centralized, typed access to environment variables.
 *
 * Vite only exposes vars prefixed with `VITE_`. Read them here once so the
 * rest of the app never touches `import.meta.env` directly.
 */
export const ENV = {
	API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? "/api",
	IS_DEV: import.meta.env.DEV,
} as const;
