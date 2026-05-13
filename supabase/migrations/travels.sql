-- =====================================================================
-- MIGRACIÓN: Interés "travels" (Viajes)
-- Ejecutar en Supabase Studio → SQL Editor.
-- Replica el patrón de restaurants/movies + travel_reviews.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Tabla principal: travels
-- ---------------------------------------------------------------------
create table if not exists public.travels (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,

  -- Identidad
  name                text not null,           -- "Japón 2024", "Roadtrip California"
  slug                text not null unique,

  -- Descripciones
  description         text,
  long_description    text,                    -- diario / historia

  -- Destino
  destination_country text,
  destination_city    text,
  destination_region  text,                    -- estado / provincia
  latitude            double precision,
  longitude           double precision,

  -- Fechas del viaje
  start_date          date,
  end_date            date,

  -- Metadatos del viaje
  trip_type           text,                    -- "playa, cultural" (mismo patrón que cuisine_type)
  budget_range        text,                    -- "$" / "$$" / "$$$" / "$$$$"
  companions          text,                    -- "Solo", "Familia", "Pareja", "Amigos"
  transport           text,                    -- "Avión", "Auto", "Tren"
  accommodation       text,                    -- "Hotel", "Airbnb", "Casa de amigos"

  -- Recursos
  image_url           text,                    -- foto principal

  -- Privacidad: 0 = público, 1 = solo amigos, 2 = privado
  permission          integer not null default 0,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists travels_user_id_idx     on public.travels (user_id);
create index if not exists travels_slug_idx        on public.travels (slug);
create index if not exists travels_country_idx     on public.travels (destination_country);
create index if not exists travels_start_date_idx  on public.travels (start_date);

-- ---------------------------------------------------------------------
-- 2) Tabla de reviews: travel_reviews
--    Schema idéntico a restaurant_reviews / movie_reviews.
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
-- 3) RLS policies (mismo modelo que restaurants)
-- ---------------------------------------------------------------------
alter table public.travels         enable row level security;
alter table public.travel_reviews  enable row level security;

-- travels: lectura pública, escritura solo por el dueño
drop policy if exists "travels_select_all"     on public.travels;
drop policy if exists "travels_insert_owner"   on public.travels;
drop policy if exists "travels_update_owner"   on public.travels;
drop policy if exists "travels_delete_owner"   on public.travels;

create policy "travels_select_all"
  on public.travels for select
  using (true);

create policy "travels_insert_owner"
  on public.travels for insert
  with check (auth.uid() = user_id);

create policy "travels_update_owner"
  on public.travels for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "travels_delete_owner"
  on public.travels for delete
  using (auth.uid() = user_id);

-- travel_reviews: lectura pública, escritura solo por el autor del review
drop policy if exists "travel_reviews_select_all"   on public.travel_reviews;
drop policy if exists "travel_reviews_insert_owner" on public.travel_reviews;
drop policy if exists "travel_reviews_update_owner" on public.travel_reviews;
drop policy if exists "travel_reviews_delete_owner" on public.travel_reviews;

create policy "travel_reviews_select_all"
  on public.travel_reviews for select
  using (true);

create policy "travel_reviews_insert_owner"
  on public.travel_reviews for insert
  with check (auth.uid() = user_id);

create policy "travel_reviews_update_owner"
  on public.travel_reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "travel_reviews_delete_owner"
  on public.travel_reviews for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 4) Trigger para mantener travels.updated_at
--    (Reusa set_updated_at() si ya existe de movies.sql)
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists travels_set_updated_at on public.travels;

create trigger travels_set_updated_at
  before update on public.travels
  for each row
  execute function public.set_updated_at();
