/**
 * Shared API types.
 *
 * Keep these generic and reusable across features. Feature-specific
 * response shapes should live next to their feature, not here.
 */

/** Standard error shape surfaced to the UI after normalization. */
export interface ApiErrorData {
	/** Human-readable message safe to display to the user. */
	message: string;
	/** HTTP status code, or 0 when the request never reached the server. */
	status: number;
	/** Optional machine-readable error code from the backend. */
	code?: string;
	/** Optional field-level validation errors keyed by field name. */
	fieldErrors?: Record<string, string>;
}

/** Generic paginated list response. */
export interface Paginated<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
}

/** Query parameters for server-side pagination/sorting/filtering. */
export interface PaginationParams {
	page?: number;
	pageSize?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	search?: string;
}
