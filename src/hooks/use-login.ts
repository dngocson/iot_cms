import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { ApiError } from "#/lib/api-error";
import { login as loginRequest } from "#/lib/auth-service";
import { useAuthStore } from "#/store/auth-store";
import type { LoginRequest, LoginResponse } from "#/types/auth";

interface UseLoginOptions {
	/** Where to send the user after a successful login. */
	redirectTo: string;
}

/**
 * Login mutation.
 *
 * Wraps the auth API in a typed TanStack Query mutation and, on success,
 * updates the centralized auth state and redirects. The component only reads
 * `isPending` / `isError` / `error` from the returned mutation — it never
 * touches the store or cookies itself.
 */
export function useLogin({ redirectTo }: UseLoginOptions) {
	const navigate = useNavigate();
	const setSession = useAuthStore((state) => state.login);

	return useMutation<LoginResponse, ApiError, LoginRequest>({
		mutationFn: loginRequest,
		onSuccess: (data) => {
			setSession(data);
			navigate({ to: redirectTo });
		},
	});
}
