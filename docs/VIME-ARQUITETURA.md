# VIME 2.0

## Objetivo

Reconstruir completamente a VIME sem dependência da Base44.

A Base44 será utilizada apenas como referência visual e funcional.

Nenhum componente crítico poderá depender da Base44 para funcionamento.

---

## Tecnologias

### Frontend

* Next.js
* React
* Tailwind CSS

### Backend

* Node.js
* Express

### Banco de Dados

* PostgreSQL
* Prisma ORM

### Integrações

* WhatsApp Cloud API
* Asaas
* Clicksign

### Hospedagem

* VPS Linux

---

## Estrutura

frontend/
backend/
database/
docs/
referencia/

---

## Regra Principal

A Base44 é apenas referência.

Todo código, banco de dados, autenticação, permissões, APIs e integrações serão próprios da VIME 2.0.

---

# Módulos do Sistema

## Dashboard

Resumo geral do sistema.

Exibe indicadores, gráficos, mapas e atalhos para os módulos.

---

## Unidades

Cadastro de propriedades administradas.

Permite:

* Criar
* Editar
* Excluir
* Desativar

---

## Kitnets

Cadastro das unidades locáveis vinculadas às unidades.

Permite:

* Controle de ocupação
* Valor do aluguel
* Metragem
* Status
* Morador atual

---

## Inquilinos

Cadastro dos moradores.

Obrigatórios:

* Nome
* Email
* Telefone
* Kitnet
* Data de início

Ao cadastrar:

* Criar vínculo com kitnet
* Gerar contrato
* Enviar convite por email

---

## Locadores

Cadastro dos proprietários.

Inclui:

* Dados pessoais
* Endereço
* Dados bancários
* Taxas administrativas
* Juros
* Multas

---

## Solicitações

Chamados de manutenção.

Status:

* Aberta
* Em andamento
* Concluída

---

## Vistorias

Controle de inspeções das unidades.

---

## Contratos

Controle de contratos de locação.

Integração com Clicksign.

---

## Financeiro

* Receitas
* Despesas
* Fluxo de caixa
* DRE

---

## Relatórios

Motor único de relatórios com filtros e exportação.

---

## Avisos

Comunicados enviados aos inquilinos.

---

## Notificações

Histórico de e-mails e mensagens enviadas.

---

## Segurança e Auditoria

Controle de logs, acessos e incidentes.

---

## Automações

Gerenciamento de automações operacionais do sistema.

---

## Revisão do Sistema

Monitoramento da saúde geral da plataforma.

---

## Usuários

Controle de acesso e permissões.

Perfis:

* Administrador
* Administrativo
* Zelador

---

## Asaas

### Configuração

Conta principal da VIME.

### Transações

Cobranças e recebimentos.

### Repasses

Transferências para proprietários.

---

## Clicksign

Assinatura eletrônica de documentos.

---

## WhatsApp IA

Atendimento automatizado via WhatsApp.

Funções previstas:

* Segunda via de boleto
* Segunda via de contrato
* Solicitações
* Avisos
* Consultas
* Notificações

---

# Regras de Negócio

1. Uma Unidade pode possuir várias Kitnets.
2. Uma Kitnet pertence a apenas uma Unidade.
3. Um Inquilino ocupa apenas uma Kitnet ativa.
4. Um Contrato é gerado automaticamente após cadastro do Inquilino.
5. Contratos poderão ser enviados automaticamente ao Clicksign.
6. Cobranças poderão ser geradas automaticamente via Asaas.
7. O Dashboard apenas consome dados dos módulos.

---

# Roadmap de Desenvolvimento

## Fase 1 - Fundação

* Estrutura do projeto
* Frontend Next.js
* Backend Node.js
* PostgreSQL
* Prisma ORM
* Layout Base
* Sidebar
* Dashboard Inicial

## Fase 2 - Cadastros Principais

* Usuários
* Locadores
* Unidades
* Kitnets
* Inquilinos

## Fase 3 - Operação

* Contratos
* Distratos
* Solicitações
* Vistorias

## Fase 4 - Financeiro

* Receitas
* Despesas
* DRE
* Relatórios Financeiros

## Fase 5 - Integrações

* Asaas
* Clicksign
* WhatsApp

## Fase 6 - Inteligência

* Automações
* IA WhatsApp
* Auditoria
* Revisão do Sistema

## Fase 7 - Produção

* Testes
* Segurança
* Backup
* Deploy VPS
* Monitoramento

---

# Histórico de Desenvolvimento

## Dia 1

Concluído:

* Estrutura inicial criada
* Next.js instalado
* Tailwind configurado
* Projeto executando em localhost
* Arquitetura inicial definida
* Módulos mapeados

---

## Status

✅ Fim do Dia 1

🚧 Dia 2 - Layout Base da VIME
