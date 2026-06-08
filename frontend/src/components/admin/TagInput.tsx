import { X } from "lucide-react";

export function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter…",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="rounded border border-border bg-white px-2 py-1.5 flex flex-wrap gap-1.5 min-h-[40px]">
      {value.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand/10 text-brand text-xs font-medium"
        >
          {t}
          <button
            type="button"
            onClick={() => onChange(value.filter((x) => x !== t))}
            className="hover:text-red-600"
            aria-label={`Remove ${t}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        onKeyDown={(e) => {
          const target = e.target as HTMLInputElement;
          if (e.key === "Enter" && target.value.trim()) {
            e.preventDefault();
            const tag = target.value.trim();
            if (!value.includes(tag)) onChange([...value, tag]);
            target.value = "";
          }
        }}
        placeholder={placeholder}
        className="flex-1 min-w-[140px] outline-none px-1 text-sm"
      />
    </div>
  );
}
