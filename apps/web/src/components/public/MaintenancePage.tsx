/**
 * Full coming-soon experience for public visitors.
 * Serves the static design at /coming-soon.html (admin stays outside this gate).
 */
export function MaintenancePage() {
  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0e]">
      <iframe
        title="Visit Harar — Coming Soon"
        src="/coming-soon.html"
        className="absolute inset-0 h-full w-full border-0"
      />
      <a
        href="/admin/login"
        className="fixed bottom-3 right-3 z-[101] rounded px-2 py-1 text-[10px] text-white/25 hover:text-white/70"
      >
        Staff
      </a>
    </div>
  );
}
