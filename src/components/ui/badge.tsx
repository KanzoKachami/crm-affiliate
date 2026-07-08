import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeTone = "neutral" | "signal" | "ember" | "risk" | "drift";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-panel-raised text-fog border-line",
  signal: "bg-signal-dim/40 text-signal border-signal-dim",
  ember: "bg-ember-dim/40 text-ember border-ember-dim",
  risk: "bg-risk-dim/40 text-risk border-risk-dim",
  drift: "bg-drift-dim/40 text-drift border-drift-dim",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-xs font-mono",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
