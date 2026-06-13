import { createFileRoute, Link } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { emailSchema } from "@/lib/validators/common";
import { redirectIfAuthenticated } from "@/lib/auth-guard";

const schema = z.object({ email: emailSchema });

type FormData = z.infer<typeof schema>;

export const Route = createFileRoute("/admin/forgot-password")({
  beforeLoad: redirectIfAuthenticated(),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async ({ email }) => {
    setError(null);
    const redirectTo = `${window.location.origin}/admin/reset-password`;
    const result = await authClient.forgetPassword({
      email,
      redirectTo,
    });
    if (result.error) {
      setError(
        result.error.message ??
          "Could not send reset email. Check RESEND_API_KEY in .env.",
      );
      return;
    }
    setSent(true);
  });

  return (
    <div className="min-h-screen grid place-items-center bg-brand-dark px-4">
      <div className="w-full max-w-[400px] bg-white rounded-lg p-8 shadow-xl">
        <h1 className="font-serif text-xl font-bold">Reset password</h1>
        <p className="text-sm text-ink-muted mt-2">
          Enter your commission email. We will send a reset link valid for 1 hour.
        </p>

        {sent ? (
          <p className="mt-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md p-3">
            If an account exists for that email, a reset link has been sent.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
                {error}
              </p>
            )}
            <label className="block">
              <span className="block text-xs font-semibold mb-1">Email</span>
              <input
                type="email"
                className="w-full rounded border border-border px-3 py-2 text-sm"
                {...register("email")}
              />
              {errors.email && (
                <span className="text-xs text-red-600 mt-1 block">
                  {errors.email.message}
                </span>
              )}
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 rounded-md bg-brand text-white font-semibold hover:bg-brand-dark disabled:opacity-60"
            >
              {isSubmitting ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs">
          <Link to="/admin/login" className="text-brand hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
