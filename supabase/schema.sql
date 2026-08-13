-- ============================================================
-- MAPA SOLIDARIO — Schema Supabase
-- Decisión consciente: RLS público sin autenticación para v1
-- (Emergencia Colombia agosto 2026 — velocidad > seguridad)
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists public.puntos_ayuda (
  id               uuid primary key default gen_random_uuid(),
  nombre           text not null,
  direccion        text not null,
  ciudad           text not null default 'Bogotá',
  pais             text not null default 'Colombia',
  lat              double precision,
  lng              double precision,
  tipo_apoyo       text[] not null default '{}',
  que_recibe       text,
  estado           text not null default 'necesita_apoyo'
                   check (estado in ('necesita_apoyo', 'cubierto')),
  contacto         text,
  link_inscripcion text,
  horario          text,
  notas            text,
  instagram        text,
  creado_en        timestamptz not null default now(),
  actualizado_en   timestamptz not null default now()
);

-- Índices
create index if not exists idx_puntos_ciudad   on public.puntos_ayuda (ciudad);
create index if not exists idx_puntos_estado   on public.puntos_ayuda (estado);
create index if not exists idx_puntos_lat_lng  on public.puntos_ayuda (lat, lng);
create index if not exists idx_puntos_creado   on public.puntos_ayuda (creado_en desc);

-- Trigger actualizado_en
create or replace function public.set_actualizado_en()
returns trigger language plpgsql as $$
begin new.actualizado_en = now(); return new; end;
$$;

drop trigger if exists trg_actualizado_en on public.puntos_ayuda;
create trigger trg_actualizado_en
  before update on public.puntos_ayuda
  for each row execute function public.set_actualizado_en();

-- ── RLS ──────────────────────────────────────────────────────
alter table public.puntos_ayuda enable row level security;

create policy "Lectura pública"
  on public.puntos_ayuda for select using (true);

create policy "Inserción pública"
  on public.puntos_ayuda for insert with check (true);

create policy "Actualización pública"
  on public.puntos_ayuda for update using (true) with check (true);

-- ── Realtime ─────────────────────────────────────────────────
-- Ejecutar en SQL Editor de Supabase:
alter publication supabase_realtime add table public.puntos_ayuda;
