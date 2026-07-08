"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-fog hover:text-paper hover:bg-panel-raised transition-colors w-full"
    >
      <LogOut className="h-4 w-4" strokeWidth={1.75} />
      Выйти
    </button>
  );
}
