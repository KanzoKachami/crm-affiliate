"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createProject(partnerId: string, formData: FormData) {
  const supabase = createClient();

  const geo = String(formData.get("geo") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  if (!geo || !brand) {
    throw new Error("GEO и бренд обязательны.");
  }

  const paymentModel = String(formData.get("paymentModel") ?? "").trim() || "RevShare";
  const status = String(formData.get("status") ?? "Активный");
  const kpi = String(formData.get("kpi") ?? "").trim() || null;
  const comment = String(formData.get("comment") ?? "").trim() || null;

  const { error } = await supabase.from("projects").insert({
    partner_id: partnerId,
    geo,
    brand,
    payment_model: paymentModel,
    status,
    kpi,
    comment,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/partners/${partnerId}`);
}

export async function updateProject(partnerId: string, projectId: string, formData: FormData) {
  const supabase = createClient();

  const geo = String(formData.get("geo") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  if (!geo || !brand) {
    throw new Error("GEO и бренд обязательны.");
  }

  const paymentModel = String(formData.get("paymentModel") ?? "").trim() || "RevShare";
  const status = String(formData.get("status") ?? "Активный");
  const kpi = String(formData.get("kpi") ?? "").trim() || null;
  const comment = String(formData.get("comment") ?? "").trim() || null;

  const { error } = await supabase
    .from("projects")
    .update({
      geo,
      brand,
      payment_model: paymentModel,
      status,
      kpi,
      comment,
    })
    .eq("id", projectId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/partners/${partnerId}`);
}

export async function deleteProject(partnerId: string, projectId: string) {
  const supabase = createClient();

  const { error } = await supabase.from("projects").delete().eq("id", projectId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/partners/${partnerId}`);
}
