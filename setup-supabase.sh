#!/bin/bash

# Script de configuration Supabase pour ReviewLottery V3
# Exécuter après avoir créé un nouveau projet Supabase

echo "🚀 Configuration Supabase pour ReviewLottery V3"
echo ""

# Vérifier que les variables sont passées
if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ] || [ -z "$4" ]; then
    echo "❌ Usage: ./setup-supabase.sh PROJECT_REF DB_PASSWORD ANON_KEY SERVICE_ROLE_KEY"
    echo ""
    echo "📝 Où trouver ces informations dans Supabase :"
    echo "   1. PROJECT_REF        : Settings > General > Reference ID"
    echo "   2. DB_PASSWORD        : Settings > Database > Connection string (password)"
    echo "   3. ANON_KEY           : Settings > API > anon public"
    echo "   4. SERVICE_ROLE_KEY   : Settings > API > service_role"
    echo ""
    exit 1
fi

PROJECT_REF=$1
DB_PASSWORD=$2
ANON_KEY=$3
SERVICE_ROLE_KEY=$4

echo "📋 Configuration :"
echo "   Project Reference : $PROJECT_REF"
echo "   Database Password : ${DB_PASSWORD:0:4}****"
echo ""

# Créer le fichier .env.local
cat > .env.local << EOF
# 🔐 SUPABASE CONFIGURATION
# Project: reviewlottery-v3
# Generated: $(date)

# Database Connection (pour Prisma)
DATABASE_URL="postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Prisma Direct Connection (pour migrations)
DIRECT_URL="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"

# Supabase API (pour Auth & Storage)
NEXT_PUBLIC_SUPABASE_URL="https://${PROJECT_REF}.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${ANON_KEY}"
SUPABASE_SERVICE_ROLE_KEY="${SERVICE_ROLE_KEY}"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
EOF

echo "✅ Fichier .env.local créé avec succès"
echo ""

# Tester la connexion
echo "🔍 Test de connexion à la base de données..."
if npx prisma db execute --stdin <<< "SELECT 1;" 2>/dev/null; then
    echo "✅ Connexion réussie !"
else
    echo "⚠️  Connexion échouée - vérifiez vos credentials"
    exit 1
fi

echo ""
echo "🗄️  Application des migrations Prisma..."
npx prisma migrate deploy

echo ""
echo "✅ Configuration terminée !"
echo ""
echo "📌 Prochaines étapes :"
echo "   1. Redémarrer le serveur : npm run dev"
echo "   2. Créer votre premier utilisateur via l'interface"
echo ""
