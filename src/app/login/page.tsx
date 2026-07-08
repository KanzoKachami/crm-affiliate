"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("Неверный email или пароль.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-signal opacity-75 animate-pulse-dot" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-signal" />
          </span>
          <span className="font-display font-medium text-[15px] tracking-tight">
            Partner OS
          </span>
        </div>

        <h1 className="font-display text-lg font-medium mb-1">Вход</h1>
        <p className="text-sm text-fog mb-6">
          Войди своим email и паролем от аккаунта.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-fog font-mono uppercase tracking-wide">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-panel-raised px-3 py-2 text-sm text-paper outline-none focus-visible:ring-0"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-xs text-fog font-mono uppercase tracking-wide">Пароль</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-panel-raised px-3 py-2 text-sm text-paper outline-none focus-visible:ring-0"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-risk">{error}</p>}

          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? "Входим..." : "Войти"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
