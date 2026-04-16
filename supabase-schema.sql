create extension if not exists pgcrypto;

create table if not exists public.credit_applications (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name varchar(20) not null,
  course text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_feedback text not null default '申请单已创建，等待管理员完成充值。',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.credit_applications enable row level security;

create or replace function public.set_credit_application_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_credit_application_updated_at on public.credit_applications;
create trigger set_credit_application_updated_at
before update on public.credit_applications
for each row
execute function public.set_credit_application_updated_at();

drop policy if exists "anon can insert credit applications" on public.credit_applications;
create policy "anon can insert credit applications"
on public.credit_applications
for insert
to anon, authenticated
with check (true);

drop policy if exists "anon can read credit applications by email" on public.credit_applications;
create policy "anon can read credit applications by email"
on public.credit_applications
for select
to anon, authenticated
using (true);

drop policy if exists "authenticated admins can update credit applications" on public.credit_applications;
create policy "authenticated admins can update credit applications"
on public.credit_applications
for update
to authenticated
using (true)
with check (true);
