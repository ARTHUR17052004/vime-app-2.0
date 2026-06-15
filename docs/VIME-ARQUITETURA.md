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

## Dia 2

Concluído:

* CRUD completo de Unidades
* Cadastro de Unidades
* Edição de Unidades
* Exclusão de Unidades
* Busca de Unidades
* Persistência LocalStorage
* Status Ativa/Inativa/Manutenção
* Estrutura preparada para integração com Backend

Próximo passo:

* Expandir cadastro de Unidades
  * CEP
  * Endereço
  * Número
  * Bairro
  * Locador
  * Observações

* Preparar integração com API

Status:

🚧 Dia 2 - Em andamento
### Status Atual do Módulo Unidades

Implementado no Frontend:

* Cadastro de Unidade
* Edição de Unidade
* Exclusão de Unidade
* Busca por nome, cidade e endereço
* Persistência local utilizando LocalStorage
* Modal de cadastro/edição
* Controle de status:

  * Ativa
  * Inativa
  * Manutenção

### Estrutura Atual da Unidade

Campos disponíveis:

* nome
* cep
* endereco
* numero
* bairro
* cidade
* uf
* locador
* kitnets
* status
* observacoes
* aluguel
* vencimento

### Layout Atual

A listagem de unidades utiliza Cards.

Cada card apresenta:

* Nome da unidade
* Status
* Endereço
* Cidade/UF
* Valor de aluguel
* Quantidade de kitnets
* Dia de vencimento
* Locador

### Menu de Ações

Cada card possui menu contextual (⋮) com:

* Visualizar
* Editar
* Excluir

### Próxima Evolução

Criar tela individual da unidade:

/unidades/[id]

Objetivo:

Centralizar todas as informações relacionadas à unidade:

* Dados da unidade
* Kitnets
* Inquilinos
* Contratos
* Solicitações
* Vistorias
* Financeiro

Essa tela será o núcleo operacional da VIME.
### Rota Dinâmica de Unidade

Implementada rota:

/unidades/[id]

Objetivo:

Centralizar todas as informações relacionadas à unidade.

A página será utilizada como núcleo dos módulos:

* Kitnets
* Inquilinos
* Contratos
* Financeiro
* Solicitações
* Vistorias

Estado atual:

* Navegação funcional a partir dos cards
* Recebimento do ID da unidade
* Estrutura inicial da tela criada

Próxima evolução:

* Carregar dados reais da unidade
* Exibir resumo operacional
* Exibir kitnets vinculadas
* Criar ações rápidas da unidade
### Evolução da Tela de Unidade

A rota dinâmica `/unidades/[id]` agora realiza:

* Leitura do ID da URL
* Busca da unidade no LocalStorage
* Exibição dos dados reais da unidade

Informações exibidas:

* Nome
* Status
* Locador
* Quantidade de kitnets
* Vencimento
* Endereço completo
* CEP
* Observações

Próxima evolução planejada:

* Vinculação de Kitnets
* Vinculação de Inquilinos
* Resumo Financeiro da Unidade
* Histórico de Solicitações
* Histórico de Vistorias
## Módulo Unidades

### Funcionalidades concluídas

- Cadastro de unidade
- Edição de unidade
- Exclusão de unidade
- Busca por nome/endereço/cidade
- Cards de unidade
- Menu de ações (3 pontos)
- Visualização detalhada
- Persistência LocalStorage

### Rota

/unidades
/unidades/[id]

### Campos atualmente suportados

- Nome
- CEP
- Endereço
- Número
- Bairro
- Cidade
- UF
- Locador
- Quantidade de Kitnets
- Status
- Dia de vencimento
- Observações
## Módulo Unidades

Status: Funcional

### Implementado

- Cadastro de unidades
- Edição de unidades
- Exclusão de unidades
- Busca por nome
- Busca por cidade
- Busca por logradouro
- Cards de visualização
- Menu de ações (3 pontinhos)
- Página de detalhes
- Persistência LocalStorage

### Campos

- nome
- cep
- logradouro
- numero
- complemento
- bairro
- cidade
- uf
- locador
- kitnets
- aluguel
- vencimento
- status
- observacoes

### Rotas

/unidades
/unidades/[id]

## Dia 3

### Módulo Kitnets

Status: Funcional

### Implementado

* Cadastro de Kitnets
* Edição de Kitnets
* Exclusão de Kitnets
* Persistência LocalStorage
* Tabela administrativa
* Página de detalhes da Kitnet
* Indicadores operacionais

  * Total
  * Disponíveis
  * Ocupadas
  * Manutenção
