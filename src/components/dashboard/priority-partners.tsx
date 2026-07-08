import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Partner, Temperature } from "@/types";

const temperatureTone: Record<Temperature, "risk" | "ember" | "drift"> = {
  Горячий: "risk",
  Тёплый: "ember",
  Холодный: "drift",
};

export function PriorityPartners({ partners }: { partners: Partner[] }) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between flex-row">
        <CardTitle>Приоритетные партнёры</CardTitle>
        <span className="font-mono text-xs text-fog">{partners.length}</span>
      </CardHeader>
      <CardContent className="pt-2">
        {partners.length === 0 ? (
          <p className="text-sm text-fog py-4">
            Здесь появятся партнёры с наибольшим потенциалом, как только добавишь их в базу.
          </p>
        ) : (
        <ul className="flex flex-col gap-3">
          {partners.map((partner) => (
            <li key={partner.id}>
              <Link
                href={`/partners/${partner.id}` as any}
                className="block rounded-md border border-line bg-panel-raised/50 px-3 py-2.5 hover:bg-panel-raised hover:border-signal-dim transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-paper font-medium truncate">
                    {partner.name}
                    {partner.isVip && <span className="ml-1.5 text-ember text-xs">VIP</span>}
                  </p>
                  <Badge tone={temperatureTone[partner.temperature]}>{partner.temperature}</Badge>
                </div>
                {partner.aiNextAction && (
                  <p className="mt-1.5 text-xs text-signal font-mono leading-snug">
                    → {partner.aiNextAction}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
        )}
      </CardContent>
    </Card>
  );
}
