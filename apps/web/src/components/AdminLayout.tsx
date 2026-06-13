import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { DashboardShell } from "@/routes/dashboard";

export function AdminLayout({
  title,
  breadcrumb,
  action,
  children,
}: {
  title: string;
  breadcrumb?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <DashboardShell>
      <DashboardTopbar title={title} breadcrumb={breadcrumb} action={action} />
      <div className="p-4 md:p-8">{children}</div>
    </DashboardShell>
  );
}

// Reusable admin primitives
export function AdminCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-lg border border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex items-center w-10 h-6 rounded-full transition-colors ${checked ? "bg-brand" : "bg-gray-300"}`}
      aria-pressed={checked}
      aria-label={label}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`}
      />
    </button>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[12px] font-semibold text-ink mb-1.5 uppercase tracking-wide">
        {label}
      </span>
      {children}
      {hint && (
        <span className="block text-[11px] text-ink-muted mt-1">{hint}</span>
      )}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand ${props.className ?? ""}`}
    />
  );
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={`w-full rounded border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand ${props.className ?? ""}`}
    />
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted mb-3">
      {children}
    </div>
  );
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "gold" | "danger" | "outline";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50";
  const variants = {
    primary: "bg-brand text-white hover:bg-brand-dark",
    ghost: "bg-transparent text-ink hover:bg-surface",
    gold: "bg-gold text-ink hover:bg-gold-dark hover:text-white",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-border text-ink hover:bg-surface",
  };
  return (
    <button {...rest} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
