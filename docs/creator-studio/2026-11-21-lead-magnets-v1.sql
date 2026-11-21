-- Applied only to the dedicated rmpworks Supabase project mxgwdnnpkywzhldyyrue.
create table if not exists public.creator_lead_magnets (
 id uuid primary key default gen_random_uuid(),
 creator_account_id uuid not null references public.creator_accounts(id) on delete cascade,
 format text not null check(format in ('checklist','mini_guide')),
 title text not null check(char_length(title) between 3 and 180),
 subtitle text not null default '' check(char_length(subtitle)<=300),
 content text not null default '' check(char_length(content)<=20000),
 status text not null default 'draft' check(status in ('draft','approved')),
 version integer not null default 1 check(version>=1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists creator_magnets_owner_idx on public.creator_lead_magnets(creator_account_id,updated_at desc);
alter table public.creator_lead_magnets enable row level security;
revoke all on public.creator_lead_magnets from anon,authenticated;
grant select,insert on public.creator_lead_magnets to authenticated;
grant update(title,subtitle,content,status,version,updated_at) on public.creator_lead_magnets to authenticated;
create policy "creator owner read own magnets" on public.creator_lead_magnets for select to authenticated using (exists(select 1 from public.creator_accounts a where a.id=creator_account_id and a.owner_user_id=(select auth.uid())));
create policy "creator owner create private draft" on public.creator_lead_magnets for insert to authenticated with check(status='draft' and version=1 and exists(select 1 from public.creator_accounts a where a.id=creator_account_id and a.owner_user_id=(select auth.uid())));
create policy "creator owner edit own magnets" on public.creator_lead_magnets for update to authenticated using (exists(select 1 from public.creator_accounts a where a.id=creator_account_id and a.owner_user_id=(select auth.uid()))) with check (exists(select 1 from public.creator_accounts a where a.id=creator_account_id and a.owner_user_id=(select auth.uid())));
