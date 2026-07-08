import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles, ListTodo, History, FolderKanban, BrainCircuit } from "lucide-react";
import {
  getPartnerById,
  getTasksForPartner,
  getTimelineForPartner,
  getProjectsForPartner,
  getMemoryFactsForPartner,
} from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { temperatureTone, funnelStatusTone, relationshipTone } from "@/lib/badge-tones";
import { GenerateBriefButton } from "@/components/partner/generate-brief-button";
import { PartnerTasks } from "@/components/partner/partner-tasks";
import { EditPartnerForm } from "@/components/partner/edit-partner-form";
import { DeletePartnerButton } from "@/components/partner/delete-partner-button";
import { PartnerTimeline } from "@/components/partner/partner-timeline";
import { PartnerProjects } from "@/components/partner/partner-projects";
import { PartnerMemory } from "@/components/partner/partner-memory";

function HeaderBadge({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className="text-[10px] text-fog font-mono uppercase tracking-wide leading-none">{label}</span>
      {children}
    </div>
  );
}

export default async function PartnerCardPage({ params }: { params: { id: string } }) {
  const [partner, tasks, timeline, projects, memoryFacts] = await Promise.all([
    getPartnerById(params.id),
    getTasksForPartner(params.id),
    getTimelineForPartner(params.id),
    getProjectsForPartner(params.id),
    getMemoryFactsForPartner(params.id),
  ]);
  if (!partner) notFound();

  return (
    <div className="px-6 sm:px-10 py-8 max-w-4xl mx-auto flex flex-col gap-6">
      <Link href={"/partners" as any} className="flex items-center gap-1.5 text-sm text-fog hover:text-paper w-fit">
        <ArrowLeft className="h-4 w-4" />
        Назад к партнёрам
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <h1 className="font-display text-xl font-medium text-paper">{partner.name}</h1>
            {partner.isVip && <Badge tone="ember">VIP</Badge>}
          </div>
          <div className="flex items-end gap-4 flex-wrap">
            <HeaderBadge label="Статус воронки">
              <Badge tone={funnelStatusTone[partner.funnelStatus]}>{partner.funnelStatus}</Badge>
            </HeaderBadge>
            <HeaderBadge label="Температура">
              <Badge tone={temperatureTone[partner.temperature]}>{partner.temperature}</Badge>
            </HeaderBadge>
            <HeaderBadge label="Отношения">
              <Badge tone={relationshipTone[partner.relationshipStatus]}>{partner.relationshipStatus}</Badge>
            </HeaderBadge>
          </div>
        </div>
        <DeletePartnerButton partnerId={partner.id} partnerName={partner.name} redirectAfter="/partners" />
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-signal" />
            <h2 className="font-display text-sm font-medium tracking-wide text-fog uppercase">AI Brief</h2>
          </div>
          <GenerateBriefButton partnerId={partner.id} hasExisting={Boolean(partner.aiBrief)} />
        </div>

        {partner.aiBrief ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-paper leading-relaxed">{partner.aiBrief}</p>
            {partner.aiNextAction && (
              <div className="rounded-md border border-signal-dim bg-signal-dim/10 px-3.5 py-2.5">
                <p className="text-xs text-fog font-mono uppercase tracking-wide mb-1">Следующее действие</p>
                <p className="text-sm text-signal font-medium">→ {partner.aiNextAction}</p>
                {partner.aiNextActionReason && (
                  <p className="text-xs text-fog mt-1">{partner.aiNextActionReason}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-fog">
            AI-сводки ещё нет — нажми «Сгенерировать AI-сводку», чтобы получить краткий бриф и рекомендованное
            следующее действие на основе данных партнёра.
          </p>
        )}
      </Card>

      <Card className="p-6">
        <EditPartnerForm partner={partner} />
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <FolderKanban className="h-4 w-4 text-signal" />
          <h2 className="font-display text-sm font-medium tracking-wide text-fog uppercase">Активные проекты</h2>
        </div>
        <PartnerProjects partnerId={partner.id} projects={projects} />
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <ListTodo className="h-4 w-4 text-signal" />
          <h2 className="font-display text-sm font-medium tracking-wide text-fog uppercase">Задачи</h2>
        </div>
        <PartnerTasks partnerId={partner.id} tasks={tasks} />
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <BrainCircuit className="h-4 w-4 text-signal" />
          <h2 className="font-display text-sm font-medium tracking-wide text-fog uppercase">AI Memory</h2>
        </div>
        <PartnerMemory partnerId={partner.id} facts={memoryFacts} />
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <History className="h-4 w-4 text-signal" />
          <h2 className="font-display text-sm font-medium tracking-wide text-fog uppercase">Timeline</h2>
        </div>
        <PartnerTimeline events={timeline} />
      </Card>
    </div>
  );
}
