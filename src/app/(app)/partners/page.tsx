import Link from "next/link";
import { Plus } from "lucide-react";
import { getPartners, type PartnersFilters } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DeletePartnerButton } from "@/components/partner/delete-partner-button";
import {
  temperatureTone,
  potentialTone,
  funnelStatusTone,
} from "@/lib/badge-tones";

const FUNNEL_STATUSES = [
  "Первый контакт",
  "Переговоры",
  "Ждём запуск",
  "Первый тест",
  "Активный",
  "Масштабирование",
  "Пауза",
  "Закрыт",
];
const POTENTIALS = ["Не определён", "Низкий", "Средний", "Высокий"];
const TEMPERATURES = ["Холодный", "Тёплый", "Горячий"];
const SOURCES = ["SEO", "FB", "PPC", "ASO", "UAC", "INAPP", "NETWORK", "SMS", "EMAIL", "Другой"];
const STALE_OPTIONS = [
  { value: "", label: "Любая давность" },
  { value: "3", label: "3+ дня без контакта" },
  { value: "7", label: "7+ дней без контакта" },
  { value: "14", label: "14+ дней без контакта" },
];

function selectClass() {
  return "rounded-md border border-line bg-panel-raised px-2.5 py-1.5 text-sm text-paper outline-none";
}

function formatDate(date: string | null) {
  if (!date) return "Не было";
  return new Date(date).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
}

export default async function PartnersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const filters: PartnersFilters = {
    search: typeof searchParams.q === "string" ? searchParams.q : undefined,
    funnelStatus: typeof searchParams.status === "string" ? searchParams.status : undefined,
    potential: typeof searchParams.potential === "string" ? searchParams.potential : undefined,
    temperature: typeof searchParams.temperature === "string" ? searchParams.temperature : undefined,
    source: typeof searchParams.source === "string" ? searchParams.source : undefined,
    staleDays: typeof searchParams.stale === "string" ? searchParams.stale : undefined,
  };

  const partners = await getPartners(filters);

  return (
    <div className="px-6 sm:px-10 py-8 max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-medium text-paper">Партнёры</h1>
          <p className="text-sm text-fog mt-0.5">{partners.length} всего</p>
        </div>
        <Link href={"/partners/new" as any}>
          <Button>
            <Plus className="h-4 w-4" />
            Новый партнёр
          </Button>
        </Link>
      </div>

      <form method="GET" className="flex flex-wrap items-center gap-2.5">
        <input
          type="text"
          name="q"
          defaultValue={filters.search}
          placeholder="Поиск по имени, telegram, email..."
          className="rounded-md border border-line bg-panel-raised px-3 py-1.5 text-sm text-paper outline-none min-w-[220px] flex-1"
        />
        <select name="status" defaultValue={filters.funnelStatus ?? ""} className={selectClass()}>
          <option value="">Все статусы</option>
          {FUNNEL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select name="potential" defaultValue={filters.potential ?? ""} className={selectClass()}>
          <option value="">Любой потенциал</option>
          {POTENTIALS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select name="temperature" defaultValue={filters.temperature ?? ""} className={selectClass()}>
          <option value="">Любая температура</option>
          {TEMPERATURES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select name="source" defaultValue={filters.source ?? ""} className={selectClass()}>
          <option value="">Любой источник</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select name="stale" defaultValue={filters.staleDays ?? ""} className={selectClass()}>
          {STALE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <Button type="submit" variant="secondary">Применить</Button>
        {(filters.search || filters.funnelStatus || filters.potential || filters.temperature || filters.source || filters.staleDays) && (
          <Link href={"/partners" as any} className="text-xs text-fog hover:text-paper underline">
            Сбросить
          </Link>
        )}
      </form>

      {partners.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-fog">
            Партнёров с такими фильтрами не нашлось. Попробуй сбросить фильтры или добавь нового партнёра.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-fog font-mono uppercase">
                <th className="px-4 py-3 font-medium">Партнёр</th>
                <th className="px-4 py-3 font-medium">Температура</th>
                <th className="px-4 py-3 font-medium">Потенциал</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium">Источник</th>
                <th className="px-4 py-3 font-medium">Последний контакт</th>
                <th className="px-4 py-3 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-line last:border-0 hover:bg-panel-raised/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link href={`/partners/${p.id}` as any} className="text-paper font-medium hover:text-signal">
                      {p.name}
                    </Link>
                    {p.isVip && <span className="ml-1.5 text-ember text-xs">VIP</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={temperatureTone[p.temperature]}>{p.temperature}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={potentialTone[p.potential]}>{p.potential}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={funnelStatusTone[p.funnelStatus]}>{p.funnelStatus}</Badge>
                  </td>
                  <td className="px-4 py-3 text-fog font-mono text-xs">{p.source}</td>
                  <td className="px-4 py-3 text-fog font-mono text-xs">{formatDate(p.lastContactDate)}</td>
                  <td className="px-4 py-3">
                    <DeletePartnerButton partnerId={p.id} partnerName={p.name} compact />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
