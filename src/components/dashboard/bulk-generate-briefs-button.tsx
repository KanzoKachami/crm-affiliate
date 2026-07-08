"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { generatePartnerBrief } from "@/lib/ai/generate-brief";
import { Button } from "@/components/ui/button";

// Пауза между запросами — бережём бесплатный лимит Gemini (около 10 запросов/мин).
const DELAY_MS = 4500;

interface BulkTarget {
  id: string;
  name: string;
}

export function BulkGenerateBriefsButton({ partners }: { partners: BulkTarget[] }) {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [failed, setFailed] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  async function handleClick() {
    if (partners.length === 0) return;

    setIsRunning(true);
    setFinished(false);
    setFailed([]);
    setProgress({ done: 0, total: partners.length });

    const failures: string[] = [];

    for (let i = 0; i < partners.length; i++) {
      const partner = partners[i];
      if (!partner) continue;
      try {
        await generatePartnerBrief(partner.id);
      } catch {
        failures.push(partner.name);
      }
      setProgress({ done: i + 1, total: partners.length });
      if (i < partners.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
    }

    setFailed(failures);
    setIsRunning(false);
    setFinished(true);
    router.refresh();
  }

  if (partners.length === 0) return null;

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="secondary" onClick={handleClick} disabled={isRunning}>
        <RefreshCw className={`h-4 w-4 ${isRunning ? "animate-spin" : ""}`} />
        {isRunning
          ? `Обновляем ${progress.done} из ${progress.total}...`
          : "Обновить все AI-сводки"}
      </Button>
      {finished && !isRunning && (
        <p className="text-xs text-fog">
          {failed.length === 0
            ? `Готово: обновлено ${progress.total}.`
            : `Обновлено ${progress.total - failed.length} из ${progress.total}. Не удалось: ${failed.join(", ")}.`}
        </p>
      )}
    </div>
  );
}
