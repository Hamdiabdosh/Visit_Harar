import { Link } from "@tanstack/react-router";
import {
  Camera,
  Landmark,
  Megaphone,
  CalendarDays,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** V2-003 Create sheet — deep-links existing editors (L-008). */
export function AdminCreateSheet({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create</DialogTitle>
          <DialogDescription>
            Pick what to add. Opens the existing editor — no new data model.
          </DialogDescription>
        </DialogHeader>
        <ul className="mt-2 space-y-1">
          <li>
            <CreateLink
              to="/admin/announcements/$id"
              params={{ id: "new" }}
              search={{ type: "News" }}
              icon={Megaphone}
              label="News"
              description="Announcement for the public site"
              onNavigate={() => onOpenChange(false)}
            />
          </li>
          <li>
            <CreateLink
              to="/admin/announcements/$id"
              params={{ id: "new" }}
              search={{ type: "Event" }}
              icon={CalendarDays}
              label="Event"
              description="Dated event (public RSVP stays off in V2)"
              onNavigate={() => onOpenChange(false)}
            />
          </li>
          <li>
            <CreateLink
              to="/admin/attractions/$id"
              params={{ id: "new" }}
              icon={Landmark}
              label="Attraction"
              description="Place or sight on the map"
              onNavigate={() => onOpenChange(false)}
            />
          </li>
          <li>
            <CreateLink
              to="/admin/gallery"
              icon={Camera}
              label="Photo"
              description="Gallery album or media upload"
              onNavigate={() => onOpenChange(false)}
            />
          </li>
          <li>
            <CreateLink
              to="/admin/guides/$id"
              params={{ id: "new" }}
              icon={Users}
              label="Guide"
              description="Licensed guide profile"
              onNavigate={() => onOpenChange(false)}
            />
          </li>
        </ul>
      </DialogContent>
    </Dialog>
  );
}

function CreateLink({
  to,
  params,
  search,
  icon: Icon,
  label,
  description,
  onNavigate,
}: {
  to: string;
  params?: { id: string };
  search?: { type: "News" | "Event" };
  icon: typeof Megaphone;
  label: string;
  description: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      to={to as never}
      params={(params ?? {}) as never}
      search={(search ?? {}) as never}
      onClick={onNavigate}
      className="flex items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-zinc-900/6"
    >
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand/10 text-brand">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-zinc-900">{label}</span>
        <span className="block text-xs text-zinc-500">{description}</span>
      </span>
    </Link>
  );
}
