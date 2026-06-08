import axios from "axios";
import { ENV } from "#/constants/env";
import { normalizeError } from "#/lib/api-error";

/**
 * Centralized Axios client.
 *
 * All server communication goes through this instance so base URL, headers,
 * auth, and error handling stay consistent. Never call `axios` directly or
 * fetch from presentational components — wrap calls in feature API functions.
 */
export const api = axios.create({
	baseURL: ENV.API_BASE_URL,
	timeout: 15_000,
	headers: {
		"Content-Type": "application/json",
	},
});

/** In-memory auth token. Replace with your real auth source when ready. */
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
	authToken = token;
}

// Request interceptor: attach auth token when present.
api.interceptors.request.use((config) => {
	if (authToken) {
		config.headers.Authorization = `Bearer ${authToken}`;
	}
	return config;
});

// Response interceptor: unwrap successful responses, normalize all errors.
api.interceptors.response.use(
	(response) => response,
	(error) => Promise.reject(normalizeError(error)),
);
