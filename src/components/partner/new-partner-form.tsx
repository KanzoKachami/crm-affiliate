"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createPartner } from "@/lib/actions";
import { Button } from "@/components/ui/button";

const inputClass =
  "mt-1 w-full rounded-md border border-line bg-panel-raised px-3 py-2 text-sm text-paper outline-none";
const labelClass = "text-xs text-fog font-mono uppercase tracking-wide";

interface DuplicateInfo {
  id: string;
  name: string;
  matchedField: string;
}

export function NewPartnerForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<DuplicateInfo | null>(null);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createPartner(formData);
      } catch (err) {
        // redirect() внутри server action бросает служебную ошибку — её нужно
        // пробросить дальше, чтобы Next.js сам выполнил переход на страницу партнёра.
        if (err && typeof err === "object" && "digest" in err && String((err as any).digest).startsWith("NEXT_REDIRECT")) {
          throw err;
        }

        const message = err instanceof Error ? err.message : "Не удалось создать партнёра.";
        try {
          const parsed = JSON.parse(message);
          if (parsed.code === "DUPLICATE_PARTNER") {
            setDuplicate(parsed);
            setPendingFormData(formData);
            return;
          }
        } catch {
          // не JSON — обычная ошибка
        }
        setError(message);
      }
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDuplicate(null);
    submit(new FormData(e.currentTarget));
  }

  function handleCreateAnyway() {
    if (!pendingFormData) return;
    pendingFormData.set("confirmDuplicate", "true");
    submit(pendingFormData);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Название *</label>
        <input name="name" required className={inputClass} placeholder="Имя партнёра или ник" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Telegram</label>
          <input name="telegram" className={inputClass} placeholder="@username" />
        </div>
        <div>
          <label className={labelClass}>Skype</label>
          <input name="skype" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input name="email" type="email" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Источник трафика</label>
          <select name="source" className={inputClass} defaultValue="Другой">
            {["SEO", "FB", "PPC", "ASO", "UAC", "INAPP", "NETWORK", "SMS", "EMAIL", "Другой"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Статус воронки</label>
          <select name="funnelStatus" className={inputClass} defaultValue="Первый контакт">
            {[
              "Первый контакт",
              "Переговоры",
              "Ждём запуск",
              "Первый тест",
              "Активный",
              "Масштабирование",
              "Пауза",
              "Закрыт",
            ].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Температура</label>
          <select name="temperature" className={inputClass} defaultValue="Холодный">
            {["Холодный", "Тёплый", "Горячий"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Потенциал</label>
          <select name="potential" className={inputClass} defaultValue="Не определён">
            {["Не определён", "Низкий", "Средний", "Высокий"].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Вероятность депозитов</label>
          <select name="depositProbability" className={inputClass} defaultValue="Не определена">
            {["Не определена", "Низкая", "Средняя", "Высокая"].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Комментарий</label>
        <textarea
          name="notes"
          rows={3}
          placeholder="Свободная заметка о партнёре — контекст, договорённости, нюансы. AI будет учитывать это при генерации сводки."
          className={`${inputClass} resize-none`}
        />
      </div>

      {duplicate && (
        <div className="rounded-md border border-ember bg-ember/10 px-3.5 py-3 flex flex-col gap-2">
          <p className="text-sm text-paper">
            Партнёр с таким {duplicate.matchedField} уже есть:{" "}
            <Link href={`/partners/${duplicate.id}` as any} className="text-signal hover:underline font-medium">
              {duplicate.name}
            </Link>
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={handleCreateAnyway} disabled={isPending}>
              {isPending ? "Создаём..." : "Всё равно создать"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setDuplicate(null)}>
              Отмена
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-risk">{error}</p>}

      {!duplicate && (
        <Button type="submit" className="mt-2 w-fit" disabled={isPending}>
          {isPending ? "Создаём..." : "Создать партнёра"}
        </Button>
      )}
    </form>
  );
}
