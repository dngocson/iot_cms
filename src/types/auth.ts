/**
 * Authentication domain types.
 *
 * Shared across the auth service, store, hooks, and the login feature. Keep
 * these strongly typed so the whole auth flow stays `any`-free.
 */

/** A user role. Extend as the permission model grows. */
export type UserRole = "admin" | "operator" | "analyst";

/** The authenticated user as the app knows them (decoded from the JWT). */
export interface User {
	id: string;
	username: string;
	name: string;
	role: UserRole;
}

/** Credentials submitted by the login form. */
export interface LoginRequest {
	username: string;
	password: string;
}

/** Successful login payload returned by the (mock) auth API. */
export interface LoginResponse {
	token: string;
	user: User;
}

/** Decoded JWT payload. Mirrors standard JWT claims plus our user fields. */
export interface JwtPayload {
	/** Subject — the user id. */
	sub: string;
	username: string;
	name: string;
	role: UserRole;
	/** Issued-at, in seconds since epoch. */
	iat: number;
	/** Expiry, in seconds since epoch. */
	exp: number;
}

/** Centralized auth state exposed by the store. */
export interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (response: LoginResponse) => void;
	logout: () => void;
}
