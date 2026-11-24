-- B11 isolated disposable PostgreSQL fixture. NEVER RUN ON PRODUCTION.
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE TABLE public.creator_accounts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 status text NOT NULL
);
CREATE TABLE public.creator_site_snapshots (
 creator_account_id uuid PRIMARY KEY REFERENCES public.creator_accounts(id),
 published boolean NOT NULL DEFAULT false,
 published_at timestamptz
);
CREATE TABLE public.creator_lead_magnets (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 creator_account_id uuid NOT NULL REFERENCES public.creator_accounts(id),
 status text NOT NULL
);
INSERT INTO public.creator_accounts(id,status)
VALUES ('11111111-1111-4111-8111-111111111111','active');
INSERT INTO public.creator_site_snapshots(creator_account_id,published,published_at)
VALUES ('11111111-1111-4111-8111-111111111111',true,now());
INSERT INTO public.creator_lead_magnets(id,creator_account_id,status)
VALUES ('22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111','approved');
