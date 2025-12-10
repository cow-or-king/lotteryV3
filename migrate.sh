#!/bin/bash
# Script pour forcer les migrations avec les bonnes variables d'environnement

# Force les nouvelles valeurs
export DATABASE_URL="postgresql://postgres.dhedkewujbazelsdihtr:aAgmZkI8KuQiYipW@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
export DIRECT_URL="postgresql://postgres:aAgmZkI8KuQiYipW@db.dhedkewujbazelsdihtr.supabase.co:5432/postgres"

echo "🔄 Application des migrations Prisma..."
npx prisma db push --skip-generate

echo "✅ Terminé !"
