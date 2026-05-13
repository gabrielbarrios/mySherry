-- =====================================================================
-- MIGRACIÓN: travels v3 — Vincular álbum
-- =====================================================================
-- Agrega `travels.album_id` (FK opcional a `albums`).
-- Si el álbum se borra, el viaje sobrevive con album_id = null.
-- Idempotente.
-- =====================================================================

alter table public.travels
  add column if not exists album_id uuid references public.albums(id) on delete set null;

create index if not exists travels_album_id_idx on public.travels (album_id);
