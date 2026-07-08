import { AiFocusCard } from "@/components/dashboard/ai-focus-card";
import { TasksToday } from "@/components/dashboard/tasks-today";
import { PriorityPartners } from "@/components/dashboard/priority-partners";
import { WaitingLists } from "@/components/dashboard/waiting-lists";
import { CalendarWidget } from "@/components/dashboard/calendar-widget";
import { RecentEvents } from "@/components/dashboard/recent-events";
import { AiPlanWidget } from "@/components/dashboard/ai-plan-widget";
import { getDashboardData } from "@/lib/queries";

function buildAiFocus(totalPartners: number, waitingForReplyCount: number) {
  if (totalPartners === 0) {
    return {
      headline: "Пока пусто — добавь первого партнёра, и AI начнёт подсказывать",
      reasoning:
        "AI Focus, приоритеты и напоминания появятся, как только в базе будет хотя бы один партнёр.",
      mainGoal: "Добавить первого партнёра",
    };
  }

  if (waitingForReplyCount > 0) {
    return {
      headline: `${waitingForReplyCount} партнёр(а) не отвечают больше 2 дней`,
      reasoning: "Это те, кого проще всего забыть. Начни с них.",
      mainGoal: "Написать партнёрам из списка «Жду ответа»",
    };
  }

  return {
    headline: "Все партнёры на связи — можно фокусироваться на росте",
    reasoning: "Нет зависших диалогов. Хороший момент предложить масштабирование активным партнёрам.",
    mainGoal: "Найти партнёра для нового GEO",
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const aiFocus = buildAiFocus(data.totalPartners, data.waitingForReply.length);

  return (
    <div className="px-6 sm:px-10 py-8 max-w-6xl mx-auto flex flex-col gap-6">
      <AiFocusCard
        headline={aiFocus.headline}
        reasoning={aiFocus.reasoning}
        mainGoal={aiFocus.mainGoal}
      />

      <AiPlanWidget partners={data.aiPlan} allPartners={data.allPartnersForBulk} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <TasksToday tasks={data.tasksToday} />
        <PriorityPartners partners={data.priorityPartners} />
        <WaitingLists waitingForReply={data.waitingForReply} waitingForMe={data.waitingForMe} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <CalendarWidget tasks={data.allOpenTasks} />
        <div className="lg:col-span-2">
          <RecentEvents events={data.recentEvents} />
        </div>
      </div>
    </div>
  );
}
