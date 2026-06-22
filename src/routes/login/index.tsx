import { useForm } from "@tanstack/react-form";
import { createFileRoute, redirect } from "@tanstack/react-router";
import type { TFunction } from "i18next";
import { Facebook, Linkedin, Lock, User, Youtube } from "lucide-react";
import { useTranslation } from "react-i18next";
import { assetsMap } from "#/assetsMap";
import { useLogin } from "#/hooks/use-login";
import { ApiError } from "#/lib/api-error";
import { useAuthStore } from "#/store/auth-store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { loginFormSchema, loginSearchSchema } from "./-schema";

export const Route = createFileRoute("/login/")({
	validateSearch: loginSearchSchema,
	beforeLoad: () => {
		// Authenticated users should never see the login page.
		if (useAuthStore.getState().isAuthenticated) {
			throw redirect({ to: "/" });
		}
	},
	component: LoginPage,
});

export default function LoginPage() {
	const { t } = useTranslation();
	const { redirect: redirectTo } = Route.useSearch();
	const mutation = useLogin({ redirectTo: redirectTo ?? "/" });

	const form = useForm({
		defaultValues: { username: "", password: "", remember: false },
		validators: { onChange: loginFormSchema },
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				username: value.username.trim(),
				password: value.password,
			});
		},
	});

	const errorMessage = getLoginErrorMessage(mutation.error, t);

	return (
		<div className="min-h-screen bg-[#f5f5f5]">
			<div className="grid min-h-screen lg:grid-cols-[1.6fr_1fr]">
				{/* LEFT — branding */}
				<div className="hidden flex-col justify-between px-10 py-8 lg:flex lg:px-20 lg:py-12">
					<div>
						<h1 className="text-4xl font-bold uppercase">
							{t("login.system.title")}
						</h1>
						<p className="mt-2 text-2xl text-gray-700">
							{t("login.system.subtitle")}
						</p>
					</div>

					<div className="flex justify-center">
						<img
							src={assetsMap["loginImageBg.png"]}
							alt={t("login.system.title")}
							className="max-h-[450px] object-contain"
						/>
					</div>

					<div className="space-y-4">
						<h2 className="text-xl font-bold uppercase text-red-600">
							{t("login.company.name")}
						</h2>
						<p className="font-semibold">{t("login.company.department")}</p>
						<p className="max-w-3xl text-lg text-gray-700">
							{t("login.company.address")}
						</p>

						<div className="flex flex-wrap gap-3 text-gray-700">
							<span>
								<strong className="text-red-500">T:</strong> (84-28) 3715 8888
							</span>
							<span>|</span>
							<span>
								<strong className="text-red-500">F:</strong> (84-28) 3715 5985
							</span>
							<span>|</span>
							<span>
								<strong className="text-red-500">E:</strong> qtsc@qtsc.com.vn
							</span>
							<span>|</span>
							<span>
								<strong className="text-red-500">W:</strong> www.qtsc.com.vn
							</span>
						</div>
					</div>
				</div>

				{/* RIGHT — login form */}
				<div className="flex items-center justify-center px-8 py-10">
					<form
						className="w-full max-w-md"
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
					>
						<div className="mb-12 flex justify-center">
							<img
								src={assetsMap["stscLogo.png"]}
								className="w-56"
								alt={t("login.system.title")}
							/>
						</div>

						{/* Username */}
						<form.Field name="username">
							{(field) => (
								<div className="mb-5">
									<div className="relative">
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											placeholder={t("login.form.usernamePlaceholder")}
											autoComplete="username"
											aria-invalid={field.state.meta.errors.length > 0}
											disabled={mutation.isPending}
											className="h-14 rounded-xl bg-white pr-12 text-lg"
										/>
										<User className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-gray-500" />
									</div>
									<FieldError field={field} />
								</div>
							)}
						</form.Field>

						{/* Password */}
						<form.Field name="password">
							{(field) => (
								<div>
									<div className="relative">
										<Input
											id={field.name}
											name={field.name}
											type="password"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											placeholder={t("login.form.passwordPlaceholder")}
											autoComplete="current-password"
											aria-invalid={field.state.meta.errors.length > 0}
											disabled={mutation.isPending}
											className="h-14 rounded-xl bg-white pr-12 text-lg"
										/>
										<Lock className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-gray-500" />
									</div>
									<FieldError field={field} />
								</div>
							)}
						</form.Field>

						{/* Remember + forgot */}
						<div className="mt-6 flex items-center justify-between">
							<form.Field name="remember">
								{(field) => (
									<label
										htmlFor={field.name}
										className="flex cursor-pointer items-center gap-2 text-red-500"
									>
										<Checkbox
											id={field.name}
											checked={field.state.value}
											onCheckedChange={(checked) => field.handleChange(checked)}
											disabled={mutation.isPending}
										/>
										{t("login.form.remember")}
									</label>
								)}
							</form.Field>

							<Button
								type="button"
								variant="link"
								className="font-medium text-red-500 hover:underline"
							>
								{t("login.form.forgotPassword")}
							</Button>
						</div>

						{/* Server error */}
						{errorMessage && (
							<p
								role="alert"
								className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600"
							>
								{errorMessage}
							</p>
						)}

						{/* Submit */}
						<div className="mt-8 flex justify-center">
							<form.Subscribe
								selector={(state) => ({
									canSubmit: state.canSubmit,
								})}
							>
								{({ canSubmit }) => (
									<Button
										type="submit"
										disabled={!canSubmit || mutation.isPending}
										className="h-12 rounded-2xl bg-red-500 px-10 text-base font-semibold text-white hover:bg-red-600"
									>
										{mutation.isPending
											? t("login.form.submitting")
											: t("login.form.submit")}
									</Button>
								)}
							</form.Subscribe>
						</div>

						{/* Social */}
						<div className="mt-14 flex justify-center gap-8">
							<SocialIcon>
								<Facebook />
							</SocialIcon>
							<SocialIcon>
								<svg
									viewBox="0 0 24 24"
									className="h-6 w-6 fill-current"
									aria-hidden="true"
								>
									<path d="M22 5.8c-.8.3-1.6.5-2.5.6.9-.5 1.6-1.3 1.9-2.3-.9.5-1.8.9-2.9 1.1a4.5 4.5 0 0 0-7.8 3.1c0 .3 0 .7.1 1A12.8 12.8 0 0 1 3 4.8a4.5 4.5 0 0 0 1.4 6 4.3 4.3 0 0 1-2-.6v.1a4.5 4.5 0 0 0 3.6 4.4c-.4.1-.8.2-1.2.2-.3 0-.5 0-.8-.1a4.5 4.5 0 0 0 4.2 3.1A9 9 0 0 1 2 19.5 12.7 12.7 0 0 0 8.9 21c8.3 0 12.8-6.9 12.8-12.8v-.6c.9-.6 1.7-1.4 2.3-2.3z" />
								</svg>
							</SocialIcon>
							<SocialIcon>
								<Linkedin />
							</SocialIcon>
							<SocialIcon>
								<Youtube />
							</SocialIcon>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

/** Renders the first validation error for a field, translated. */
function FieldError({
	field,
}: {
	field: {
		state: { meta: { errors: Array<{ message?: string } | undefined> } };
	};
}) {
	const { t } = useTranslation();
	const message = field.state.meta.errors[0]?.message;
	if (!message) return null;
	// Validation messages are dynamic i18n keys resolved at render time, so we
	// widen the strongly-typed `t` to accept a runtime key string.
	const translate = t as unknown as (key: string) => string;
	return <p className="mt-1.5 text-sm text-red-600">{translate(message)}</p>;
}

/** Maps a login error to a translated, user-safe message. */
function getLoginErrorMessage(error: unknown, t: TFunction): string | null {
	if (!error) return null;
	if (error instanceof ApiError && error.code === "INVALID_CREDENTIALS") {
		return t("login.errors.invalidCredentials");
	}
	return t("login.errors.unexpected");
}

function SocialIcon({ children }: { children: React.ReactNode }) {
	return (
		<Button
			type="button"
			className="flex size-14 items-center justify-center rounded-full border-2 border-current bg-transparent text-blue-600 transition hover:scale-105 hover:bg-transparent"
		>
			{children}
		</Button>
	);
}