* Menu de ações (3 pontinhos)

  * Visualizar
  * Editar
  * Excluir

### Campos atualmente suportados

* nome
* unidadeId
* unidadeNome
* metragem
* aluguel
* numero
* status

### Rotas

/kitnets

/kitnets/[id]

### Regras atuais

* Uma Kitnet pertence a uma única Unidade.
* Uma Unidade pode possuir várias Kitnets.
* A Kitnet possui controle de ocupação.
* A Kitnet possui status operacional.

### Próxima evolução

* Integração com módulo Inquilinos.
* Alteração automática de status para Ocupada quando houver vínculo com Inquilino.
* Exibição do morador atual.
* Exibição do contrato ativo.
* Integração futura com Financeiro.

Status:

✅ Fim do Dia 3
## Sincronização Geral Frontend ↔ Backend

Atualização recebida do Backend.

### Módulos Backend concluídos

* Usuários
* Autenticação JWT
* Middleware de Autenticação
* Middleware de Perfil
* Locadores
* Unidades
* Kitnets
* Inquilinos

### Segurança

Perfis disponíveis:

* ADMINISTRADOR
* ADMINISTRATIVO
* ZELADOR

### Contrato Oficial Inquilinos

Campos:

* id
* nome
* email
* telefone
* cpf
* dataInicioContrato
* ativo
* kitnetId

Relacionamentos:

* Kitnet 1:N Inquilinos

Decisão:

Frontend seguirá exatamente o contrato acima durante a implementação do módulo Inquilinos para evitar retrabalho futuro.

### Próxima Integração Prevista

* JWT
* Controle de Perfil
* API Unidades
* API Kitnets
* API Inquilinos

Status:

Backend e Frontend sincronizados até o módulo Inquilinos.
## Dia 4

Início do módulo Inquilinos.

Estrutura criada:

* InquilinoForm.jsx
* InquilinoTable.jsx
* InquilinoModal.jsx
* /inquilinos

Contrato adotado:

* id
* nome
* email
* telefone
* cpf
* dataInicioContrato
* ativo
* kitnetId

Sincronizado com Backend.
### Módulo Inquilinos

Estrutura base concluída:

* InquilinosPage
* InquilinoModal
* InquilinoForm
* InquilinoTable

Próxima etapa:

* Persistência LocalStorage
* Cadastro funcional
* Integração Form → Tabela
* CRUD completo
### Módulo Inquilinos

Implementado:

- Persistência LocalStorage
- Cadastro funcional
- Integração Form → Página
- Atualização automática da tabela
- Contador de inquilinos

Status:
🚧 CRUD em desenvolvimento
## Módulo Inquilinos

Status: Em desenvolvimento

### Estrutura planejada

Cadastro em etapas (Wizard)

#### Etapa 1 - Dados Pessoais

* Nome
* E-mail
* Telefone
* CPF ou RG
* Data de nascimento
* Endereço anterior
* Contato de emergência
* Telefone de emergência
* Upload de documento

#### Etapa 2 - Vinculação

* Seleção de Unidade
* Seleção de Kitnet

A listagem será gerada automaticamente utilizando os módulos de Unidades e Kitnets.

#### Etapa 3 - Contrato

* Data de início
* Prazo
* Tipo de garantia
* Valor de caução
* Quantidade de meses de caução
* Índice de reajuste

### Regras

* Um Inquilino ocupa apenas uma Kitnet ativa.
* Ao cadastrar um Inquilino, a Kitnet passa automaticamente para status "Ocupada".
* O Dashboard de Kitnets deve atualizar automaticamente.
* Os indicadores da Unidade devem atualizar automaticamente.
## Módulo Inquilinos

Status: Funcional

### Implementado

- Cadastro de inquilinos
- Edição de inquilinos
- Exclusão de inquilinos
- Visualização individual
- Formulário em etapas
- Dados pessoais
- Dados contratuais
- Vinculação com kitnets
- Controle de ocupação
- Persistência LocalStorage

### Regras

- Um inquilino ocupa apenas uma kitnet
- Uma kitnet ocupada não aparece para novos cadastros
- Ao cadastrar inquilino a kitnet é marcada como ocupada
- Ao excluir inquilino a kitnet é liberada automaticamente

### Rotas

/inquilinos
/inquilinos/[id]