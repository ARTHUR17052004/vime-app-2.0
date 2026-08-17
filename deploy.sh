#!/bin/bash
# Script de deploy do VIME 2.0 na VPS.
# Rodado manualmente ou automaticamente pelo GitHub Actions a cada push na main.
set -e

cd /var/www/vime-app-2.0

echo "==> Baixando código novo..."
git pull origin main

echo "==> Backend..."
cd backend
npm install

# Carrega o .env manualmente: sem isso, "npx prisma generate" roda sem
# DATABASE_URL disponível e gera um client quebrado (mesmo o app rodando
# via PM2 depois com o .env carregado certo pelo server.js).
set -a
source .env
set +a
npx prisma generate

pm2 restart vime-backend

echo "==> Frontend..."
cd ../frontend
npm install
npm run build
pm2 restart vime-frontend

echo "==> Deploy concluído."
