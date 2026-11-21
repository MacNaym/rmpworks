-- Applied to dedicated Supabase project mxgwdnnpkywzhldyyrue (rmpworks only).
-- Keep owner-scoped RLS and allow erasure only for private pilot test leads.
grant delete on public.creator_leads to authenticated;
create policy "creator owner removes own preview test leads"
 on public.creator_leads for delete to authenticated
 using (
   source='preview_test'
   and exists (
     select 1 from public.creator_accounts a
     where a.id=creator_account_id
       and a.owner_user_id=(select auth.uid())
   )
 );
