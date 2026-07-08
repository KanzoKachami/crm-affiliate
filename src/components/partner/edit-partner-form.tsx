"use client";

import { useState, useTransition } from "react";
import { Pencil, X } from "lucide-react";
import { updatePartner } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import type { Partner } from "@/types";

const inputClass =
  "mt-1 w-full rounded-md border border-line bg-panel-raised px-3 py-2 text-sm text-paper outline-none";
const labelClass = "text-xs text-fog font-mono uppercase tracking-wide";

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs text-fog font-mono uppercase tracking-wide">{label}</p>
      <p className="text-sm text-paper mt-0.5">{value || "—"}</p>
    </div>
  );
}

export function EditPartnerForm({ partner }: { partner: Partner }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      try {
        await updatePartner(partner.id, formData);
        setIsEditing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось сохранить изменения.");
      }
    });
  }

  if (!isEditing) {
    return (
      <div>
        <div className="flex items-center justify-end mb-3">
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 text-xs text-fog hover:text-paper transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Редактировать
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Field label="Telegram" value={partner.telegram} />
          <Field label="Skype" value={partner.skype} />
          <Field label="Email" value={partner.email} />
          <Field label="Источник" value={partner.source} />
          <Field label="Потенциал" value={partner.potential} />
          <Field label="Вероятность депозитов" value={partner.depositProbability} />
          <Field label="Отношения" value={partner.relationshipStatus} />
          <Field
            label="Последний контакт"
            value={
              partner.lastContactDate
                ? new Date(partner.lastContactDate).toLocaleDateString("ru-RU")
                : null
            }
          />
        </div>
        {partner.notes && (
          <div className="mt-4 pt-4 border-t border-line">
            <p className="text-xs text-fog font-mono uppercase tracking-wide mb-1">Комментарий</p>
            <p className="text-sm text-paper whitespace-pre-wrap">{partner.notes}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-fog font-mono uppercase tracking-wide">Редактирование</p>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="text-fog hover:text-paper transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div>
        <label className={labelClass}>Название *</label>
        <input name="name" required defaultValue={partner.name} className={inputClass} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Telegram</label>
          <input name="telegram" defaultValue={partner.telegram ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Skype</label>
          <input name="skype" defaultValue={partner.skype ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input name="email" type="email" defaultValue={partner.email ?? ""} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Источник трафика</label>
          <select name="source" defaultValue={partner.source} className={inputClass}>
            {["SEO", "FB", "PPC", "ASO", "UAC", "INAPP", "NETWORK", "SMS", "EMAIL", "Другой"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Статус воронки</label>
          <select name="funnelStatus" defaultValue={partner.funnelStatus} className={inputClass}>
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
          <select name="temperature" defaultValue={partner.temperature} className={inputClass}>
            {["Холодный", "Тёплый", "Горячий"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Потенциал</label>
          <select name="potential" defaultValue={partner.potential} className={inputClass}>
            {["Не определён", "Низкий", "Средний", "Высокий"].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Вероятность депозитов</label>
          <select name="depositProbability" defaultValue={partner.depositProbability} className={inputClass}>
            {["Не определена", "Низкая", "Средняя", "Высокая"].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Отношения</label>
          <select name="relationshipStatus" defaultValue={partner.relationshipStatus} className={inputClass}>
            {[
              "Не сформированы",
              "Отличные",
              "Хорошие",
              "Требуют внимания",
              "Риск потерять",
              "Приостановлено нами",
              "Не сошлись условиями",
            ].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Последний контакт</label>
          <input
            name="lastContactDate"
            type="date"
            defaultValue={partner.lastContactDate ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Комментарий</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={partner.notes ?? ""}
          placeholder="Свободная заметка о партнёре — контекст, договорённости, нюансы. AI будет учитывать это при генерации сводки."
          className={`${inputClass} resize-none`}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-paper">
        <input type="checkbox" name="isVip" defaultChecked={partner.isVip} className="h-4 w-4 accent-signal" />
        VIP-партнёр
      </label>

      {error && <p className="text-xs text-risk">{error}</p>}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Сохраняем..." : "Сохранить"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
