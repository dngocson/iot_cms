/**
 * Centralized browser cookie access.
 *
 * The rest of the app must go through these helpers instead of touching
 * `document.cookie` directly, so cookie naming and security flags stay
 * consistent in one place.
 *
 * Security note: `HttpOnly` cannot be set from JavaScript — it is a
 * server-only flag. In a real backend the auth cookie should be issued by the
 * server as `HttpOnly; Secure; SameSite=Strict`. Here we apply every flag the
 * browser allows from client code (`Secure` on HTTPS, `SameSite=Strict`,
 * scoped `path`, explicit expiry).
 */

export interface CookieOptions {
	/** Lifetime in seconds. Omit for a session cookie. */
	maxAgeSeconds?: number;
	/** Cookie path scope. Defaults to "/". */
	path?: string;
	/** CSRF protection. Defaults to "Strict". */
	sameSite?: "Strict" | "Lax" | "None";
	/** Only send over HTTPS. Defaults to true when the page is served over HTTPS. */
	secure?: boolean;
}

function isHttps(): boolean {
	return typeof window !== "undefined" && window.location.protocol === "https:";
}

/** Read a cookie value, or `null` if it is not set. */
export function getCookie(name: string): string | null {
	if (typeof document === "undefined") return null;

	const prefix = `${encodeURIComponent(name)}=`;
	const match = document.cookie
		.split("; ")
		.find((row) => row.startsWith(prefix));

	return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}

/** Write a cookie with secure defaults. */
export function setCookie(
	name: string,
	value: string,
	options: CookieOptions = {},
): void {
	if (typeof document === "undefined") return;

	const {
		maxAgeSeconds,
		path = "/",
		sameSite = "Strict",
		secure = isHttps(),
	} = options;

	const parts = [
		`${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
		`Path=${path}`,
		`SameSite=${sameSite}`,
	];

	if (maxAgeSeconds !== undefined) {
		parts.push(`Max-Age=${maxAgeSeconds}`);
	}

	// SameSite=None is only valid alongside Secure.
	if (secure || sameSite === "None") {
		parts.push("Secure");
	}

	// biome-ignore lint/suspicious/noDocumentCookie: centralized cookie writer; the async Cookie Store API isn't broadly supported.
	document.cookie = parts.join("; ");
}

/** Delete a cookie by expiring it immediately. */
export function removeCookie(name: string, path = "/"): void {
	if (typeof document === "undefined") return;

	// biome-ignore lint/suspicious/noDocumentCookie: centralized cookie writer; the async Cookie Store API isn't broadly supported.
	document.cookie = `${encodeURIComponent(name)}=; Path=${path}; Max-Age=0; SameSite=Strict`;
}
