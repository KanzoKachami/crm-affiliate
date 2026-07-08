import { createClient } from "@/lib/supabase/server";
import type { Partner, Task, TimelineEvent } from "@/types";

// Supabase возвращает snake_case как в БД — здесь превращаем это
// в camelCase-типы, которыми пользуется остальное приложение.

function mapPartner(row: any): Partner {
  return {
    id: row.id,
    name: row.name,
    telegram: row.telegram,
    skype: row.skype,
    email: row.email,
    source: row.source,
    temperature: row.temperature,
    potential: row.potential,
    depositProbability: row.deposit_probability,
    lastContactDate: row.last_contact_date,
    funnelStatus: row.funnel_status,
    relationshipStatus: row.relationship_status,
    isVip: row.is_vip,
    notes: row.notes,
    aiBrief: row.ai_brief,
    aiNextAction: row.ai_next_action,
    aiNextActionReason: row.ai_next_action_reason,
    ownerId: row.owner_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTask(row: any, startOfToday: Date): Task {
  return {
    id: row.id,
    partnerId: row.partner_id,
    partnerName: row.partner_name,
    title: row.title,
    description: row.description,
    deadline: row.deadline,
    priority: row.priority,
    expectedResult: row.expected_result,
    status: row.status,
    isOverdue: new Date(row.deadline).getTime() < startOfToday.getTime(),
    createdAt: row.created_at,
  };
}

function mapEvent(row: any): TimelineEvent {
  return {
    id: row.id,
    partnerId: row.partner_id,
    partnerName: row.partners?.name ?? "—",
    type: row.type,
    description: row.description,
    createdAt: row.created_at,
  };
}

const TEMPERATURE_RANK: Record<string, number> = {
  Горячий: 0,
  Тёплый: 1,
  Холодный: 2,
};

export interface DashboardData {
  tasksToday: Task[];
  priorityPartners: Partner[];
  waitingForReply: Partner[];
  waitingForMe: Partner[];
  recentEvents: TimelineEvent[];
  totalPartners: number;
  allOpenTasks: Task[];
  aiPlan: Partner[];
  allPartnersForBulk: { id: string; name: string }[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = createClient();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [tasksRes, partnersRes, eventsRes, allOpenTasksRes] = await Promise.all([
    supabase
      .from("v_tasks_with_partner")
      .select("*")
      .neq("status", "Выполнена")
      .lte("deadline", endOfToday.toISOString())
      .order("deadline", { ascending: true }),
    supabase
      .from("partners")
      .select("*")
      .order("updated_at", { ascending: false }),
    supabase
      .from("timeline_events")
      .select("*, partners(name)")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("v_tasks_with_partner")
      .select("*")
      .neq("status", "Выполнена")
      .order("deadline", { ascending: true }),
  ]);

  const allPartners = (partnersRes.data ?? []).map(mapPartner);

  // "Жду ответа": последний контакт был больше 2 дней назад и партнёр не на паузе/закрыт.
  const waitingForReply = allPartners.filter((p) => {
    if (!p.lastContactDate) return false;
    if (["Пауза", "Закрыт"].includes(p.funnelStatus)) return false;
    const daysSince = (Date.now() - new Date(p.lastContactDate).getTime()) / 86_400_000;
    return daysSince >= 2;
  });

  // "Ждут моего ответа" — пока нет отдельного признака входящего сообщения в схеме,
  // временно берём партнёров с горячей температурой и недавним контактом.
  // TODO: заменить на реальный признак "unread_from_partner" в timeline_events.
  const waitingForMe = allPartners.filter(
    (p) => p.temperature === "Горячий" && !waitingForReply.includes(p)
  );

  // Приоритет: VIP и высокий потенциал/вероятность депозитов — наверх.
  const priorityPartners = [...allPartners]
    .sort((a, b) => {
      const score = (p: Partner) =>
        (p.isVip ? 10 : 0) +
        (p.potential === "Высокий" ? 3 : p.potential === "Средний" ? 1 : 0) +
        (p.depositProbability === "Высокая" ? 3 : p.depositProbability === "Средняя" ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, 5);

  // "План на день" — все рекомендации AI Brief, сортировка по температуре:
  // чем горячее партнёр, тем выше и срочнее.
  const aiPlan = allPartners
    .filter((p) => Boolean(p.aiNextAction))
    .sort((a, b) => (TEMPERATURE_RANK[a.temperature] ?? 3) - (TEMPERATURE_RANK[b.temperature] ?? 3));

  return {
    tasksToday: (tasksRes.data ?? []).map((row) => mapTask(row, startOfToday)),
    priorityPartners,
    waitingForReply,
    waitingForMe,
    recentEvents: (eventsRes.data ?? []).map(mapEvent),
    totalPartners: allPartners.length,
    allOpenTasks: (allOpenTasksRes.data ?? []).map((row) => mapTask(row, startOfToday)),
    aiPlan,
    allPartnersForBulk: allPartners.map((p) => ({ id: p.id, name: p.name })),
  };
}

// ---------- Экран "Партнёры" ----------

export interface PartnersFilters {
  search?: string;
  funnelStatus?: string;
  potential?: string;
  temperature?: string;
  source?: string;
  // Кол-во дней без контакта: показать тех, с кем не общались N+ дней.
  staleDays?: string;
}

export async function getPartners(filters: PartnersFilters): Promise<Partner[]> {
  const supabase = createClient();

  let query = supabase.from("partners").select("*").order("updated_at", { ascending: false });

  if (filters.search) {
    const term = filters.search.trim();
    if (term) {
      query = query.or(
        `name.ilike.%${term}%,telegram.ilike.%${term}%,email.ilike.%${term}%`
      );
    }
  }
  if (filters.funnelStatus) query = query.eq("funnel_status", filters.funnelStatus);
  if (filters.potential) query = query.eq("potential", filters.potential);
  if (filters.temperature) query = query.eq("temperature", filters.temperature);
  if (filters.source) query = query.eq("source", filters.source);

  const { data } = await query;
  let partners = (data ?? []).map(mapPartner);

  if (filters.staleDays) {
    const threshold = Number(filters.staleDays);
    partners = partners.filter((p) => {
      if (!p.lastContactDate) return true; // никогда не было контакта — тоже "давно"
      const daysSince = (Date.now() - new Date(p.lastContactDate).getTime()) / 86_400_000;
      return daysSince >= threshold;
    });
  }

  return partners;
}

export async function getPartnerById(id: string): Promise<Partner | null> {
  const supabase = createClient();
  const { data } = await supabase.from("partners").select("*").eq("id", id).maybeSingle();
  return data ? mapPartner(data) : null;
}

// ---------- Задачи внутри карточки партнёра ----------

export interface PartnerTask {
  id: string;
  title: string;
  description: string | null;
  deadline: string;
  priority: string;
  expectedResult: string | null;
  status: string;
}

export async function getTasksForPartner(partnerId: string): Promise<PartnerTask[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("tasks")
    .select("id, title, description, deadline, priority, expected_result, status")
    .eq("partner_id", partnerId)
    .order("status", { ascending: true })
    .order("deadline", { ascending: true });

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    deadline: row.deadline,
    priority: row.priority,
    expectedResult: row.expected_result,
    status: row.status,
  }));
}

// ---------- Timeline партнёра ----------

export interface PartnerTimelineEvent {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

export async function getTimelineForPartner(partnerId: string): Promise<PartnerTimelineEvent[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("timeline_events")
    .select("id, type, description, created_at")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []).map((row) => ({
    id: row.id,
    type: row.type,
    description: row.description,
    createdAt: row.created_at,
  }));
}

// ---------- Проекты партнёра ----------

export interface PartnerProject {
  id: string;
  geo: string;
  brand: string;
  paymentModel: string;
  status: string;
  kpi: string | null;
  comment: string | null;
  createdAt: string;
}

export async function getProjectsForPartner(partnerId: string): Promise<PartnerProject[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("projects")
    .select("id, geo, brand, payment_model, status, kpi, comment, created_at")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    geo: row.geo,
    brand: row.brand,
    paymentModel: row.payment_model,
    status: row.status,
    kpi: row.kpi,
    comment: row.comment,
    createdAt: row.created_at,
  }));
}

// ---------- AI Memory партнёра ----------

export interface PartnerMemoryFact {
  id: string;
  fact: string;
  createdAt: string;
}

export async function getMemoryFactsForPartner(partnerId: string): Promise<PartnerMemoryFact[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("ai_memory_facts")
    .select("id, fact, created_at")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    fact: row.fact,
    createdAt: row.created_at,
  }));
}
