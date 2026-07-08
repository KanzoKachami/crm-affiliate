"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { createProject, updateProject, deleteProject } from "@/lib/project-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PartnerProject } from "@/lib/queries";

const fieldClass =
  "rounded-md border border-line bg-panel-raised px-3 py-2 text-sm text-paper outline-none";
const labelClass = "text-xs text-fog font-mono uppercase tracking-wide";

const STATUS_OPTIONS = ["Активный", "Тест", "Масштабирование", "Пауза", "Закрыт"];
const PAYMENT_MODELS = ["RevShare", "CPA", "Hybrid", "CPL", "Другая"];

const statusTone: Record<string, "signal" | "ember" | "neutral" | "risk"> = {
  Активный: "signal",
  Масштабирование: "signal",
  Тест: "ember",
  Пауза: "neutral",
  Закрыт: "neutral",
};

function ProjectRow({
  project,
  partnerId,
  onError,
}: {
  project: PartnerProject;
  partnerId: string;
  onError: (msg: string | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onError(null);
    startTransition(async () => {
      try {
        await updateProject(partnerId, project.id, formData);
        setIsOpen(false);
      } catch (err) {
        onError(err instanceof Error ? err.message : "Не удалось сохранить проект.");
      }
    });
  }

  function handleDelete() {
    const ok = window.confirm(`Удалить проект «${project.brand} / ${project.geo}»?`);
    if (!ok) return;
    onError(null);
    startTransition(async () => {
      try {
        await deleteProject(partnerId, project.id);
      } catch (err) {
        onError(err instanceof Error ? err.message : "Не удалось удалить проект.");
      }
    });
  }

  return (
    <li className="rounded-md border border-line bg-panel-raised/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-3.5 py-3 text-left"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-paper">{project.brand}</p>
            <span className="text-xs text-fog font-mono">{project.geo}</span>
            <Badge tone={statusTone[project.status] ?? "neutral"}>{project.status}</Badge>
          </div>
          <p className="text-xs text-fog mt-1">
            {project.paymentModel}
            {project.kpi ? ` · KPI: ${project.kpi}` : ""}
          </p>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4 text-fog shrink-0" /> : <ChevronDown className="h-4 w-4 text-fog shrink-0" />}
      </button>

      {isOpen && (
        <form onSubmit={handleSave} className="flex flex-col gap-2.5 border-t border-line px-3.5 py-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}>GEO</label>
              <input name="geo" required defaultValue={project.geo} className={`${fieldClass} mt-1 w-full`} />
            </div>
            <div>
              <label className={labelClass}>Бренд</label>
              <input name="brand" required defaultValue={project.brand} className={`${fieldClass} mt-1 w-full`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}>Модель оплаты</label>
              <select name="paymentModel" defaultValue={project.paymentModel} className={`${fieldClass} mt-1 w-full`}>
                {PAYMENT_MODELS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Статус</label>
              <select name="status" defaultValue={project.status} className={`${fieldClass} mt-1 w-full`}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>KPI</label>
            <input name="kpi" defaultValue={project.kpi ?? ""} className={`${fieldClass} mt-1 w-full`} placeholder="Например: 20 FTD в месяц" />
          </div>
          <div>
            <label className={labelClass}>Комментарий</label>
            <textarea
              name="comment"
              rows={2}
              defaultValue={project.comment ?? ""}
              className={`${fieldClass} mt-1 w-full resize-none`}
            />
          </div>
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
              title="Удалить проект"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}
    </li>
  );
}

export function PartnerProjects({ partnerId, projects }: { partnerId: string; projects: PartnerProject[] }) {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setError(null);
    startTransition(async () => {
      try {
        await createProject(partnerId, formData);
        form.reset();
        setShowForm(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось создать проект.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {projects.length === 0 && !showForm ? (
        <p className="text-sm text-fog">Активных проектов пока нет.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {projects.map((project) => (
            <ProjectRow key={project.id} project={project} partnerId={partnerId} onError={setError} />
          ))}
        </ul>
      )}

      {showForm ? (
        <form onSubmit={handleAdd} className="flex flex-col gap-2.5 rounded-md border border-line p-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <input name="geo" required placeholder="GEO (например, DE)" className={fieldClass} />
            <input name="brand" required placeholder="Бренд" className={fieldClass} />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <select name="paymentModel" defaultValue="RevShare" className={fieldClass}>
              {PAYMENT_MODELS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select name="status" defaultValue="Активный" className={fieldClass}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <input name="kpi" placeholder="KPI (необязательно)" className={fieldClass} />
          <textarea name="comment" placeholder="Комментарий (необязательно)" rows={2} className={`${fieldClass} resize-none`} />
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Сохраняем..." : "Добавить проект"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Отмена
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="secondary" onClick={() => setShowForm(true)} className="w-fit">
          <Plus className="h-4 w-4" />
          Добавить проект
        </Button>
      )}

      {error && <p className="text-xs text-risk">{error}</p>}
    </div>
  );
}
