-- Vitalia Beauty Experience — esquema inicial para Supabase
-- Ejecutar en Supabase SQL Editor con un proyecto nuevo.
create extension if not exists pgcrypto;

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text not null default '',
  duration_minutes integer not null check (duration_minutes > 0),
  price_cop integer not null check (price_cop >= 0),
  active boolean not null default true,
  image_url text not null default '',
  moods text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  email text not null,
  phone text not null,
  service_id uuid references public.services(id) on delete set null,
  service_name text not null,
  booking_date date not null,
  booking_time text not null,
  notes text not null default '',
  status text not null default 'Pendiente' check (status in ('Pendiente','Confirmada','Cancelada')),
  created_at timestamptz not null default now(),
  constraint bookings_unique_slot unique (booking_date, booking_time)
);

alter table public.services enable row level security;
alter table public.bookings enable row level security;

-- El catálogo activo es público; solo administradores autenticados lo modifican.
drop policy if exists "Public can read active services" on public.services;
create policy "Public can read active services" on public.services
  for select using (active = true or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "Admins manage services" on public.services;
create policy "Admins manage services" on public.services
  for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Clientes pueden crear reservas. Solo administradores pueden consultar o modificarlas.
drop policy if exists "Public can create bookings" on public.bookings;
create policy "Public can create bookings" on public.bookings
  for insert with check (
    length(trim(client_name)) between 2 and 120 and
    length(trim(email)) between 5 and 254 and
    length(trim(phone)) between 7 and 30 and
    booking_date >= current_date
  );
drop policy if exists "Admins read bookings" on public.bookings;
create policy "Admins read bookings" on public.bookings
  for select using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "Admins update bookings" on public.bookings;
create policy "Admins update bookings" on public.bookings
  for update using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "Admins delete bookings" on public.bookings;
create policy "Admins delete bookings" on public.bookings
  for delete using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create index if not exists bookings_date_idx on public.bookings (booking_date);
create index if not exists services_active_idx on public.services (active);

-- Devuelve únicamente los horarios ocupados de una fecha (sin exponer datos personales).
create or replace function public.get_booked_slots(requested_date date)
returns table (booking_time text)
language sql
stable
security definer
set search_path = public
as $$
  select b.booking_time
  from public.bookings b
  where b.booking_date = requested_date and b.status <> 'Cancelada';
$$;
grant execute on function public.get_booked_slots(date) to anon, authenticated;

-- Evita que una reserva pública solicite un servicio inexistente o inactivo.
create or replace function public.validate_booking_service()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  active_service_name text;
begin
  select s.name into active_service_name
  from public.services s
  where s.id = new.service_id and s.active = true;
  if active_service_name is null then
    raise exception 'El servicio seleccionado no está disponible.' using errcode = '23514';
  end if;
  new.service_name := active_service_name;
  return new;
end;
$$;
drop trigger if exists bookings_validate_service on public.bookings;
create trigger bookings_validate_service
before insert on public.bookings
for each row execute function public.validate_booking_service();
