import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import type { AnnouncementDto } from "@/lib/announcements-fns";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

type Props = {
  events: AnnouncementDto[];
  month: Date;
  onMonthChange: (d: Date) => void;
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function parseEventDate(s: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s + "T12:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

export function EventsCalendar({ events, month, onMonthChange }: Props) {
  const year = month.getFullYear();
  const mon = month.getMonth();
  const first = startOfMonth(month);
  const totalDays = daysInMonth(month);
  const startPad = first.getDay();

  const byDay = useMemo(() => {
    const map = new Map<number, AnnouncementDto[]>();
    for (const e of events) {
      const d = parseEventDate(e.event_date);
      if (!d || d.getFullYear() !== year || d.getMonth() !== mon) continue;
      const day = d.getDate();
      const list = map.get(day) ?? [];
      list.push(e);
      map.set(day, list);
    }
    return map;
  }, [events, year, mon]);

  const cells: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = month.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  function prevMonth() {
    onMonthChange(new Date(year, mon - 1, 1));
  }

  function nextMonth() {
    onMonthChange(new Date(year, mon + 1, 1));
  }

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
        <button
          type="button"
          onClick={prevMonth}
          className="p-2 rounded hover:bg-white text-ink-muted"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-serif text-lg font-bold">{monthLabel}</h2>
        <button
          type="button"
          onClick={nextMonth}
          className="p-2 rounded hover:bg-white text-ink-muted"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] uppercase tracking-wider text-ink-muted border-b border-border">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr min-h-[280px]">
        {cells.map((day, i) => {
          const dayEvents = day ? (byDay.get(day) ?? []) : [];
          return (
            <div
              key={i}
              className={`min-h-[72px] border-b border-r border-border p-1.5 ${
                day ? "bg-white" : "bg-surface/50"
              }`}
            >
              {day ? (
                <>
                  <span className="text-xs font-medium text-ink-muted">
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map((e) => (
                      <Link
                        key={e.id}
                        to="/news/$slug"
                        params={{ slug: e.slug }}
                        className="block text-[10px] leading-tight px-1 py-0.5 rounded bg-brand/10 text-brand hover:bg-brand/20 truncate"
                        title={e.title}
                      >
                        {e.title}
                      </Link>
                    ))}
                    {dayEvents.length > 2 ? (
                      <span className="text-[10px] text-ink-muted px-1">
                        +{dayEvents.length - 2} more
                      </span>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      {events.filter((e) => e.event_date).length === 0 ? (
        <p className="p-4 text-sm text-ink-muted text-center border-t border-border">
          No dated events this month. Check back for festivals and commission
          events.
        </p>
      ) : null}

      <div className="p-4 border-t border-border space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Upcoming events
        </p>
        {events
          .filter((e) => e.event_date)
          .slice(0, 5)
          .map((e) => (
            <Link
              key={e.id}
              to="/news/$slug"
              params={{ slug: e.slug }}
              className="flex items-start gap-2 text-sm hover:text-brand group"
            >
              <span className="shrink-0 text-xs font-mono text-ink-muted w-24">
                {e.event_date}
              </span>
              <span className="flex-1 font-medium group-hover:underline">
                {e.title}
              </span>
              {e.event_location ? (
                <span className="hidden sm:flex items-center gap-1 text-xs text-ink-muted">
                  <MapPin className="w-3 h-3" />
                  {e.event_location}
                </span>
              ) : null}
            </Link>
          ))}
      </div>
    </div>
  );
}
