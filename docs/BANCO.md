# VIME APP 2.0
# Estrutura do Banco de Dados

---

## Banco

PostgreSQL

ORM:

Prisma ORM

---

## Principais Entidades

- Usuario
- Locador
- Unidade
- Kitnet
- Inquilino
- Contrato
- Receita
- Despesa
- Solicitacao
- Vistoria
- Ocorrencia
- LogSistema
- Auditoria

---

## Relacionamentos

Locador

↓

Unidade

↓

Kitnet

↓

Inquilino

↓

Contrato

↓

Receita

---

## Usuario

Responsável pelo acesso ao sistema.

---

## Locador

Proprietário de uma ou mais unidades.

Relacionamentos

1:N Unidade

1:N Contrato

---

## Unidade

Representa um imóvel.

Relacionamentos

N:1 Locador

1:N Kitnet

---

## Kitnet

Unidade locável.

Relacionamentos

N:1 Unidade

1:1 Inquilino

1:N Contrato

---

## Inquilino

Pessoa responsável pela locação.

Relacionamentos

1:1 Kitnet

1:N Contrato

---

## Contrato

Controla a locação.

Relacionamentos

N:1 Locador

N:1 Unidade

N:1 Kitnet

N:1 Inquilino

1:N Receita

---

## Receita

Receitas provenientes dos contratos.

Relacionamentos

N:1 Contrato

---

## Despesa

Controle financeiro de gastos.

---

## Solicitação

Chamados internos do sistema.

---

## Vistoria

Controle de inspeções.

Relacionamentos

1:N Ocorrencia

---

## Ocorrencia

Itens encontrados durante uma vistoria.

Relacionamento

N:1 Vistoria

---

## LogSistema

Registro de eventos importantes.

Campos principais

- usuário
- módulo
- ação
- descrição
- IP
- data

---

## Auditoria

Registro completo das alterações.

Campos principais

- usuário
- módulo
- ação
- registro
- valorAnterior
- valorNovo
- IP
- data

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

- Envio
- Recebimento
- Webhook

---

## Scheduler

Execução automática diária para:

- Encerrar contratos vencidos
- Atualizar receitas vencidas
- Verificar notificações
- Verificar cobranças
- Registrar logs automáticos

---

## Segurança

- JWT
- Middleware de autenticação
- Middleware de autorização
- Auditoria
- Logs
- Validação de relacionamentos