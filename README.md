# OLV Quote Builder

Internal tool to generate price quotes and PDF proposals for OLV Consultoria's COMEX In-Company services.

## Tech stack

- Next.js 13 (App Router)
- TypeScript 5
- Tailwind CSS
- Supabase (Auth & Postgres)
- @react-pdf/renderer for server-side PDF

## Getting started

```
# na raiz do projeto
npm install               # ou pnpm install

# crie o arquivo de variáveis (não versionado)
notepad .env.local        # cole as chaves abaixo

npm run dev
```

.env.local (exemplo)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUxxxxIsInR5cCI6IkpXVCJ9.ey
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzIcxxxxxVCJ9.eyJpc3MiOi  # opcional
```

Depois abra http://localhost:3000 no navegador → login por magic-link Supabase → /admin/quote-incompany.

## Pastas principais

- `src/app` → rotas Next.js (App Router)
- `src/components` → componentes React
- `src/lib` → helpers (Supabase, pricing, PDF)
- `src/api/quote` → APIs de cálculo e PDF
- `faq/` → fichas de serviço internas

## Licença interna

Este software é confidencial e restrito à equipe da OLV Consultoria. 