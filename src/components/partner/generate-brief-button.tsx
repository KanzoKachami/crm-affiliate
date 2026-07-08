"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { generatePartnerBrief } from "@/lib/ai/generate-brief";
import { Button } from "@/components/ui/button";

export function GenerateBriefButton({
  partnerId,
  hasExisting,
}: {
  partnerId: string;
  hasExisting: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        await generatePartnerBrief(partnerId);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Не удалось сгенерировать AI-сводку.");
      }
    });
  }

  return (
    <div>
      <Button variant="secondary" onClick={handleClick} disabled={isPending}>
        <Sparkles className="h-4 w-4" />
        {isPending ? "Генерируем..." : hasExisting ? "Обновить AI-сводку" : "Сгенерировать AI-сводку"}
      </Button>
      {error && <p className="text-xs text-risk mt-2 max-w-md">{error}</p>}
    </div>
  );
}
