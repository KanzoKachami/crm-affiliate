import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { LogoutButton } from "@/components/layout/logout-button";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="px-6 sm:px-10 py-8 max-w-2xl mx-auto flex flex-col gap-6">
      <h1 className="font-display text-xl font-medium text-paper">Настройки</h1>

      <Card className="p-6">
        <p className="text-xs text-fog font-mono uppercase tracking-wide">Аккаунт</p>
        <p className="text-sm text-paper mt-1">{user?.email}</p>
      </Card>

      <Card className="p-6">
        <p className="text-sm text-fog mb-4">
          Здесь позже появятся настройки AI-модели, интеграций и уведомлений — по мере того, как они
          понадобятся в реальной работе.
        </p>
        <LogoutButton />
      </Card>
    </div>
  );
}
