import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { redirectIfAuthenticated } from "@/lib/auth-guard";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type FormData = z.infer<typeof schema>;

export const Route = createFileRoute("/admin/reset-password")({
  validateSearch: (s: Record<string, unknown>) => ({
    token: (s.token as string) ?? "",
  }),
  beforeLoad: redirectIfAuthenticated(),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async ({ password }) => {
    if (!token) {
      setError("root", { message: "Invalid or missing reset token." });
      return;
    }
    const result = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    if (result.error) {
      setError("root", {
        message:
          result.error.message ??
          "Could not reset password. The link may have expired.",
      });
      return;
    }
    await navigate({ to: "/admin/login" });
  });

  return (
    <div className="min-h-screen grid place-items-center bg-brand-dark px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[400px] bg-white rounded-lg p-8 shadow-xl space-y-4"
      >
        <h1 className="font-serif text-xl font-bold">Choose a new password</h1>

        {errors.root && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
            {errors.root.message}
          </p>
        )}

        <label className="block">
          <span className="block text-xs font-semibold mb-1">New password</span>
          <input
            type="password"
            className="w-full rounded border border-border px-3 py-2 text-sm"
            {...register("password")}
          />
          {errors.password && (
            <span className="text-xs text-red-600 mt-1 block">
              {errors.password.message}
            </span>
          )}
        </label>

        <label className="block">
          <span className="block text-xs font-semibold mb-1">
            Confirm password
          </span>
          <input
            type="password"
            className="w-full rounded border border-border px-3 py-2 text-sm"
            {...register("confirm")}
          />
          {errors.confirm && (
            <span className="text-xs text-red-600 mt-1 block">
              {errors.confirm.message}
            </span>
          )}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2.5 rounded-md bg-brand text-white font-semibold hover:bg-brand-dark disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : "Update password"}
        </button>

        <p className="text-center text-xs">
          <Link to="/admin/login" className="text-brand hover:underline">
            Back to login
          </Link>
        </p>
      </form>
    </div>
  );
}
