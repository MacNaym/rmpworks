-- Migration already applied on dedicated Supabase rmpworks project (mxgwdnnpkywzhldyyrue).
-- DO NOT apply against other user databases.
create table if not exists public.creator_leads (
 id uuid primary key default gen_random_uuid(),
 creator_account_id uuid not null references public.creator_accounts(id) on delete cascade,
 email text not null check (char_length(email) between 3 and 254),
 full_name text not null default '' check (char_length(full_name)<=120),
 source text not null default 'preview_test' check(source in ('preview_test','public_lead_magnet','quiz')),
 status text not null default 'new' check(status in ('new','contacted','qualified','converted','archived')),
 consent_at timestamptz not null default now(),
 consent_text text not null check(char_length(consent_text) between 10 and 500),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint creator_leads_account_email_unique unique(creator_account_id,email)
);
create index if not exists creator_leads_account_created_idx on public.creator_leads(creator_account_id,created_at desc);
alter table public.creator_leads enable row level security;
revoke all on public.creator_leads from anon, authenticated;
grant select,insert on public.creator_leads to authenticated;
grant update(status,updated_at) on public.creator_leads to authenticated;
create policy "creator owner reads own leads" on public.creator_leads for select to authenticated
 using(exists(select 1 from public.creator_accounts a where a.id=creator_account_id and a.owner_user_id=(select auth.uid())));
create policy "creator owner adds preview leads" on public.creator_leads for insert to authenticated
 with check(source='preview_test' and status='new' and exists(select 1 from public.creator_accounts a where a.id=creator_account_id and a.owner_user_id=(select auth.uid())));
create policy "creator owner updates lead stages" on public.creator_leads for update to authenticated
 using(exists(select 1 from public.creator_accounts a where a.id=creator_account_id and a.owner_user_id=(select auth.uid())))
 with check(exists(select 1 from public.creator_accounts a where a.id=creator_account_id and a.owner_user_id=(select auth.uid())));
