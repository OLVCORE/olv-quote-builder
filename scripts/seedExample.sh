#!/usr/bin/env bash
# Insere duas cotações de exemplo na tabela quotes (Supabase).

set -euo pipefail

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE" ]; then
  echo "Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE antes de rodar."
  exit 1
fi

curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/quotes" \
  -H "apikey: $SUPABASE_SERVICE_ROLE" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE" \
  -H "Content-Type: application/json" \
  -d '[
    {"company":"Demo 1","retainer":7000,"variable_rate":1.0},
    {"company":"Demo 2","retainer":12000,"variable_rate":0.8}
  ]' 