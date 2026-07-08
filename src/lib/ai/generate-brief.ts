"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `Ты — AI-ассистент внутри CRM для affiliate-менеджера в гемблинг-вертикали.
Тебе дают данные об одном партнёре: его карточку, историю событий (timeline), заметки (AI memory),
свободный комментарий менеджера и активные проекты.

Некоторые поля могут иметь значение "Не определён"/"Не определена" — это означает, что менеджер ещё
не оценивал этот параметр, а не то, что он низкий. Не путай отсутствие оценки с низким значением.

Статус "отношения" также может быть "Приостановлено нами" (мы сами временно свернули сотрудничество,
например из-за условий выплат) или "Не сошлись условиями" (холодный контакт, договориться не вышло) —
учитывай это, предлагая следующее действие: для таких партнёров чаще уместно не "написать", а
"пересмотреть условия" или оставить как есть.

Верни JSON строго в формате:
{
  "brief": "2-4 предложения: с кем работаем, сколько по времени, какие GEO, что происходит сейчас",
  "nextAction": "одно короткое конкретное действие, которое стоит сделать менеджеру следующим",
  "nextActionReason": "одно предложение — почему именно это действие сейчас приоритетно"
}

Пиши по-русски, по делу, без воды и общих фраз. Опирайся только на данные, которые тебе дали —
если данных мало, честно скажи в brief, что партнёр только в начале пути, и предложи next action
по сбору базовой информации. Комментарий менеджера — самый достоверный источник контекста, доверяй
ему больше, чем предположениям на основе статусов.`;

interface RawPartner {
  name: string;
  telegram: string | null;
  source: string;
  temperature: string;
  potential: string;
  deposit_probability: string;
  funnel_status: string;
  relationship_status: string;
  last_contact_date: string | null;
  created_at: string;
  notes: string | null;
}

interface RawEvent {
  type: string;
  description: string;
  created_at: string;
}

interface RawFact {
  fact: string;
}

interface RawProject {
  geo: string;
  brand: string;
  payment_model: string;
  status: string;
  kpi: string | null;
}

function buildContext(
  partner: RawPartner,
  events: RawEvent[],
  facts: RawFact[],
  projects: RawProject[]
) {
  const daysSinceCreated = Math.round(
    (Date.now() - new Date(partner.created_at).getTime()) / 86_400_000
  );

  const lines = [
    `Партнёр: ${partner.name}`,
    `В работе: ${daysSinceCreated} дн.`,
    `Источник трафика: ${partner.source}`,
    `Температура: ${partner.temperature}, потенциал: ${partner.potential}, вероятность депозитов: ${partner.deposit_probability}`,
    `Статус воронки: ${partner.funnel_status}, отношения: ${partner.relationship_status}`,
    `Последний контакт: ${partner.last_contact_date ?? "ещё не было"}`,
    "",
    "Комментарий менеджера о партнёре (важный контекст, приоритетнее общих предположений):",
    partner.notes ? partner.notes : "(комментария нет)",
    "",
    "Активные проекты:",
    ...(projects.length
      ? projects.map((p) => `- ${p.brand} / ${p.geo}, модель: ${p.payment_model}, статус: ${p.status}${p.kpi ? `, KPI: ${p.kpi}` : ""}`)
      : ["(проектов пока нет)"]),
    "",
    "AI Memory (факты о партнёре):",
    ...(facts.length ? facts.map((f) => `- ${f.fact}`) : ["(фактов пока нет)"]),
    "",
    "Последние события (Timeline, от новых к старым):",
    ...(events.length
      ? events.map((e) => `- [${new Date(e.created_at).toLocaleDateString("ru-RU")}] ${e.description}`)
      : ["(событий пока нет)"]),
  ];

  return lines.join("\n");
}

export async function generatePartnerBrief(partnerId: string) {
  const supabase = createClient();

  const [{ data: partner, error: partnerError }, { data: events }, { data: facts }, { data: projects }] =
    await Promise.all([
      supabase.from("partners").select("*").eq("id", partnerId).single(),
      supabase
        .from("timeline_events")
        .select("type, description, created_at")
        .eq("partner_id", partnerId)
        .order("created_at", { ascending: false })
        .limit(15),
      supabase.from("ai_memory_facts").select("fact").eq("partner_id", partnerId),
      supabase.from("projects").select("geo, brand, payment_model, status, kpi").eq("partner_id", partnerId),
    ]);

  if (partnerError || !partner) {
    throw new Error("Партнёр не найден.");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY не настроен в переменных окружения Vercel. Добавь его в Settings → Environment Variables."
    );
  }

  const context = buildContext(partner, events ?? [], facts ?? [], projects ?? []);

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: context }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ошибка Gemini API (${response.status}): ${text.slice(0, 300)}`);
  }

  const data = await response.json();
  const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  let parsed: { brief: string; nextAction: string; nextActionReason: string };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Не удалось разобрать ответ AI. Попробуй ещё раз.");
  }

  const { error: updateError } = await supabase
    .from("partners")
    .update({
      ai_brief: parsed.brief,
      ai_next_action: parsed.nextAction,
      ai_next_action_reason: parsed.nextActionReason,
    })
    .eq("id", partnerId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath(`/partners/${partnerId}`);
  revalidatePath("/dashboard");
  revalidatePath("/partners");
}
