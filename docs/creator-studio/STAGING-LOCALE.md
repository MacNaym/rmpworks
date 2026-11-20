# Staging locale e prova del tenant (non in produzione)

## Cosa è verificabile
- Node.js 22 locale (Node 24 eventualmente supportato da hosting).
- Build del sito statico Next.js 16 in `out/`.
- Router demo indipendente, con riconoscimento `{creator}.rmpworks.com` dal valore Host.
- Tenant di esempio: `vecchisalvataggi.rmpworks.com`, etichettato come creator, non come categoria.

## Comandi PowerShell (nella copia del repository)
```powershell
git fetch origin; git switch feature/creator-studio-b0-b1
powershell -ExecutionPolicy Bypass -File .\tools\staging\verify-local.ps1
npm run dev -- -p 3100
```
Preview marketing: http://127.0.0.1:3100/design-lab

## Demo host routing indipendente
Altro terminale:
```powershell
node .\tools\tenant-spike\server.mjs
curl.exe -H "Host: vecchisalvataggi.rmpworks.com" http://127.0.0.1:3101/
curl.exe -H "Host: admin.rmpworks.com" http://127.0.0.1:3101/
```
Il primo restituisce il creator demo e il secondo HTTP 404; test:
```powershell
node .\tools\tenant-spike\test.mjs
```

**Nota**: la demo è un server HTTP separato, usa una mappa hardcoded e NON implementa Next.js, autenticazione, isolamento dati, Supabase, TLS, DNS wildcard o deploy Hostinger. Dimostra unicamente la selezione del creator da hostname in locale. Non esporre il server demo in rete.

## Per Hostinger
Dal pannello il piano dichiara 3 GB RAM, 2 CPU, 200 GB, supporto Node 18–24 e Next.js. DNS Cloudflare (nameserver candy.ns.cloudflare.com e chance.ns.cloudflare.com): **non cambiarli**. Prima di pubblicare bisogna verificare il deployment corrente, l'effettiva gestione Node dell'hosting, la configurazione dei domini personalizzati, wildcard e TLS. Nessuna credenziale deve essere inviata tramite chat.

## Release gate
- Build, lint, scan e test locali verdi.
- Revisione della variante grafica Neo Brutalist A/B/C e responsive.
- Backup del sito pubblicato + procedura rollback.
- Connessione Hostinger verificata e dominio/sottodominio di staging isolato.
- Registrazione DNS solo dopo approvazione e verifica del target.
- Risoluzione multi-tenant production: RLS, database, auth, TLS e pagamenti da sviluppare in batch appositi.
