"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createPartner(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Название партнёра обязательно");
  }

  const telegram = String(formData.get("telegram") ?? "").trim() || null;
  const skype = String(formData.get("skype") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const source = String(formData.get("source") ?? "Другой");
  const temperature = String(formData.get("temperature") ?? "Холодный");
  const potential = String(formData.get("potential") ?? "Не определён");
  const depositProbability = String(formData.get("depositProbability") ?? "Не определена");
  const funnelStatus = String(formData.get("funnelStatus") ?? "Первый контакт");
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const confirmDuplicate = formData.get("confirmDuplicate") === "true";

  // Проверка дублей: тот же менеджер уже мог занести этого партнёра раньше.
  if (!confirmDuplicate) {
    const orConditions: string[] = [`name.ilike.${name.replace(/[,()%]/g, "")}`];
    if (telegram) orConditions.push(`telegram.ilike.${telegram.replace(/[,()%]/g, "")}`);
    if (email) orConditions.push(`email.ilike.${email.replace(/[,()%]/g, "")}`);
    if (skype) orConditions.push(`skype.ilike.${skype.replace(/[,()%]/g, "")}`);

    const { data: possibleDuplicates } = await supabase
      .from("partners")
      .select("id, name, telegram, email, skype")
      .eq("owner_id", user.id)
      .or(orConditions.join(","));

    if (possibleDuplicates && possibleDuplicates.length > 0) {
      const match = possibleDuplicates[0];
      if (match) {
        let matchedField = "названию";
        if (telegram && match.telegram?.toLowerCase() === telegram.toLowerCase()) matchedField = "Telegram";
        else if (email && match.email?.toLowerCase() === email.toLowerCase()) matchedField = "email";
        else if (skype && match.skype?.toLowerCase() === skype.toLowerCase()) matchedField = "Skype";

        throw new Error(
          JSON.stringify({
            code: "DUPLICATE_PARTNER",
            id: match.id,
            name: match.name,
            matchedField,
          })
        );
      }
    }
  }

  const { data, error } = await supabase
    .from("partners")
    .insert({
      owner_id: user.id,
      name,
      telegram,
      skype,
      email,
      source,
      temperature,
      potential,
      deposit_probability: depositProbability,
      funnel_status: funnelStatus,
      notes,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/partners/${data.id}`);
}

export async function updatePartner(partnerId: string, formData: FormData) {
  const supabase = createClient();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Название партнёра обязательно");
  }

  const telegram = String(formData.get("telegram") ?? "").trim() || null;
  const skype = String(formData.get("skype") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const source = String(formData.get("source") ?? "Другой");
  const temperature = String(formData.get("temperature") ?? "Холодный");
  const potential = String(formData.get("potential") ?? "Не определён");
  const depositProbability = String(formData.get("depositProbability") ?? "Не определена");
  const funnelStatus = String(formData.get("funnelStatus") ?? "Первый контакт");
  const relationshipStatus = String(formData.get("relationshipStatus") ?? "Не сформированы");
  const isVip = formData.get("isVip") === "on";
  const lastContactDateRaw = String(formData.get("lastContactDate") ?? "");
  const lastContactDate = lastContactDateRaw || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const { error } = await supabase
    .from("partners")
    .update({
      name,
      telegram,
      skype,
      email,
      source,
      temperature,
      potential,
      deposit_probability: depositProbability,
      funnel_status: funnelStatus,
      relationship_status: relationshipStatus,
      is_vip: isVip,
      last_contact_date: lastContactDate,
      notes,
    })
    .eq("id", partnerId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/partners/${partnerId}`);
  revalidatePath("/partners");
  revalidatePath("/dashboard");
}

export async function deletePartner(partnerId: string) {
  const supabase = createClient();

  const { error } = await supabase.from("partners").delete().eq("id", partnerId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/partners");
  revalidatePath("/dashboard");
}
