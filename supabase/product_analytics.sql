-- Run this once in Supabase SQL Editor after setup.sql.
-- Stores aggregate product-detail opens; it does not store visitor identities or IP addresses.

create table if not exists public.product_view_counts (
  product_id text primary key references public.products(id) on delete cascade,
  view_count bigint not null default 0 check (view_count >= 0),
  last_viewed_at timestamptz not null default now()
);

alter table public.product_view_counts enable row level security;

drop policy if exists "Admins can read product view counts" on public.product_view_counts;
create policy "Admins can read product view counts" on public.product_view_counts
  for select to authenticated using ((select public.is_lavera_admin()));

grant select on public.product_view_counts to authenticated;

create or replace function public.record_product_view(p_product_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_product_id is null or char_length(p_product_id) > 100 then
    return;
  end if;

  insert into public.product_view_counts as existing (product_id, view_count, last_viewed_at)
  select p.id, 1, now()
  from public.products p
  where p.id = p_product_id and p.is_active
  on conflict (product_id) do update
  set view_count = existing.view_count + 1,
      last_viewed_at = now();
end;
$$;

revoke all on function public.record_product_view(text) from public;
grant execute on function public.record_product_view(text) to anon, authenticated;
