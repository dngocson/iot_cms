/**
 * Auth service — the single place auth talks to the "backend" and to storage.
 *
 * For now the backend is mocked: `login` validates a hard-coded credential and
 * mints a mock JWT. Swap `login` for a real `api.post('/auth/login', ...)` call
 * when the backend is ready — the rest of the app (store, hooks, guard) does
 * not need to change because it only depends on the `LoginResponse` shape.
 */

import { ApiError } from "#/lib/api-error";
import { getCookie, removeCookie, setCookie } from "#/lib/cookies";
import type {
	JwtPayload,
	LoginRequest,
	LoginResponse,
	User,
} from "#/types/auth";

/** Cookie name for the auth token. */
const AUTH_COOKIE = "iot_cms_auth_token";

/** Token lifetime: 7 days. */
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

/** Mock credentials accepted while the real backend is not wired up. */
const MOCK_CREDENTIALS = { username: "admin", password: "admin123" } as const;

const MOCK_USER: User = {
	id: "1",
	username: "admin",
	name: "Administrator",
	role: "admin",
};

/** Simulate network latency so loading states are observable. */
function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Mock JWT encode/decode ------------------------------------------------

function base64UrlEncode(value: string): string {
	return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): string {
	const padded = value.replace(/-/g, "+").replace(/_/g, "/");
	return atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
}

/** Build a mock, non-cryptographic JWT (header.payload.signature). */
function createMockJwt(user: User): string {
	const nowSeconds = Math.floor(Date.now() / 1000);
	const header = { alg: "HS256", typ: "JWT" };
	const payload: JwtPayload = {
		sub: user.id,
		username: user.username,
		name: user.name,
		role: user.role,
		iat: nowSeconds,
		exp: nowSeconds + TOKEN_TTL_SECONDS,
	};

	const encodedHeader = base64UrlEncode(JSON.stringify(header));
	const encodedPayload = base64UrlEncode(JSON.stringify(payload));
	// A real signature is produced server-side; this is a stable mock value.
	return `${encodedHeader}.${encodedPayload}.mock-signature`;
}

/** Decode a JWT payload without verifying its signature. */
function decodeJwt(token: string): JwtPayload | null {
	try {
		const payload = token.split(".")[1];
		if (!payload) return null;
		return JSON.parse(base64UrlDecode(payload)) as JwtPayload;
	} catch {
		return null;
	}
}

/**
 * Decode a token into a `User`, returning `null` when the token is malformed
 * or expired. Used by the store to restore a session on app load.
 */
export function getUserFromToken(token: string): User | null {
	const payload = decodeJwt(token);
	if (!payload) return null;

	const nowSeconds = Math.floor(Date.now() / 1000);
	if (payload.exp <= nowSeconds) return null;

	return {
		id: payload.sub,
		username: payload.username,
		name: payload.name,
		role: payload.role,
	};
}

// --- Token persistence (cookie) -------------------------------------------

export function getStoredToken(): string | null {
	return getCookie(AUTH_COOKIE);
}

export function storeToken(token: string): void {
	setCookie(AUTH_COOKIE, token, { maxAgeSeconds: TOKEN_TTL_SECONDS });
}

export function clearStoredToken(): void {
	removeCookie(AUTH_COOKIE);
}

// --- Auth API (mock) -------------------------------------------------------

/**
 * Authenticate a user. Throws `ApiError` with code `INVALID_CREDENTIALS` on a
 * bad credential so the UI can show a translated message.
 */
export async function login(request: LoginRequest): Promise<LoginResponse> {
	await delay(600);

	const isValid =
		request.username === MOCK_CREDENTIALS.username &&
		request.password === MOCK_CREDENTIALS.password;

	if (!isValid) {
		throw new ApiError({
			message: "Invalid username or password",
			status: 401,
			code: "INVALID_CREDENTIALS",
		});
	}

	const token = createMockJwt(MOCK_USER);
	return { token, user: MOCK_USER };
}
