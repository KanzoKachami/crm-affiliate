import {
  MessageCircle,
  MessageCircleReply,
  StickyNote,
  ListPlus,
  CheckCircle2,
  FolderPlus,
  FolderCog,
  BarChart3,
  Coins,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import type { PartnerTimelineEvent } from "@/lib/queries";

const eventIcons: Record<string, typeof MessageCircle> = {
  message_sent: MessageCircle,
  message_received: MessageCircleReply,
  note_added: StickyNote,
  task_created: ListPlus,
  task_completed: CheckCircle2,
  project_created: FolderPlus,
  project_updated: FolderCog,
  stats_sent: BarChart3,
  ftd_received: Coins,
  scaling_discussed: TrendingUp,
  status_changed: RefreshCw,
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PartnerTimeline({ events }: { events: PartnerTimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-fog">
        Пока пусто. Timeline заполняется автоматически — как только появятся задачи, проекты или другие
        события по этому партнёру, они будут появляться здесь сами.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {events.map((event) => {
        const Icon = eventIcons[event.type] ?? StickyNote;
        return (
          <li key={event.id} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-panel-raised text-fog">
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-paper leading-snug">{event.description}</p>
              <p className="text-xs text-fog mt-0.5 font-mono">{formatDateTime(event.createdAt)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
