# VIME APP 2.0
# Organização das Rotas

---

# Autenticação

Base:

/auth

Rotas:

POST /login

POST /register

GET /me

---

# Usuários

Base:

/usuarios

Rotas:

GET /

POST /

PUT /:id

DELETE /:id

---

# Locadores

Base:

/locadores

Rotas:

GET /

POST /

PUT /:id

DELETE /:id

---

# Unidades

Base:

/unidades

Rotas:

GET /

POST /

PUT /:id

DELETE /:id

---

# Kitnets

Base:

/kitnets

Rotas:

GET /

POST /

PUT /:id

DELETE /:id

---

# Inquilinos

Base:

/inquilinos

Rotas:

GET /

POST /

PUT /:id

DELETE /:id

---

# Contratos

Base:

/contratos

Rotas:

GET /

POST /

PUT /:id

DELETE /:id

PUT /:id/encerrar

PUT /:id/renovar

PUT /:id/inadimplente

---

# Receitas

Base:

/receitas

Rotas:

GET /

POST /

PUT /:id

DELETE /:id

---

# Despesas

Base:

/despesas

Rotas:

GET /

POST /

PUT /:id

DELETE /:id

---

# Financeiro

Base:

/financeiro

Rotas:

GET /

GET /resumo

---

# Solicitações

Base:

/solicitacoes

Rotas:

GET /

POST /

PUT /:id

DELETE /:id

---

# Vistorias

Base:

/vistorias

Rotas:

GET /

POST /

PUT /:id

DELETE /:id

---

# Dashboard

Base:

/dashboard

Rotas:

GET /

---

# Logs

Base:

/logs

Rotas:

GET /

---

# Auditoria

Base:

/auditoria

Rotas:

GET /

---

# Asaas

Base:

/asaas

Rotas:

GET /config

GET /status

POST /testar-conexao

POST /clientes

GET /clientes

GET /clientes/:id

PUT /clientes/:id

DELETE /clientes/:id

POST /cobrancas

GET /cobrancas

GET /cobrancas/:id

PUT /cobrancas/:id

DELETE /cobrancas/:id

POST /cobrancas/:id/receber

POST /cobrancas/:id/estornar

POST /cobrancas/:id/restaurar

POST /webhook

---

# Clicksign

Base:

/clicksign

Rotas:

GET /config

GET /status

GET /documentos

POST /documentos

GET /documentos/:id

DELETE /documentos/:id

POST /documentos/:id/assinar

POST /webhook

---

# WhatsApp

Base:

/whatsapp

Rotas:

GET /status

POST /enviar

POST /receber

POST /webhook