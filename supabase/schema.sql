create extension if not exists pgcrypto;

create type public.appointment_status as enum (
  'booked',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
);

create type public.staff_status as enum ('active', 'inactive');
create type public.payment_status as enum ('unpaid', 'partial', 'paid');
create type public.payment_method as enum ('cash', 'card', 'eft');

create table if not exists public.salons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  business_type text not null check (business_type in ('salon', 'barbershop', 'hybrid')),
  city text not null,
  province text not null default 'Gauteng',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  salon_id uuid not null references public.salons(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('owner', 'manager', 'receptionist', 'stylist', 'barber')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.salon_settings (
  salon_id uuid primary key references public.salons(id) on delete cascade,
  owner_name text not null,
  phone_number text not null,
  opening_hours jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  full_name text not null,
  phone_number text not null,
  email text not null default '',
  notes text not null default '',
  loyalty_points integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.staff_members (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  full_name text not null,
  role_title text not null,
  mobile text not null,
  email text not null default '',
  commission_rate numeric(5,2) not null default 0,
  status public.staff_status not null default 'active',
  speciality text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  name text not null,
  category text not null,
  duration_minutes integer not null,
  price_zar numeric(12,2) not null,
  is_active boolean not null default true,
  description text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  staff_member_id uuid not null references public.staff_members(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'booked',
  total_amount numeric(12,2) not null default 0,
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.appointment_services (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete restrict,
  staff_member_id uuid not null references public.staff_members(id) on delete restrict,
  sale_date timestamptz not null default timezone('utc', now()),
  subtotal_zar numeric(12,2) not null default 0,
  discount_zar numeric(12,2) not null default 0,
  total_zar numeric(12,2) not null default 0,
  amount_paid_zar numeric(12,2) not null default 0,
  payment_status public.payment_status not null default 'unpaid',
  payment_method public.payment_method not null default 'cash',
  commission_rate_snapshot numeric(5,2) not null default 0,
  commission_amount numeric(12,2) not null default 0,
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sale_services (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict
);

create index if not exists idx_profiles_salon_id on public.profiles(salon_id);
create index if not exists idx_customers_salon_id on public.customers(salon_id);
create index if not exists idx_staff_members_salon_id on public.staff_members(salon_id);
create index if not exists idx_services_salon_id on public.services(salon_id);
create index if not exists idx_appointments_salon_id on public.appointments(salon_id);
create index if not exists idx_appointments_starts_at on public.appointments(starts_at);
create index if not exists idx_sales_salon_id on public.sales(salon_id);
create index if not exists idx_sales_sale_date on public.sales(sale_date);

create or replace function public.current_user_salon_id()
returns uuid
language sql
stable
as $$
  select salon_id from public.profiles where id = auth.uid()
$$;

alter table public.salons enable row level security;
alter table public.profiles enable row level security;
alter table public.salon_settings enable row level security;
alter table public.customers enable row level security;
alter table public.staff_members enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_services enable row level security;
alter table public.sales enable row level security;
alter table public.sale_services enable row level security;

create policy "salon members view salon"
on public.salons
for select
using (id = public.current_user_salon_id());

create policy "users manage own profile"
on public.profiles
for all
using (id = auth.uid())
with check (id = auth.uid());

create policy "salon members manage settings"
on public.salon_settings
for all
using (salon_id = public.current_user_salon_id())
with check (salon_id = public.current_user_salon_id());

create policy "salon members manage customers"
on public.customers
for all
using (salon_id = public.current_user_salon_id())
with check (salon_id = public.current_user_salon_id());

create policy "salon members manage staff"
on public.staff_members
for all
using (salon_id = public.current_user_salon_id())
with check (salon_id = public.current_user_salon_id());

create policy "salon members manage services"
on public.services
for all
using (salon_id = public.current_user_salon_id())
with check (salon_id = public.current_user_salon_id());

create policy "salon members manage appointments"
on public.appointments
for all
using (salon_id = public.current_user_salon_id())
with check (salon_id = public.current_user_salon_id());

create policy "salon members manage appointment services"
on public.appointment_services
for all
using (
  exists (
    select 1
    from public.appointments
    where appointments.id = appointment_services.appointment_id
      and appointments.salon_id = public.current_user_salon_id()
  )
)
with check (
  exists (
    select 1
    from public.appointments
    where appointments.id = appointment_services.appointment_id
      and appointments.salon_id = public.current_user_salon_id()
  )
);

create policy "salon members manage sales"
on public.sales
for all
using (salon_id = public.current_user_salon_id())
with check (salon_id = public.current_user_salon_id());

create policy "salon members manage sale services"
on public.sale_services
for all
using (
  exists (
    select 1
    from public.sales
    where sales.id = sale_services.sale_id
      and sales.salon_id = public.current_user_salon_id()
  )
)
with check (
  exists (
    select 1
    from public.sales
    where sales.id = sale_services.sale_id
      and sales.salon_id = public.current_user_salon_id()
  )
);
