# Batch 3 — Scheletro siti creator (non rilasciato)

## Separazione tecnica
- Pagine servite in futuro da Cloudflare Pages Function `/s/:slug`. Non è ancora collegato `nomecreator.rmpworks.com`.
- Non si usa `creator_accounts` (contiene dati privati). Creato modello pubblico separato `creator_site_snapshots` in Supabase, con soli campi strettamente pubblicabili.
- `anon` può leggere soltanto gli snapshot con `published=true` e `published_at` non nullo. `anon` e `authenticated` **non possono** creare, aggiornare o pubblicare gli snapshot.
- **Doppio blocco**: la route Cloudflare restituisce 404 salvo che la variabile server-side `RMP_CREATOR_PUBLIC_RELEASE` sia esattamente `explicit-creator-release-v1`; inoltre serve uno snapshot separato marcato published da una procedura autorizzata.
- Nessuna variabile di rilascio impostata e **nessun record creato** in `creator_site_snapshots`. Non intervenire su questi blocchi prima dell'autorizzazione esplicita del Capitano e del completamento del gate #28.
- Pagina renderizzata senza JS, form di iscrizione, checkout, email o dati personali sensibili; escaping dei contenuti e CSP stretta. Non indicizzata.
- Da completare: routing sottodomini (Cloudflare wildcard), procedura amministrativa di revisione/publishing e rollback, privacy e consent, lead magnet, delivery, acquisti, isolamenti multi-tenant.

## Migrazione già applicata su mxgwdnnpkywzhldyyrue
```sql
create table if not exists public.creator_site_snapshots (
 creator_account_id uuid primary key references public.creator_accounts(id) on delete cascade,
 slug text not null unique check(slug ~ '^[a-z0-9][a-z0-9-]{2,39}$'),
 display_name text not null check(char_length(display_name) between 2 and 100),
 topic text not null default '' check(char_length(topic)<=200),
 audience text not null default '' check(char_length(audience)<=500),
 channel_url text not null check(char_length(channel_url)<=500),
 freebie_title text not null default '' check(char_length(freebie_title)<=180),
 published boolean not null default false,
 published_at timestamptz,
 updated_at timestamptz not null default now(),
 constraint site_publish_consistency check(published=false or published_at is not null)
);
alter table public.creator_site_snapshots enable row level security;
revoke all on public.creator_site_snapshots from anon,authenticated;
grant select(creator_account_id,slug,display_name,topic,audience,channel_url,freebie_title,published,published_at) on public.creator_site_snapshots to anon;
create policy "public only sees explicitly published site snapshots" on public.creator_site_snapshots for select to anon using(published=true and published_at is not null);
```
