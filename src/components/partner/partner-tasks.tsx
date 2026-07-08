"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { createTask, toggleTaskDone, updateTask, deleteTask } from "@/lib/tasks-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PartnerTask } from "@/lib/queries";

const priorityTone: Record<string, "risk" | "ember" | "neutral"> = {
  Высокий: "risk",
  Средний: "ember",
  Низкий: "neutral",
};

const fieldClass =
  "rounded-md border border-line bg-panel-raised px-3 py-2 text-sm text-paper outline-none";

function formatDeadline(deadline: string) {
  return new Date(deadline).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
}

function toDateInputValue(deadline: string) {
  return new Date(deadline).toISOString().slice(0, 10);
}

function TaskRow({
  task,
  partnerId,
  onError,
}: {
  task: PartnerTask;
  partnerId: string;
  onError: (msg: string | null) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const isDone = task.status === "Выполнена";

  function handleToggle(e: React.ChangeEvent<HTMLInputElement>) {
    e.stopPropagation();
    onError(null);
    startTransition(async () => {
      try {
        await toggleTaskDone(partnerId, task.id, isDone);
      } catch (e) {
        onError(e instanceof Error ? e.message : "Не удалось обновить задачу.");
      }
    });
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onError(null);
    startTransition(async () => {
      try {
        await updateTask(partnerId, task.id, formData);
        setIsOpen(false);
      } catch (err) {
        onError(err instanceof Error ? err.message : "Не удалось сохранить задачу.");
      }
    });
  }

  function handleDelete() {
    const ok = window.confirm(`Удалить задачу «${task.title}»?`);
    if (!ok) return;
    onError(null);
    startTransition(async () => {
      try {
        await deleteTask(partnerId, task.id);
      } catch (err) {
        onError(err instanceof Error ? err.message : "Не удалось удалить задачу.");
      }
    });
  }

  return (
    <li className="rounded-md border border-line bg-panel-raised/50 overflow-hidden">
      <div className="flex items-start gap-3 px-3 py-2.5">
        <input
          type="checkbox"
          checked={isDone}
          onChange={handleToggle}
          disabled={isPending}
          className="mt-0.5 h-4 w-4 accent-signal cursor-pointer"
        />
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="flex-1 min-w-0 text-left"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-medium ${isDone ? "text-fog line-through" : "text-paper"}`}>
              {task.title}
            </p>
            <Badge tone={priorityTone[task.priority] ?? "neutral"}>{task.priority}</Badge>
            <span className="text-xs text-fog font-mono">{formatDeadline(task.deadline)}</span>
          </div>
          {task.description && !isOpen && <p className="text-xs text-fog mt-1">{task.description}</p>}
          {task.expectedResult && !isOpen && (
            <p className="text-xs text-signal mt-1">Ожидаемый результат: {task.expectedResult}</p>
          )}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="text-fog hover:text-paper transition-colors mt-0.5"
          title={isOpen ? "Свернуть" : "Открыть и отредактировать"}
        >
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSave} className="flex flex-col gap-2.5 border-t border-line px-3 py-3">
          <input name="title" required defaultValue={task.title} className={fieldClass} />
          <div className="grid grid-cols-2 gap-2.5">
            <input
              name="deadline"
              type="date"
              required
              defaultValue={toDateInputValue(task.deadline)}
              className={fieldClass}
            />
            <select name="priority" defaultValue={task.priority} className={fieldClass}>
              <option value="Низкий">Низкий приоритет</option>
              <option value="Средний">Средний приоритет</option>
              <option value="Высокий">Высокий приоритет</option>
            </select>
          </div>
          <input
            name="expectedResult"
            defaultValue={task.expectedResult ?? ""}
            placeholder="Ожидаемый результат (необязательно)"
            className={fieldClass}
          />
          <textarea
            name="description"
            defaultValue={task.description ?? ""}
            placeholder="Заметка (необязательно)"
            rows={2}
            className={`${fieldClass} resize-none`}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Сохраняем..." : "Сохранить"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Отмена
              </Button>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="text-fog hover:text-risk transition-colors p-1.5 rounded-md hover:bg-risk-dim/20"
              title="Удалить задачу"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}
    </li>
  );
}

export function PartnerTasks({ partnerId, tasks }: { partnerId: string; tasks: PartnerTask[] }) {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const openTasks = tasks.filter((t) => t.status !== "Выполнена");
  const doneTasks = tasks.filter((t) => t.status === "Выполнена");

  function handleAddTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setError(null);
    startTransition(async () => {
      try {
        await createTask(partnerId, formData);
        form.reset();
        setShowForm(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось создать задачу.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.length === 0 && !showForm ? (
        <p className="text-sm text-fog">Задач по этому партнёру пока нет.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {[...openTasks, ...doneTasks].map((task) => (
            <TaskRow key={task.id} task={task} partnerId={partnerId} onError={setError} />
          ))}
        </ul>
      )}

      {showForm ? (
        <form onSubmit={handleAddTask} className="flex flex-col gap-2.5 rounded-md border border-line p-3.5">
          <input name="title" required placeholder="Что нужно сделать" className={fieldClass} />
          <div className="grid grid-cols-2 gap-2.5">
            <input name="deadline" type="date" required className={fieldClass} />
            <select name="priority" defaultValue="Средний" className={fieldClass}>
              <option value="Низкий">Низкий приоритет</option>
              <option value="Средний">Средний приоритет</option>
              <option value="Высокий">Высокий приоритет</option>
            </select>
          </div>
          <input name="expectedResult" placeholder="Ожидаемый результат (необязательно)" className={fieldClass} />
          <textarea
            name="description"
            placeholder="Заметка (необязательно)"
            rows={2}
            className={`${fieldClass} resize-none`}
          />
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Сохраняем..." : "Добавить задачу"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Отмена
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="secondary" onClick={() => setShowForm(true)} className="w-fit">
          <Plus className="h-4 w-4" />
          Добавить задачу
        </Button>
      )}

      {error && <p className="text-xs text-risk">{error}</p>}
    </div>
  );
}
