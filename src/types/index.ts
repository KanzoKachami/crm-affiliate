// Домейн-типы приложения. Отражают схему БД в supabase/schema.sql.
// Значения enum совпадают со значениями Postgres enum-типов — держим их в синхроне.

export type TrafficSource =
  | "SEO"
  | "FB"
  | "PPC"
  | "ASO"
  | "UAC"
  | "INAPP"
  | "NETWORK"
  | "SMS"
  | "EMAIL"
  | "Другой";

export type Temperature = "Холодный" | "Тёплый" | "Горячий";

export type Potential = "Не определён" | "Низкий" | "Средний" | "Высокий";

export type DepositProbability = "Не определена" | "Низкая" | "Средняя" | "Высокая";

export type FunnelStatus =
  | "Первый контакт"
  | "Переговоры"
  | "Ждём запуск"
  | "Первый тест"
  | "Активный"
  | "Масштабирование"
  | "Пауза"
  | "Закрыт";

export type RelationshipStatus =
  | "Не сформированы"
  | "Отличные"
  | "Хорошие"
  | "Требуют внимания"
  | "Риск потерять"
  | "Приостановлено нами"
  | "Не сошлись условиями";

export type TaskPriority = "Низкий" | "Средний" | "Высокий";

export type TaskStatus = "Открыта" | "В работе" | "Выполнена" | "Просрочена";

export type TimelineEventType =
  | "message_sent"
  | "message_received"
  | "note_added"
  | "task_created"
  | "task_completed"
  | "project_created"
  | "project_updated"
  | "stats_sent"
  | "ftd_received"
  | "scaling_discussed"
  | "status_changed";

export interface Partner {
  id: string;
  name: string;
  telegram: string | null;
  skype: string | null;
  email: string | null;
  source: TrafficSource;
  temperature: Temperature;
  potential: Potential;
  depositProbability: DepositProbability;
  lastContactDate: string | null; // ISO date
  funnelStatus: FunnelStatus;
  relationshipStatus: RelationshipStatus;
  isVip: boolean;
  notes: string | null;
  aiBrief: string | null;
  aiNextAction: string | null;
  aiNextActionReason: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  partnerId: string;
  geo: string;
  brand: string;
  paymentModel: string;
  status: string;
  kpi: string | null;
  comment: string | null;
  createdAt: string;
}

export interface Task {
  id: string;
  partnerId: string;
  partnerName: string;
  title: string;
  description: string | null;
  deadline: string; // ISO datetime
  priority: TaskPriority;
  expectedResult: string | null;
  status: TaskStatus;
  isOverdue: boolean;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  partnerId: string;
  partnerName: string;
  type: TimelineEventType;
  description: string;
  createdAt: string;
}

export interface AiMemoryFact {
  id: string;
  partnerId: string;
  fact: string;
  createdAt: string;
}
