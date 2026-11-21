-- Already applied to the dedicated rmpworks Supabase project mxgwdnnpkywzhldyyrue.
-- Run only on that project. Non-destructive / re-runnable.
alter table public.creator_accounts
  add column if not exists inspiration_channels text not null default ''
  check (char_length(inspiration_channels) <= 2000);
grant update(inspiration_channels) on public.creator_accounts to authenticated;
-- Existing ownership-based RLS policies remain in place.
