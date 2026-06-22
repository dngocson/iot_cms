import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "#/store/auth-store";

/**
 * Read-and-act auth hook for UI.
 *
 * Components use this instead of reaching into the store or cookies directly,
 * which keeps cookie/token handling centralized and avoids prop drilling the
 * current user through the tree.
 */
export function useAuth() {
	return useAuthStore(
		useShallow((state) => ({
			user: state.user,
			isAuthenticated: state.isAuthenticated,
			login: state.login,
			logout: state.logout,
		})),
	);
}
