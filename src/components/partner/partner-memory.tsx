"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { addMemoryFact, deleteMemoryFact } from "@/lib/memory-actions";
import { Button } from "@/components/ui/button";
import type { PartnerMemoryFact } from "@/lib/queries";

export function PartnerMemory({ partnerId, facts }: { partnerId: string; facts: PartnerMemoryFact[] }) {
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
        await addMemoryFact(partnerId, formData);
        form.reset();
        setShowForm(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось добавить факт.");
      }
    });
  }

  function handleDelete(factId: string) {
    setError(null);
    startTransition(async () => {
      try {
        await deleteMemoryFact(partnerId, factId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось удалить факт.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {facts.length === 0 && !showForm ? (
        <p className="text-sm text-fog">
          Фактов пока нет. Сюда стоит заносить короткие наблюдения: любит Telegram, отвечает вечером,
          предпочитает короткие сообщения — всё, что AI учтёт при генерации сводки.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {facts.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between gap-3 rounded-md border border-line bg-panel-raised/50 px-3 py-2"
            >
              <p className="text-sm text-paper">{f.fact}</p>
              <button
                type="button"
                onClick={() => handleDelete(f.id)}
                disabled={isPending}
                className="text-fog hover:text-risk transition-colors p-1 rounded-md hover:bg-risk-dim/20 shrink-0"
                title="Удалить факт"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <form onSubmit={handleAdd} className="flex items-center gap-2">
          <input
            name="fact"
            required
            autoFocus
            placeholder="Например: отвечает только вечером после 19:00"
            className="flex-1 rounded-md border border-line bg-panel-raised px-3 py-2 text-sm text-paper outline-none"
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? "..." : "Добавить"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
            Отмена
          </Button>
        </form>
      ) : (
        <Button variant="secondary" onClick={() => setShowForm(true)} className="w-fit">
          <Plus className="h-4 w-4" />
          Добавить факт
        </Button>
      )}

      {error && <p className="text-xs text-risk">{error}</p>}
    </div>
  );
}
