import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TimelineEvent, TimelineEventType } from "@/types";
import {
  MessageSquare,
  MessageSquareText,
  StickyNote,
  ListPlus,
  CheckCircle2,
  FolderPlus,
  TrendingUp,
  Send,
} from "lucide-react";

const eventIcon: Record<TimelineEventType, typeof MessageSquare> = {
  message_sent: Send,
  message_received: MessageSquareText,
  note_added: StickyNote,
  task_created: ListPlus,
  task_completed: CheckCircle2,
  project_created: FolderPlus,
  project_updated: FolderPlus,
  stats_sent: Send,
  ftd_received: TrendingUp,
  scaling_discussed: MessageSquare,
  status_changed: MessageSquare,
};

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return "меньше часа назад";
  if (hours < 24) return `${hours} ч. назад`;
  const days = Math.floor(hours / 24);
  return `${days} дн. назад`;
}

export function RecentEvents({ events }: { events: TimelineEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Последние события</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {events.length === 0 ? (
          <p className="text-sm text-fog py-4">
            Здесь будет история действий по партнёрам — появится автоматически.
          </p>
        ) : (
        <ul className="flex flex-col gap-4">
          {events.map((event) => {
            const Icon = eventIcon[event.type];
            return (
              <li key={event.id}>
                <Link
                  href={`/partners/${event.partnerId}` as any}
                  className="flex items-start gap-3 rounded-md -mx-2 px-2 py-1 hover:bg-panel-raised transition-colors"
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-panel-raised text-fog">
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-paper leading-snug">{event.description}</p>
                    <p className="text-xs text-fog mt-0.5 font-mono">
                      {event.partnerName} · {formatRelativeTime(event.createdAt)}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        )}
      </CardContent>
    </Card>
  );
}
