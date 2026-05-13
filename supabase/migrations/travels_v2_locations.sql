-- =====================================================================
-- MIGRACIÓN: travels v2 — Cambia el modelo de ubicación a JSONB
-- =====================================================================
-- Antes: campos planos (destination_country, destination_city,
--        destination_region, latitude, longitude).
-- Ahora: un array JSON `visited_locations` con [{country_code,
--        country_name, region_code, region_name}], para que un viaje
--        pueda tener múltiples destinos seleccionados desde un mapa.
--
-- Si NO has corrido travels.sql todavía, ejecuta ESTE archivo en su
-- lugar (es la versión actualizada del schema completo).
-- Si YA habías creado travels con el schema viejo, este script hace
-- el migrate sin perder datos (campos viejos se eliminan).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Tabla principal: travels  (CREATE IF NOT EXISTS para idempotencia)
-- ---------------------------------------------------------------------
create table if not exists public.travels (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  name                text not null,
  slug                text not null unique,
  description         text,
  long_description    text,
  trip_type           text,
  budget_range        text,
  companions          text,
  transport           text,
  accommodation       text,
  image_url           text,
  start_date          date,
  end_date            date,
  permission          integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2) Drop columnas viejas si existen (de la v1 de travels)
-- ---------------------------------------------------------------------
alter table public.travels drop column if exists destination_country;
alter table public.travels drop column if exists destination_city;
alter table public.travels drop column if exists destination_region;
alter table public.travels drop column if exists latitude;
alter table public.travels drop column if exists longitude;

-- ---------------------------------------------------------------------
-- 3) Agregar columna visited_locations (JSONB)
--    Estructura: [{ country_code, country_name, region_code, region_name }, ...]
-- ---------------------------------------------------------------------
alter table public.travels
  add column if not exists visited_locations jsonb not null default '[]'::jsonb;

-- Índice GIN para buscar por país visitado eficientemente
create index if not exists travels_visited_locations_gin_idx
  on public.travels using gin (visited_locations);

create index if not exists travels_user_id_idx    on public.travels (user_id);
create index if not exists travels_slug_idx       on public.travels (slug);
create index if not exists travels_start_date_idx on public.travels (start_date);

-- ---------------------------------------------------------------------
-- 4) Tabla de reviews (si no existe ya de travels.sql)
-- ---------------------------------------------------------------------
create table if not exists public.travel_reviews (
  id              uuid primary key default gen_random_uuid(),
  item_id         uuid not null references public.travels(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  rating          smallint not null check (rating between 1 and 5),
  personal_review text,
  created_at      timestamptz not null default now(),
  unique (user_id, item_id)
);

create index if not exists travel_reviews_item_id_idx on public.travel_reviews (item_id);
create index if not exists travel_reviews_user_id_idx on public.travel_reviews (user_id);

-- ---------------------------------------------------------------------
-- 5) RLS policies
-- ---------------------------------------------------------------------
alter table public.travels        enable row level security;
alter table public.travel_reviews enable row level security;

drop policy if exists "travels_select_all"   on public.travels;
drop policy if exists "travels_insert_owner" on public.travels;
drop policy if exists "travels_update_owner" on public.travels;
drop policy if exists "travels_delete_owner" on public.travels;

create policy "travels_select_all"
  on public.travels for select using (true);
create policy "travels_insert_owner"
  on public.travels for insert with check (auth.uid() = user_id);
create policy "travels_update_owner"
  on public.travels for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "travels_delete_owner"
  on public.travels for delete using (auth.uid() = user_id);

drop policy if exists "travel_reviews_select_all"   on public.travel_reviews;
drop policy if exists "travel_reviews_insert_owner" on public.travel_reviews;
drop policy if exists "travel_reviews_update_owner" on public.travel_reviews;
drop policy if exists "travel_reviews_delete_owner" on public.travel_reviews;

create policy "travel_reviews_select_all"
  on public.travel_reviews for select using (true);
create policy "travel_reviews_insert_owner"
  on public.travel_reviews for insert with check (auth.uid() = user_id);
create policy "travel_reviews_update_owner"
  on public.travel_reviews for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "travel_reviews_delete_owner"
  on public.travel_reviews for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 6) Trigger updated_at
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists travels_set_updated_at on public.travels;
create trigger travels_set_updated_at
  before update on public.travels
  for each row execute function public.set_updated_at();
