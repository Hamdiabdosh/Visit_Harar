import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { SiteLogo } from "@/components/SiteLogo";
import { authClient } from "@/lib/auth-client";
import { redirectIfAuthenticated } from "@/lib/auth-guard";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export const Route = createFileRoute("/admin/login")({
  beforeLoad: redirectIfAuthenticated(),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null);
    const result = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });

    if (result.error) {
      const msg = result.error.message?.toLowerCase() ?? "";
      if (msg.includes("disabled") || msg.includes("inactive")) {
        setFormError(
          "This account has been disabled. Contact your administrator.",
        );
      } else {
        setFormError("Invalid email or password.");
      }
      return;
    }

    await navigate({ to: "/admin" });
  });

  return (
    <div className="min-h-screen grid place-items-center bg-brand-dark px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[400px] bg-white rounded-lg p-8 shadow-xl"
      >
        <div className="flex flex-col items-center mb-6">
          <SiteLogo size="lg" />
          <h1 className="font-serif text-2xl font-bold mt-3">Visit Harar</h1>
          <div className="text-ink-muted text-sm">CMS Login</div>
          <p className="text-[11px] text-ink-muted mt-2">
            Official Bureau Staff Access Only
          </p>
        </div>

        {formError && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
            {formError}
          </div>
        )}

        <label className="block mb-3">
          <span className="block text-xs font-semibold mb-1">Email</span>
          <input
            type="email"
            autoComplete="email"
            className="w-full rounded border border-border px-3 py-2 text-sm"
            {...register("email")}
          />
          {errors.email && (
            <span className="text-xs text-red-600 mt-1 block">
              {errors.email.message}
            </span>
          )}
        </label>

        <label className="block mb-5">
          <span className="block text-xs font-semibold mb-1">Password</span>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              autoComplete="current-password"
              className="w-full rounded border border-border px-3 py-2 pr-9 text-sm"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted"
            >
              {show ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <span className="text-xs text-red-600 mt-1 block">
              {errors.password.message}
            </span>
          )}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="block w-full text-center px-4 py-2.5 rounded-md bg-brand text-white font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
        >
          {isSubmitting ? "Signing in…" : "Sign In"}
        </button>

        <div className="text-center mt-4">
          <Link
            to="/admin/forgot-password"
            className="text-xs text-brand hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </form>
    </div>
  );
}
