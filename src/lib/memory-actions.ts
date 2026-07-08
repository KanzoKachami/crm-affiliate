"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addMemoryFact(partnerId: string, formData: FormData) {
  const supabase = createClient();

  const fact = String(formData.get("fact") ?? "").trim();
  if (!fact) {
    throw new Error("Заполни текст факта.");
  }

  const { error } = await supabase.from("ai_memory_facts").insert({
    partner_id: partnerId,
    fact,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/partners/${partnerId}`);
}

export async function deleteMemoryFact(partnerId: string, factId: string) {
  const supabase = createClient();

  const { error } = await supabase.from("ai_memory_facts").delete().eq("id", factId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/partners/${partnerId}`);
}
