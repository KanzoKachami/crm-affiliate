import { Card } from "@/components/ui/card";

interface AiFocusCardProps {
  headline: string;
  reasoning: string;
  mainGoal: string;
}

export function AiFocusCard({ headline, reasoning, mainGoal }: AiFocusCardProps) {
  return (
    <Card className="relative overflow-hidden border-signal-dim/60">
      <div className="absolute inset-0 bg-gradient-to-br from-signal/[0.06] to-transparent pointer-events-none" />
      <div className="relative px-6 py-6 sm:px-8 sm:py-7">
        <div className="flex items-center gap-2 mb-4">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-signal opacity-75 animate-pulse-dot" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
          </span>
          <span className="font-mono text-xs text-signal tracking-wide uppercase">
            AI Focus дня
          </span>
        </div>

        <h1 className="font-display text-xl sm:text-2xl font-medium leading-snug text-paper max-w-2xl">
          {headline}
        </h1>

        <p className="mt-3 text-sm text-fog max-w-xl leading-relaxed">
          {reasoning}
        </p>

        <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
          <span className="font-mono text-xs text-fog uppercase tracking-wide">
            Главная цель дня
          </span>
          <span className="font-mono text-sm text-paper">{mainGoal}</span>
        </div>
      </div>
    </Card>
  );
}
