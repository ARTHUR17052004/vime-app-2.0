# FINANCEIRO V4 - VIME APP 2.0

## Status do módulo

### Concluído

* Cadastro de Receitas
* Cadastro de Despesas
* Visualização
* Edição
* Exclusão
* Marcar Receita como Paga
* Dashboard Financeiro
* Fluxo de Caixa
* Próximos Vencimentos
* Inadimplência
* Relatórios PDF (estrutura)
* Relatórios Excel (estrutura)
* Integração Asaas (placeholder)

---

# FRONTEND

## Receitas

Campos:

* unidade
* categoria
* descricao
* valor
* status
* dataVencimento
* dataPagamento
* observacoes

Operações:

* Criar
* Visualizar
* Editar
* Excluir
* Marcar Pago

---

## Despesas

Campos:

* categoria
* descricao
* valor
* status
* dataDespesa
* dataPagamento
* fornecedor
* observacoes

Operações:

* Criar
* Visualizar
* Editar
* Excluir

---

## Dashboard Financeiro

Indicadores:

* Receita Total
* Despesas Totais
* Lucro Líquido
* Receitas Pendentes

---

## Fluxo de Caixa

Receitas e despesas consolidadas.

---

## Próximos Vencimentos

Lista de cobranças pendentes.

---

## Inadimplência

* Total em aberto
* Pendentes
* Atrasados
* Lista de inadimplentes

---

## Relatórios

* PDF
* Excel

---

# BACKEND

## Model Receita

* id
* unidadeId
* categoria
* descricao
* valor
* status
* dataVencimento
* dataPagamento
* observacoes
* createdAt
* updatedAt

---

## Model Despesa

* id
* categoria
* descricao
* valor
* status
* dataDespesa
* dataPagamento
* fornecedor
* observacoes
* createdAt
* updatedAt

---

# ENDPOINTS

## Receitas

GET /receitas

GET /receitas/:id

POST /receitas

PUT /receitas/:id

DELETE /receitas/:id

PATCH /receitas/:id/pagar

---

## Despesas

GET /despesas

GET /despesas/:id

POST /despesas

PUT /despesas/:id

DELETE /despesas/:id

---

## Dashboard

GET /financeiro/dashboard

GET /financeiro/fluxo-caixa

GET /financeiro/proximos-vencimentos

GET /financeiro/inadimplencia

---

## Exportações

GET /financeiro/exportar/pdf

GET /financeiro/exportar/excel

---

# Integrações Futuras

## Asaas

* Gerar PIX
* Gerar boleto
* Criar cobrança
* Baixa automática

## Relatórios

* PDF real
* Excel real

---

# Módulo encerrado

Financeiro V4 concluído.
