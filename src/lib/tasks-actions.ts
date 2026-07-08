"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTask(partnerId: string, formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Нужно войти в аккаунт.");
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    throw new Error("Название задачи обязательно.");
  }

  const description = String(formData.get("description") ?? "").trim() || null;
  const expectedResult = String(formData.get("expectedResult") ?? "").trim() || null;
  const priority = String(formData.get("priority") ?? "Средний");
  const deadlineRaw = String(formData.get("deadline") ?? "");

  if (!deadlineRaw) {
    throw new Error("Укажи дедлайн задачи.");
  }

  const { error } = await supabase.from("tasks").insert({
    partner_id: partnerId,
    owner_id: user.id,
    title,
    description,
    expected_result: expectedResult,
    priority,
    deadline: new Date(deadlineRaw).toISOString(),
    status: "Открыта",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/partners/${partnerId}`);
  revalidatePath("/dashboard");
}

export async function toggleTaskDone(partnerId: string, taskId: string, currentlyDone: boolean) {
  const supabase = createClient();

  const { error } = await supabase
    .from("tasks")
    .update({ status: currentlyDone ? "Открыта" : "Выполнена" })
    .eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/partners/${partnerId}`);
  revalidatePath("/dashboard");
}

export async function updateTask(partnerId: string, taskId: string, formData: FormData) {
  const supabase = createClient();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    throw new Error("Название задачи обязательно.");
  }

  const description = String(formData.get("description") ?? "").trim() || null;
  const expectedResult = String(formData.get("expectedResult") ?? "").trim() || null;
  const priority = String(formData.get("priority") ?? "Средний");
  const deadlineRaw = String(formData.get("deadline") ?? "");

  if (!deadlineRaw) {
    throw new Error("Укажи дедлайн задачи.");
  }

  const { error } = await supabase
    .from("tasks")
    .update({
      title,
      description,
      expected_result: expectedResult,
      priority,
      deadline: new Date(deadlineRaw).toISOString(),
    })
    .eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/partners/${partnerId}`);
  revalidatePath("/dashboard");
}

export async function deleteTask(partnerId: string, taskId: string) {
  const supabase = createClient();

  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/partners/${partnerId}`);
  revalidatePath("/dashboard");
}
