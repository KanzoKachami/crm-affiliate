import type { Temperature, Potential, FunnelStatus, RelationshipStatus } from "@/types";

type Tone = "neutral" | "signal" | "ember" | "risk" | "drift";

export const temperatureTone: Record<Temperature, Tone> = {
  Горячий: "risk",
  Тёплый: "ember",
  Холодный: "drift",
};

export const potentialTone: Record<Potential, Tone> = {
  "Не определён": "neutral",
  Высокий: "signal",
  Средний: "ember",
  Низкий: "neutral",
};

export const relationshipTone: Record<RelationshipStatus, Tone> = {
  "Не сформированы": "neutral",
  Отличные: "signal",
  Хорошие: "drift",
  "Требуют внимания": "ember",
  "Риск потерять": "risk",
  "Приостановлено нами": "neutral",
  "Не сошлись условиями": "neutral",
};

export const funnelStatusTone: Record<FunnelStatus, Tone> = {
  "Первый контакт": "neutral",
  Переговоры: "drift",
  "Ждём запуск": "ember",
  "Первый тест": "ember",
  Активный: "signal",
  Масштабирование: "signal",
  Пауза: "neutral",
  Закрыт: "neutral",
};
