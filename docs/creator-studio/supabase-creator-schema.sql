-- RMP Creator Studio: apply to a NEW dedicated Supabase project only.
-- Never execute this against Regolario, ShopShield, Mneme or other existing databases.
create extension if not exists pgcrypto;
create table if not exists public.creator_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 100),
  channel_url text not null check (char_length(channel_url) <= 500),
  slug text unique check (slug ~ '^[a-z0-9][a-z0-9-]{2,39}$'),
  status text not null default 'onboarding' check(status in ('onboarding','review','active','paused')),
  onboarding_step int not null default 1 check(onboarding_step between 1 and 5),
  audience text,
  topic text,
  lead_magnet_idea text,
  micro_product_idea text,
  premium_product_idea text,
  style_notes text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint creator_accounts_one_owner unique(owner_user_id)
);
alter table public.creator_accounts enable row level security;
revoke all on public.creator_accounts from anon;
grant select,insert on public.creator_accounts to authenticated;
grant update(display_name,channel_url,slug,onboarding_step,audience,topic,lead_magnet_idea,micro_product_idea,premium_product_idea,style_notes,updated_at) on public.creator_accounts to authenticated;
create policy "creator owner reads own account" on public.creator_accounts for select to authenticated
  using ((select auth.uid()) = owner_user_id and (select auth.uid()) is not null);
create policy "creator owner creates own account" on public.creator_accounts for insert to authenticated
  with check ((select auth.uid()) = owner_user_id and (select auth.uid()) is not null and status='onboarding');
create policy "creator owner updates own account" on public.creator_accounts for update to authenticated
  using ((select auth.uid()) = owner_user_id and (select auth.uid()) is not null)
  with check ((select auth.uid()) = owner_user_id and (select auth.uid()) is not null);
-- status and owner_user_id are not updatable by the browser role.
-- Provisioning must additionally require a signed Stripe confirmation and trusted server action.
create table if not exists public.creator_orders (
 id uuid primary key default gen_random_uuid(),
 creator_account_id uuid not null references public.creator_accounts(id) on delete restrict,
 stripe_checkout_session_id text unique not null,
 stripe_livemode boolean not null default false,
 payment_status text not null check(payment_status in ('pending','paid','refunded','failed')),
 created_at timestamptz not null default now()
);
alter table public.creator_orders enable row level security;
revoke all on public.creator_orders from anon, authenticated;
create policy "owner may view linked orders" on public.creator_orders for select to authenticated
  using(exists(select 1 from public.creator_accounts c where c.id=creator_account_id and c.owner_user_id=(select auth.uid())));
grant select on public.creator_orders to authenticated;
-- creator_orders may be inserted or updated ONLY via trusted backend with service permissions,
-- never by browser/JWT clients.
