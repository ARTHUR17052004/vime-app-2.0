# VIME APP 2.0
# Guia de Deploy

---

## Tecnologias

Backend

- Node.js
- Express
- Prisma
- PostgreSQL

Frontend

- Next.js
- React
- Tailwind CSS

---

## Variáveis de Ambiente

Criar arquivo:

.env

Exemplo:

DATABASE_URL=

JWT_SECRET=

PORT=3001

ASAAS_API_KEY=

ASAAS_API_URL=

ASAAS_MOCK=true

CLICKSIGN_API_KEY=

CLICKSIGN_API_URL=

CLICKSIGN_MOCK=true

WHATSAPP_TOKEN=

WHATSAPP_PHONE_ID=

---

## Instalação

Instalar dependências

```bash
npm install
```

Instalar Prisma

```bash
npx prisma generate
```

Executar migrations

```bash
npx prisma migrate deploy
```

Iniciar servidor

```bash
npm start
```

---

## Desenvolvimento

Executar servidor

```bash
npm run dev
```

Abrir Prisma Studio

```bash
npx prisma studio
```

---

## Scheduler

O Scheduler é iniciado automaticamente junto com o servidor.

Executa diariamente:

- Verificação de contratos
- Verificação de vencimentos
- Verificação de cobranças
- Verificação de notificações

---

## Integrações

Asaas

- Clientes
- Cobranças
- Webhooks

Clicksign

- Documentos
- Assinaturas
- Webhooks

WhatsApp

- Envio de mensagens
- Recebimento
- Webhook

---

## Segurança

- JWT
- Middleware de autenticação
- Middleware de autorização
- Logs do sistema
- Auditoria
- Validação de dados

---

## Estrutura do Projeto

src/

controllers/

middlewares/

routes/

services/

jobs/

config/

docs/

prisma/

---

## Banco de Dados

PostgreSQL

Prisma ORM

---

## Publicação

O backend pode ser publicado em:

- Render
- Railway
- VPS Linux
- Hostinger VPS

Após o deploy:

- Configurar as variáveis de ambiente.
- Executar as migrations.
- Validar as integrações.
- Testar os webhooks.
- Verificar os jobs do Scheduler.