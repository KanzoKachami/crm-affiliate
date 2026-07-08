-- =========================================================
-- Partner OS — схема БД для MVP (Supabase / Postgres)
-- =========================================================
-- Порядок объектов: enum-типы -> таблицы -> индексы -> RLS ->
-- триггер автогенерации timeline -> view для дашборда.

-- ---------- ENUM-типы ----------

create type traffic_source as enum ('SEO', 'FB', 'PPC', 'ASO', 'UAC', 'INAPP', 'NETWORK', 'SMS', 'EMAIL', 'Другой');

create type temperature as enum ('Холодный', 'Тёплый', 'Горячий');

create type potential as enum ('Не определён', 'Низкий', 'Средний', 'Высокий');

create type deposit_probability as enum ('Не определена', 'Низкая', 'Средняя', 'Высокая');

create type funnel_status as enum (
  'Первый контакт',
  'Переговоры',
  'Ждём запуск',
  'Первый тест',
  'Активный',
  'Масштабирование',
  'Пауза',
  'Закрыт'
);

create type relationship_status as enum (
  'Не сформированы',
  'Отличные',
  'Хорошие',
  'Требуют внимания',
  'Риск потерять',
  'Приостановлено нами',
  'Не сошлись условиями'
);

create type task_priority as enum ('Низкий', 'Средний', 'Высокий');

create type task_status as enum ('Открыта', 'В работе', 'Выполнена', 'Просрочена');

create type timeline_event_type as enum (
  'message_sent',
  'message_received',
  'note_added',
  'task_created',
  'task_completed',
  'project_created',
  'project_updated',
  'stats_sent',
  'ftd_received',
  'scaling_discussed',
  'status_changed'
);

-- ---------- Таблицы ----------

-- Партнёры — центральная сущность.
create table partners (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,

  name text not null,
  telegram text,
  skype text,
  email text,

  source traffic_source not null default 'Другой',
  temperature temperature not null default 'Холодный',
  potential potential not null default 'Не определён',
  deposit_probability deposit_probability not null default 'Не определена',

  last_contact_date date,
  funnel_status funnel_status not null default 'Первый контакт',
  relationship_status relationship_status not null default 'Не сформированы',
  is_vip boolean not null default false,

  -- Свободный комментарий менеджера — учитывается AI при генерации брифа.
  notes text,

  -- Поля, которые заполняет/обновляет AI-слой.
  ai_brief text,
  ai_next_action text,
  ai_next_action_reason text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column partners.ai_brief is 'Краткая сводка по партнёру, генерируется AI на основе timeline и memory.';
comment on column partners.ai_next_action is 'Единственное рекомендованное AI следующее действие.';

-- Проекты партнёра (GEO + бренд + модель оплаты).
create table projects (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references partners (id) on delete cascade,

  geo text not null,
  brand text not null,
  payment_model text not null,
  status text not null default 'Активный',
  kpi text,
  comment text,

  created_at timestamptz not null default now()
);

-- Задачи, привязанные к партнёру.
create table tasks (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references partners (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,

  title text not null,
  description text,
  deadline timestamptz not null,
  priority task_priority not null default 'Средний',
  expected_result text,
  status task_status not null default 'Открыта',

  created_at timestamptz not null default now()
);

-- Единая хронология событий по партнёру — наполняется вручную и триггерами.
create table timeline_events (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references partners (id) on delete cascade,

  type timeline_event_type not null,
  description text not null,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

-- Факты, которые AI запоминает про партнёра (стиль общения, привычки и т.п.)
create table ai_memory_facts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references partners (id) on delete cascade,

  fact text not null,

  created_at timestamptz not null default now()
);

-- ---------- Индексы ----------

create index idx_partners_owner on partners (owner_id);
create index idx_partners_funnel_status on partners (funnel_status);
create index idx_partners_last_contact on partners (last_contact_date);

create index idx_projects_partner on projects (partner_id);

create index idx_tasks_partner on tasks (partner_id);
create index idx_tasks_owner_deadline on tasks (owner_id, deadline);
create index idx_tasks_status on tasks (status);

create index idx_timeline_partner_created on timeline_events (partner_id, created_at desc);

create index idx_ai_memory_partner on ai_memory_facts (partner_id);

-- ---------- updated_at триггер ----------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_partners_updated_at
before update on partners
for each row execute function set_updated_at();

-- ---------- Row Level Security ----------
-- Каждый менеджер видит и редактирует только своих партнёров и свои задачи.
-- Дочерние таблицы (projects, timeline_events, ai_memory_facts) наследуют
-- доступ через partner_id -> partners.owner_id.

alter table partners enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table timeline_events enable row level security;
alter table ai_memory_facts enable row level security;

create policy "owner_full_access_partners" on partners
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "owner_full_access_tasks" on tasks
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "owner_full_access_projects" on projects
  for all using (
    exists (select 1 from partners p where p.id = projects.partner_id and p.owner_id = auth.uid())
  ) with check (
    exists (select 1 from partners p where p.id = projects.partner_id and p.owner_id = auth.uid())
  );

create policy "owner_full_access_timeline" on timeline_events
  for all using (
    exists (select 1 from partners p where p.id = timeline_events.partner_id and p.owner_id = auth.uid())
  ) with check (
    exists (select 1 from partners p where p.id = timeline_events.partner_id and p.owner_id = auth.uid())
  );

create policy "owner_full_access_ai_memory" on ai_memory_facts
  for all using (
    exists (select 1 from partners p where p.id = ai_memory_facts.partner_id and p.owner_id = auth.uid())
  ) with check (
    exists (select 1 from partners p where p.id = ai_memory_facts.partner_id and p.owner_id = auth.uid())
  );

-- ---------- Автозапись в timeline ----------
-- Любое создание задачи или проекта автоматически логируется в timeline,
-- чтобы "Timeline должен обновляться автоматически" (требование из брифа)
-- выполнялось на уровне БД, а не полагалось на дисциплину фронтенда.

create or replace function log_task_created()
returns trigger as $$
begin
  insert into timeline_events (partner_id, type, description)
  values (new.partner_id, 'task_created', 'Создана задача: ' || new.title);
  return new;
end;
$$ language plpgsql;

create trigger trg_log_task_created
after insert on tasks
for each row execute function log_task_created();

create or replace function log_task_completed()
returns trigger as $$
begin
  if new.status = 'Выполнена' and old.status <> 'Выполнена' then
    insert into timeline_events (partner_id, type, description)
    values (new.partner_id, 'task_completed', 'Задача выполнена: ' || new.title);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_log_task_completed
after update on tasks
for each row execute function log_task_completed();

create or replace function log_project_created()
returns trigger as $$
begin
  insert into timeline_events (partner_id, type, description)
  values (new.partner_id, 'project_created', 'Новый проект: ' || new.brand || ' / ' || new.geo);
  return new;
end;
$$ language plpgsql;

create trigger trg_log_project_created
after insert on projects
for each row execute function log_project_created();

-- ---------- View для Dashboard ----------
-- Считает для каждой задачи владельца — используется на главном экране
-- для блока "Задачи на сегодня" без дополнительных join на клиенте.

create view v_tasks_with_partner as
select
  t.id,
  t.owner_id,
  t.partner_id,
  p.name as partner_name,
  t.title,
  t.description,
  t.deadline,
  t.priority,
  t.expected_result,
  t.status,
  t.created_at
from tasks t
join partners p on p.id = t.partner_id;
