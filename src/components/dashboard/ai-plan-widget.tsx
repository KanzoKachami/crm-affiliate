import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { temperatureTone } from "@/lib/badge-tones";
import { BulkGenerateBriefsButton } from "@/components/dashboard/bulk-generate-briefs-button";
import type { Partner } from "@/types";

export function AiPlanWidget({
  partners,
  allPartners,
}: {
  partners: Partner[];
  allPartners: { id: string; name: string }[];
}) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between flex-row gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-signal" />
          <CardTitle>План на день</CardTitle>
        </div>
        <BulkGenerateBriefsButton partners={allPartners} />
      </CardHeader>
      <CardContent className="pt-2">
        {partners.length === 0 ? (
          <p className="text-sm text-fog py-4">
            Пока нет ни одной AI-сводки — сгенерируй их в карточках партнёров или нажми «Обновить все
            AI-сводки», и здесь появится единый план на день из рекомендаций AI.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {partners.map((partner) => (
              <li key={partner.id}>
                <Link
                  href={`/partners/${partner.id}` as any}
                  className="block rounded-md border border-line bg-panel-raised/50 px-3.5 py-2.5 hover:bg-panel-raised hover:border-signal-dim transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-paper font-medium truncate">{partner.name}</p>
                    <Badge tone={temperatureTone[partner.temperature]}>{partner.temperature}</Badge>
                  </div>
                  <p className="text-sm text-signal mt-1 leading-snug">→ {partner.aiNextAction}</p>
                  {partner.aiNextActionReason && (
                    <p className="text-xs text-fog mt-1">{partner.aiNextActionReason}</p>
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
