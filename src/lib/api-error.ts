import { AxiosError } from "axios";
import type { ApiErrorData } from "#/types/api";

/**
 * Normalized application error.
 *
 * Every failed request is converted into an `ApiError` by the response
 * interceptor so the rest of the app only ever deals with one error shape.
 */
export class ApiError extends Error implements ApiErrorData {
	readonly status: number;
	readonly code?: string;
	readonly fieldErrors?: Record<string, string>;

	constructor(data: ApiErrorData) {
		super(data.message);
		this.name = "ApiError";
		this.status = data.status;
		this.code = data.code;
		this.fieldErrors = data.fieldErrors;
	}
}

/** Backend error payload we attempt to read fields from. */
interface BackendErrorPayload {
	message?: string;
	error?: string;
	code?: string;
	fieldErrors?: Record<string, string>;
}

/**
 * Convert any thrown value (Axios error, network error, unknown) into a
 * consistent `ApiError`. Keeps error handling in one place.
 */
export function normalizeError(error: unknown): ApiError {
	if (error instanceof ApiError) {
		return error;
	}

	if (error instanceof AxiosError) {
		const status = error.response?.status ?? 0;
		const payload = error.response?.data as BackendErrorPayload | undefined;

		if (status === 0) {
			return new ApiError({
				message: "Network error. Please check your connection.",
				status,
				code: error.code,
			});
		}

		return new ApiError({
			message: payload?.message ?? payload?.error ?? error.message,
			status,
			code: payload?.code ?? error.code,
			fieldErrors: payload?.fieldErrors,
		});
	}

	return new ApiError({
		message: error instanceof Error ? error.message : "Unexpected error",
		status: 0,
	});
}
