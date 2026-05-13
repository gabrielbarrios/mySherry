-- =====================================================================
-- MIGRACIÓN: Interés "movies" (Películas)
-- Ejecutar en Supabase Studio → SQL Editor (o con CLI).
-- Replica el patrón de restaurants + restaurant_reviews.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Tabla principal: movies
-- ---------------------------------------------------------------------
create table if not exists public.movies (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,

  -- Identidad
  name              text not null,
  slug              text not null unique,

  -- Descripciones
  description       text,
  long_description  text,

  -- Metadatos de la película
  genre             text,           -- "drama, sci-fi" (mismo patrón que cuisine_type)
  director          text,
  release_year      integer,
  duration_minutes  integer,
  language          text,
  country           text,

  -- Recursos
  image_url         text,           -- póster
  trailer_url       text,           -- YouTube / Vimeo
  where_to_watch    text,           -- "Netflix, Prime Video, Cine"

  -- Privacidad: 0 = público, 1 = solo amigos, 2 = privado
  permission        integer not null default 0,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists movies_user_id_idx       on public.movies (user_id);
create index if not exists movies_slug_idx          on public.movies (slug);
create index if not exists movies_release_year_idx  on public.movies (release_year);

-- ---------------------------------------------------------------------
-- 2) Tabla de reviews: movie_reviews
--    Schema idéntico a restaurant_reviews/recipe_reviews.
-- ---------------------------------------------------------------------
create table if not exists public.movie_reviews (
  id              uuid primary key default gen_random_uuid(),
  item_id         uuid not null references public.movies(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  rating          smallint not null check (rating between 1 and 5),
  personal_review text,
  created_at      timestamptz not null default now(),
  unique (user_id, item_id)
);

create index if not exists movie_reviews_item_id_idx on public.movie_reviews (item_id);
create index if not exists movie_reviews_user_id_idx on public.movie_reviews (user_id);

-- ---------------------------------------------------------------------
-- 3) RLS policies (mismo modelo que restaurants)
-- ---------------------------------------------------------------------
alter table public.movies         enable row level security;
alter table public.movie_reviews  enable row level security;

-- movies: lectura pública, escritura solo por el dueño
drop policy if exists "movies_select_all"     on public.movies;
drop policy if exists "movies_insert_owner"   on public.movies;
drop policy if exists "movies_update_owner"   on public.movies;
drop policy if exists "movies_delete_owner"   on public.movies;

create policy "movies_select_all"
  on public.movies for select
  using (true);

create policy "movies_insert_owner"
  on public.movies for insert
  with check (auth.uid() = user_id);

create policy "movies_update_owner"
  on public.movies for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "movies_delete_owner"
  on public.movies for delete
  using (auth.uid() = user_id);

-- movie_reviews: lectura pública, escritura solo por el autor del review
drop policy if exists "movie_reviews_select_all"   on public.movie_reviews;
drop policy if exists "movie_reviews_insert_owner" on public.movie_reviews;
drop policy if exists "movie_reviews_update_owner" on public.movie_reviews;
drop policy if exists "movie_reviews_delete_owner" on public.movie_reviews;

create policy "movie_reviews_select_all"
  on public.movie_reviews for select
  using (true);

create policy "movie_reviews_insert_owner"
  on public.movie_reviews for insert
  with check (auth.uid() = user_id);

create policy "movie_reviews_update_owner"
  on public.movie_reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "movie_reviews_delete_owner"
  on public.movie_reviews for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 4) Trigger para mantener movies.updated_at
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

drop trigger if exists movies_set_updated_at on public.movies;

create trigger movies_set_updated_at
  before update on public.movies
  for each row
  execute function public.set_updated_at();
