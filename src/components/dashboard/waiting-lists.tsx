import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Partner } from "@/types";

function WaitingRow({ partner }: { partner: Partner }) {
  const daysSince = partner.lastContactDate
    ? Math.floor(
        (Date.now() - new Date(partner.lastContactDate).getTime()) / 86_400_000
      )
    : null;

  return (
    <li>
      <Link
        href={`/partners/${partner.id}` as any}
        className="flex items-center justify-between gap-3 rounded-md border border-line bg-panel-raised/50 px-3 py-2 hover:bg-panel-raised hover:border-signal-dim transition-colors"
      >
        <p className="text-sm text-paper truncate">{partner.name}</p>
        {daysSince !== null && (
          <span className="font-mono text-xs text-fog whitespace-nowrap">{daysSince} дн.</span>
        )}
      </Link>
    </li>
  );
}

export function WaitingLists({
  waitingForReply,
  waitingForMe,
}: {
  waitingForReply: Partner[];
  waitingForMe: Partner[];
}) {
  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader className="flex items-center justify-between flex-row">
          <CardTitle>Жду ответа</CardTitle>
          <span className="font-mono text-xs text-fog">{waitingForReply.length}</span>
        </CardHeader>
        <CardContent className="pt-2">
          {waitingForReply.length === 0 ? (
            <p className="text-sm text-fog py-2">Никто не завис без ответа больше 2 дней.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {waitingForReply.map((p) => (
                <WaitingRow key={p.id} partner={p} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between flex-row">
          <CardTitle>Ждут моего ответа</CardTitle>
          <span className="font-mono text-xs text-fog">{waitingForMe.length}</span>
        </CardHeader>
        <CardContent className="pt-2">
          {waitingForMe.length === 0 ? (
            <p className="text-sm text-fog py-2">Нет партнёров, которые ждут твоего ответа.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {waitingForMe.map((p) => (
                <WaitingRow key={p.id} partner={p} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
