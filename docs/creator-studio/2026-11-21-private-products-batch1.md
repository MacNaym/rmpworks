# Batch 1 — Catalogo privato dei microprodotti
Creato nel progetto Supabase dedicato `rmpworks`, riferimento `mxgwdnnpkywzhldyyrue`.

## Scopo
- Un creator autenticato, con ordine sandbox verificato e brief esistente, può definire titolo, descrizione, prezzo ipotizzato (3–99 EUR) e modalità di consegna.
- Stato `draft` o `ready_for_review`, senza attivazione commerciale. Nessun prodotto pubblico e nessun collegamento Stripe Live.
- Protezione doppia: controllo ownership nell'API Cloudflare e RLS Supabase. `anon` senza grants. Impossibile modificare `creator_account_id` via ruolo authenticated.
- Nessun file viene caricato e nessun acquisto è possibile. Prezzo ipotizzato, non ancora fiscalmente configurato.
- Non è un pannello staff: `ready_for_review` significa solo richiesta creator registrata, non notifica inviata.
- Prima di live: catalogo con delivery/asset protetto, regole fiscali e commissioni, Stripe per creator, webhook idempotente e ordini, rimborsi, verifica su due utenti indipendenti.

## Migrazione già applicata
```sql
create table if not exists public.creator_products (
 id uuid primary key default gen_random_uuid(),
 creator_account_id uuid not null references public.creator_accounts(id) on delete cascade,
 title text not null check (char_length(title) between 3 and 180),
 description text not null default '' check (char_length(description)<=3000),
 price_cents integer not null check (price_cents between 300 and 9900),
 currency text not null default 'eur' check (currency='eur'),
 fulfillment_notes text not null default '' check(char_length(fulfillment_notes)<=3000),
 status text not null default 'draft' check(status in ('draft','ready_for_review')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists creator_products_owner_idx on public.creator_products(creator_account_id,created_at desc);
alter table public.creator_products enable row level security;
revoke all on public.creator_products from anon,authenticated;
grant select,insert on public.creator_products to authenticated;
grant update(title,description,price_cents,fulfillment_notes,status,updated_at) on public.creator_products to authenticated;
create policy "creator owner reads own products" on public.creator_products for select to authenticated using(exists(select 1 from public.creator_accounts a where a.id=creator_account_id and a.owner_user_id=(select auth.uid())));
create policy "creator owner creates product drafts" on public.creator_products for insert to authenticated with check(status='draft' and exists(select 1 from public.creator_accounts a where a.id=creator_account_id and a.owner_user_id=(select auth.uid())));
create policy "creator owner edits own product drafts" on public.creator_products for update to authenticated using(exists(select 1 from public.creator_accounts a where a.id=creator_account_id and a.owner_user_id=(select auth.uid()))) with check(status in('draft','ready_for_review') and exists(select 1 from public.creator_accounts a where a.id=creator_account_id and a.owner_user_id=(select auth.uid())));
```
