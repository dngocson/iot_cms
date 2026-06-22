import { create } from "zustand";
import { setAuthToken } from "#/lib/api";
import {
	clearStoredToken,
	getStoredToken,
	getUserFromToken,
	storeToken,
} from "#/lib/auth-service";
import type { AuthState, LoginResponse } from "#/types/auth";

/**
 * Centralized auth state.
 *
 * This is the single source of truth for "who is logged in". It owns the
 * client-side auth lifecycle (cookie + in-memory API token + reactive state)
 * so components never touch cookies or the token directly — they read
 * `isAuthenticated`/`user` and call `login`/`logout`.
 *
 * The token itself is server state-ish, but auth *session* state is genuinely
 * global client state (it gates routing and UI), which is why it lives in
 * Zustand rather than TanStack Query.
 */

/** Restore a session from the auth cookie on app load. */
function getInitialState(): Pick<
	AuthState,
	"user" | "token" | "isAuthenticated"
> {
	const token = getStoredToken();
	if (!token) {
		return { user: null, token: null, isAuthenticated: false };
	}

	const user = getUserFromToken(token);
	if (!user) {
		// Token is malformed or expired — drop it.
		clearStoredToken();
		return { user: null, token: null, isAuthenticated: false };
	}

	// Make the restored token available to the API client immediately.
	setAuthToken(token);
	return { user, token, isAuthenticated: true };
}

export const useAuthStore = create<AuthState>((set) => ({
	...getInitialState(),

	login: (response: LoginResponse) => {
		storeToken(response.token);
		setAuthToken(response.token);
		set({
			user: response.user,
			token: response.token,
			isAuthenticated: true,
		});
	},

	logout: () => {
		clearStoredToken();
		setAuthToken(null);
		set({ user: null, token: null, isAuthenticated: false });
	},
}));
