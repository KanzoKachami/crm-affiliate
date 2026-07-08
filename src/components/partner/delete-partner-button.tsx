"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deletePartner } from "@/lib/actions";

export function DeletePartnerButton({
  partnerId,
  partnerName,
  redirectAfter,
  compact,
}: {
  partnerId: string;
  partnerName: string;
  redirectAfter?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const ok = window.confirm(
      `Удалить партнёра «${partnerName}»? Это действие необратимо — удалятся все его задачи, проекты и история.`
    );
    if (!ok) return;

    setError(null);
    startTransition(async () => {
      try {
        await deletePartner(partnerId);
        if (redirectAfter) {
          router.push(redirectAfter as any);
        } else {
          router.refresh();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Не удалось удалить партнёра.");
      }
    });
  }

  return (
    <div className={compact ? "inline-block" : undefined}>
      <button
        onClick={handleDelete}
        disabled={isPending}
        title="Удалить партнёра"
        className={
          compact
            ? "text-fog hover:text-risk transition-colors p-1.5 rounded-md hover:bg-risk-dim/20 disabled:opacity-50"
            : "inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium text-risk hover:bg-risk-dim/20 transition-colors disabled:opacity-50"
        }
      >
        <Trash2 className="h-4 w-4" />
        {!compact && (isPending ? "Удаляем..." : "Удалить партнёра")}
      </button>
      {error && <p className="text-xs text-risk mt-1 max-w-xs">{error}</p>}
    </div>
  );
}
