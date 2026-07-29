Perfeito. Vamos fazer exatamente como fizemos com os services: **um arquivo por vez**.

### Arquivo 1 — `docs/API.md`

````md
# VIME APP 2.0
# Documentação da API

Base URL

http://localhost:3001

---

# Padrão de Resposta

Sucesso

```json
{
  "success": true,
  "data": {}
}
````

Erro

```json
{
  "success": false,
  "message": "Descrição do erro."
}
```

---

# Autenticação

Todas as rotas protegidas utilizam JWT.

Header:

Authorization: Bearer TOKEN

---

# Auth

POST /auth/login

Realiza login do usuário.

POST /auth/register

Cria um novo usuário.

GET /auth/me

Retorna usuário autenticado.

---

# Usuários

GET /usuarios

Lista usuários.

POST /usuarios

Cria usuário.

PUT /usuarios/:id

Atualiza usuário.

DELETE /usuarios/:id

Remove usuário.

---

# Locadores

GET /locadores

POST /locadores

PUT /locadores/:id

DELETE /locadores/:id

---

# Unidades

GET /unidades

POST /unidades

PUT /unidades/:id

DELETE /unidades/:id

---

# Kitnets

GET /kitnets

POST /kitnets

PUT /kitnets/:id

DELETE /kitnets/:id

---

# Inquilinos

GET /inquilinos

POST /inquilinos

PUT /inquilinos/:id

DELETE /inquilinos/:id

---

# Contratos

GET /contratos

POST /contratos

PUT /contratos/:id

DELETE /contratos/:id

PUT /contratos/:id/encerrar

PUT /contratos/:id/renovar

PUT /contratos/:id/inadimplente

---

# Receitas

GET /receitas

POST /receitas

PUT /receitas/:id

DELETE /receitas/:id

---

# Despesas

GET /despesas

POST /despesas

PUT /despesas/:id

DELETE /despesas/:id

---

# Financeiro

GET /financeiro

GET /financeiro/resumo

---

# Solicitações

GET /solicitacoes

POST /solicitacoes

PUT /solicitacoes/:id

DELETE /solicitacoes/:id

---

# Vistorias

GET /vistorias

POST /vistorias

PUT /vistorias/:id

DELETE /vistorias/:id

---

# Dashboard

GET /dashboard

---

# Logs

GET /logs

---

# Auditoria

GET /auditoria

---

# Asaas

GET /asaas/status

GET /asaas/config

POST /asaas/testar-conexao

POST /asaas/clientes

GET /asaas/clientes

GET /asaas/clientes/:id

PUT /asaas/clientes/:id

DELETE /asaas/clientes/:id

POST /asaas/cobrancas

GET /asaas/cobrancas

GET /asaas/cobrancas/:id

PUT /asaas/cobrancas/:id

DELETE /asaas/cobrancas/:id

POST /asaas/cobrancas/:id/receber

POST /asaas/cobrancas/:id/estornar

POST /asaas/cobrancas/:id/restaurar

POST /asaas/webhook

---

# Clicksign

GET /clicksign/status

GET /clicksign/config

GET /clicksign/documentos

POST /clicksign/documentos

GET /clicksign/documentos/:id

DELETE /clicksign/documentos/:id

POST /clicksign/documentos/:id/assinar

POST /clicksign/webhook

---

# WhatsApp

GET /whatsapp/status

POST /whatsapp/enviar

POST /whatsapp/receber

POST /whatsapp/webhook

```