#!/bin/bash
# Script de deploy do VIME 2.0 na VPS.
# Rodado manualmente ou automaticamente pelo GitHub Actions a cada push na main.
set -e

cd /var/www/vime-app-2.0

echo "==> Baixando código novo..."
# package-lock.json muda sozinho toda vez que "npm install" roda na VPS
# (plataforma diferente de onde foi gerado) e isso trava o pull em
# silêncio. Descarta essa modificação local antes de puxar, sempre.
git checkout -- backend/package-lock.json frontend/package-lock.json 2>/dev/null || true
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

# Até 18/11/2026 esse deploy nunca aplicava migration nenhuma no banco
# (só gerava o client) -- toda migration nova (índices inclusive) ficava
# parada no repositório até alguém rodar isso manualmente na mão.
# "migrate deploy" só aplica o que falta, na ordem, sem resetar nada --
# seguro de rodar toda vez, mesmo sem migration pendente.
npx prisma migrate deploy

pm2 restart vime-backend

echo "==> Frontend..."
cd ../frontend
npm install

# "set -e" sozinho não pega tudo -- em 17/11/2026 o "next build" parou
# no meio (aviso novo de upgrade de segurança do Next.js 16.4, que
# trava o build inteiro fora de um terminal interativo de verdade) e
# ainda assim voltou com exit code 0. O deploy seguiu reto, reiniciou
# o PM2 com o build velho/incompleto, e o site inteiro caiu com 502.
# Confere aqui se o build REALMENTE terminou (procura a confirmação
# que só aparece depois da compilação de verdade) antes de reiniciar
# qualquer coisa -- sem isso, mantém a versão anterior no ar.
npm run build 2>&1 | tee /tmp/vime-frontend-build.log

if ! grep -qE "Compiled successfully|Finished writing to disk|Route \(app\)" /tmp/vime-frontend-build.log; then
  echo "ERRO: build do frontend não terminou direito -- NÃO reiniciando o PM2 (mantendo a versão anterior no ar). Veja /tmp/vime-frontend-build.log"
  exit 1
fi

pm2 restart vime-frontend

echo "==> Deploy concluído."
