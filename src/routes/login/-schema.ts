import { z } from "zod";

/**
 * Login form validation schema.
 *
 * Co-located with the login feature per the project's form rules. Messages are
 * i18n keys (resolved with `t()` at render time), not user-facing strings.
 */
export const loginFormSchema = z.object({
	username: z.string().trim().min(1, "login.validation.usernameRequired"),
	password: z.string().min(1, "login.validation.passwordRequired"),
	remember: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

/** Search params accepted by the login route (e.g. post-login redirect). */
export const loginSearchSchema = z.object({
	redirect: z.string().optional(),
});
