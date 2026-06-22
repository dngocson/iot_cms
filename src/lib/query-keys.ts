import type { PaginationParams } from "#/types/api";

/**
 * Centralized query key factory.
 *
 * Keep all TanStack Query keys here so they stay stable and easy to invalidate.
 * Use the hierarchical pattern below (`all` -> `lists` -> `list(params)` ->
 * `detail(id)`) for every domain. The `devices` entry is an example template —
 * copy it for each new feature.
 */
export const queryKeys = {
	devices: {
		all: ["devices"] as const,
		lists: () => [...queryKeys.devices.all, "list"] as const,
		list: (params?: PaginationParams) =>
			[...queryKeys.devices.lists(), params ?? {}] as const,
		details: () => [...queryKeys.devices.all, "detail"] as const,
		detail: (id: string) => [...queryKeys.devices.details(), id] as const,
	},
	records: {
		all: ["records"] as const,
		lists: () => [...queryKeys.records.all, "list"] as const,
		list: (params?: PaginationParams) =>
			[...queryKeys.records.lists(), params ?? {}] as const,
	},
} as const;
