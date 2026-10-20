-- Run this once in Supabase Dashboard > SQL Editor.
-- It creates the catalog, private enquiry inbox, owner allowlist, and public image bucket.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_lavera_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_lavera_admin() from public;
grant execute on function public.is_lavera_admin() to anon, authenticated;

create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null check (category in ('Earrings', 'Necklaces', 'Rings', 'Bracelets')),
  price numeric(10,2) not null default 0 check (price >= 0),
  old_price numeric(10,2) check (old_price is null or old_price >= 0),
  short_description text not null default '',
  description text not null default '',
  material text not null default '',
  finish text not null default '',
  dimensions text not null default '',
  closure text not null default '',
  care text not null default '',
  images text[] not null default '{}',
  featured boolean not null default false,
  badge text,
  photo_credit text,
  photo_credit_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('Earrings', 'Necklaces', 'Rings', 'Bracelets')),
  product_reference text not null,
  email text not null,
  phone text not null,
  message text not null default '',
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.enquiries enable row level security;

drop policy if exists "Admins can read allowlist" on public.admin_users;
create policy "Admins can read allowlist" on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products" on public.products
  for select to anon, authenticated using (is_active or (select public.is_lavera_admin()));

drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products" on public.products
  for all to authenticated using ((select public.is_lavera_admin()))
  with check ((select public.is_lavera_admin()));

drop policy if exists "Visitors can submit enquiries" on public.enquiries;
create policy "Visitors can submit enquiries" on public.enquiries
  for insert to anon, authenticated with check (true);

drop policy if exists "Admins can read enquiries" on public.enquiries;
create policy "Admins can read enquiries" on public.enquiries
  for select to authenticated using ((select public.is_lavera_admin()));

drop policy if exists "Admins can update enquiries" on public.enquiries;
create policy "Admins can update enquiries" on public.enquiries
  for update to authenticated using ((select public.is_lavera_admin()))
  with check ((select public.is_lavera_admin()));

drop policy if exists "Admins can delete enquiries" on public.enquiries;
create policy "Admins can delete enquiries" on public.enquiries
  for delete to authenticated using ((select public.is_lavera_admin()));

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant insert on public.enquiries to anon, authenticated;
grant select, update, delete on public.enquiries to authenticated;
grant select on public.admin_users to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = true;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and (select public.is_lavera_admin()));

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and (select public.is_lavera_admin()))
  with check (bucket_id = 'product-images' and (select public.is_lavera_admin()));

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and (select public.is_lavera_admin()));

-- Optional demo catalog seed. The local demo images are hosted by the site in /public.
insert into public.products (id, name, category, price, old_price, short_description, description, material, finish, dimensions, closure, care, images, featured, badge)
values
  ('LV-NK-001','Emerald Glow Necklace Set','Necklaces',1500,null,'A statement necklace with matching earrings.','Demo listing for a necklace and matching earrings. Replace with verified Lavéra details.','Add actual material','Add actual finish','Add necklace length and set measurements','Add closure details','Add care instructions.',array['/images/products/necklace1.jpg','/images/products/Necklace2.jpg','/images/products/necklace1.jpg'],true,'Preview item'),
  ('LV-ER-002','Twist Light Hoops','Earrings',1199,1399,'A twisted-gold look for everyday styling.','Demo listing. Replace with verified Lavéra details.','Add actual material','Add actual finish','Add diameter or size','Add closure type','Add care instructions.',array['/images/products/demo-earrings.jpg'],true,'Preview item'),
  ('LV-RG-003','Golden Hour Band','Rings',699,899,'A clean, classic gold-tone band.','Demo listing. Replace with verified Lavéra details.','Add actual material','Add actual finish','Add available ring sizes','Add fit details','Add care instructions.',array['/images/products/demo-ring.jpg'],true,'Preview item'),
  ('LV-BR-004','Golden Link Bracelet','Bracelets',1199,1599,'A polished chain detail for your wrist.','Demo listing. Replace with verified Lavéra details.','Add actual material','Add actual finish','Add bracelet length','Add closure type','Add care instructions.',array['/images/products/demo-bracelet.jpg'],true,'Preview item')
on conflict (id) do nothing;
