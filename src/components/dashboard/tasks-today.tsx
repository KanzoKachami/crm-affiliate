import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Task, TaskPriority } from "@/types";

const priorityTone: Record<TaskPriority, "risk" | "ember" | "neutral"> = {
  Высокий: "risk",
  Средний: "ember",
  Низкий: "neutral",
};

export function TasksToday({ tasks }: { tasks: Task[] }) {
  const overdueCount = tasks.filter((t) => t.isOverdue).length;

  return (
    <Card>
      <CardHeader className="flex items-center justify-between flex-row">
        <CardTitle>Задачи на сегодня</CardTitle>
        <div className="flex items-center gap-2">
          {overdueCount > 0 && <Badge tone="risk">{overdueCount} просрочено</Badge>}
          <span className="font-mono text-xs text-fog">{tasks.length}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-fog py-4">
            На сегодня и в просрочке задач нет. Хороший момент запланировать следующий шаг с приоритетным
            партнёром.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {tasks.map((task) => (
              <li key={task.id}>
                <Link
                  href={`/partners/${task.partnerId}` as any}
                  className={`flex items-start gap-3 rounded-md border px-3 py-2.5 transition-colors hover:bg-panel-raised ${
                    task.isOverdue
                      ? "border-risk-dim bg-risk-dim/10 hover:border-risk"
                      : "border-line bg-panel-raised/50 hover:border-signal-dim"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-paper leading-snug">{task.title}</p>
                    <p className="text-xs text-fog mt-1">
                      {task.partnerName}
                      {task.isOverdue && (
                        <span className="text-risk ml-1.5">
                          · просрочено с {new Date(task.deadline).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}
                        </span>
                      )}
                    </p>
                  </div>
                  <Badge tone={priorityTone[task.priority]}>{task.priority}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
