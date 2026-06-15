# VIME APP 2.0

## Documentação de Desenvolvimento – Dia 3

**Data:** 13/06/2026

**Responsável:** Arthur

---

# Objetivo do Dia

Implementar a infraestrutura inicial do backend utilizando Node.js, Express, PostgreSQL e Prisma, além de desenvolver e validar completamente o módulo de Unidades.

---

# Atividades Realizadas

## 1. Instalação do PostgreSQL

Foi realizada a instalação do PostgreSQL 18.

Configurações utilizadas:

* Porta: 5432
* Usuário: postgres
* Banco principal criado: vime_db

Instalação concluída com sucesso.

---

## 2. Configuração do Projeto Backend

Foi criada a estrutura inicial do backend utilizando:

* Node.js
* Express
* PostgreSQL
* Prisma ORM

Arquivos principais configurados:

* package.json
* .env
* server.js
* prisma/schema.prisma

---

## 3. Configuração do Prisma

Foi realizada a integração entre Prisma e PostgreSQL.

String de conexão:

```env
DATABASE_URL="postgresql://postgres:SENHA@localhost:5432/vime_db"
```

Validações executadas:

```bash
npx prisma migrate dev
npx prisma validate
```

Resultado:

* Banco sincronizado
* Prisma Client gerado
* Schema validado com sucesso

---

## 4. Estrutura Arquitetural do Backend

Foi criada a estrutura padrão do projeto:

src/

config/
controllers/
middlewares/
modules/
routes/
services/
validators/
utils/

Objetivo da estrutura:

* Separação de responsabilidades
* Facilidade de manutenção
* Escalabilidade para os próximos módulos

---

## 5. Criação do Modelo Unidade

Model criado no Prisma:

```prisma
model Unidade {
  id        String   @id @default(uuid())
  nome      String
  cidade    String
  uf        String
  locador   String
  kitnets   Int
  status    String   @default("ATIVA")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Migration criada e aplicada ao banco.

---

## 6. Desenvolvimento do CRUD de Unidades

### Endpoints Implementados

GET /unidades

Retorna todas as unidades cadastradas.

---

POST /unidades

Cria uma nova unidade.

Estrutura esperada:

```json
{
  "nome": "Residencial Primavera",
  "cidade": "Goiânia",
  "uf": "GO",
  "locador": "Arthur",
  "kitnets": 12
}
```

---

PUT /unidades/:id

Atualiza uma unidade existente.

---

DELETE /unidades/:id

Remove uma unidade do sistema.

---

## 7. Camadas Desenvolvidas

### Config

src/config/prisma.js

Responsável pela conexão com o Prisma Client.

---

### Service

src/services/unidadeService.js

Responsável pelas regras de acesso ao banco:

* listar()
* buscarPorId()
* criar()
* atualizar()
* remover()

---

### Controller

src/controllers/unidadeController.js

Responsável por receber requisições HTTP e chamar os serviços.

---

### Routes

src/routes/unidadeRoutes.js

Responsável pelo mapeamento dos endpoints REST.

---

### Validator

src/validators/unidadeValidator.js

Estrutura criada para futuras validações.

---

## 8. Testes Realizados

### Health Check

Endpoint:

```http
GET /health
```

Resposta:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

Resultado:

✅ Funcionando

---

### Teste POST

Resultado:

✅ Unidade criada no PostgreSQL

---

### Teste GET

Resultado:

✅ Lista retornada corretamente

---

### Teste PUT

Resultado:

✅ Registro atualizado corretamente

---

### Teste DELETE

Resultado:

✅ Registro removido corretamente

---

## 9. Ferramenta de Testes

Foi instalado e utilizado o Thunder Client para validação dos endpoints REST.

Operações validadas:

* GET
* POST
* PUT
* DELETE

Todos os testes concluídos com sucesso.

---

## 10. Versionamento

Foi realizado versionamento completo utilizando Git.

Arquivos adicionados:

* Configurações do projeto
* Schema Prisma
* Migrations
* Controllers
* Services
* Routes
* Validators

Commit realizado:

```bash
git commit -m "modulo unidades ok"
```

Push realizado:

```bash
git push origin main
```

Resultado:

✅ Código enviado para GitHub

✅ Repositório sincronizado

---

# Situação Atual do Projeto

## Backend

Status: Operacional

Tecnologias:

* Node.js
* Express
* PostgreSQL
* Prisma ORM

---

## Módulos Concluídos

### Unidades

Funcionalidades:

* Cadastro
* Listagem
* Atualização
* Exclusão

Persistência em banco de dados validada.

---

# Próximo Passo

## Dia 4

Implementação do módulo Kitnets.

Estrutura planejada:

```txt
Kitnet
├─ id
├─ numero
├─ unidadeId
├─ ocupada
├─ valorAluguel
├─ metragem
├─ status
└─ inquilinoAtual
```

Relacionamento:

```txt
Unidade 1:N Kitnets
```

---

# Encerramento

Dia 3 concluído com sucesso.

Backend funcional.
Banco de dados operacional.
CRUD de Unidades implementado, testado e sincronizado com GitHub.

Status Final:

✅ PostgreSQL configurado

✅ Prisma configurado

✅ Backend iniciado

✅ CRUD Unidades concluído

✅ Testes concluídos

✅ GitHub sincronizado

**Fim do Dia 3**

# VIME 2.0 - DOCUMENTAÇÃO DE ENCERRAMENTO

## Status do Projeto

### 🚩 Fim do Dia 7

---

# Backend Concluído

## Usuários

CRUD completo implementado e validado.

### Funcionalidades

* Criar usuário
* Listar usuários
* Atualizar usuário
* Excluir usuário

### Perfis disponíveis

* ADMINISTRADOR
* ADMINISTRATIVO
* ZELADOR

---

## Autenticação JWT

Implementado e validado.

### Funcionalidades

* Login por e-mail e senha
* Geração de token JWT
* Validação de token
* Bloqueio de acesso sem autenticação

### Testes realizados

* Login válido
* Login inválido
* Token válido
* Token ausente

Resultados:

* 200 OK
* 401 Token não informado

---

## Middleware de Perfil

Implementado e validado.

### Regras testadas

ADMINISTRADOR

* Acesso permitido

ZELADOR

* Acesso negado

Resultados:

* 200 OK
* 403 Acesso negado

---

## Unidades

CRUD implementado e validado.

### Campos sincronizados com Frontend

* id
* nome
* cep
* logradouro
* numero
* complemento
* bairro
* cidade
* uf
* aluguel
* vencimento
* observacoes
* locador
* status
* kitnets

### Relacionamentos

* Unidade → Locador

---

## Kitnets

CRUD implementado e validado.

### Ajustes realizados

Sincronização com contrato do Frontend.

### Campos atuais

* id
* nome
* unidadeId
* numero
* metragem
* aluguel
* status

### Relacionamentos

* Unidade 1:N Kitnet

### Ajustes realizados

* valorAluguel → aluguel
* inclusão do campo nome
* migration aplicada com preservação dos dados

---

## Inquilinos

CRUD implementado.

### Campos atuais

* id
* nome
* email
* telefone
* cpf
* dataInicioContrato
* ativo
* kitnetId

### Relacionamentos

* Kitnet 1:N Inquilinos

Observação:

Aguardando contrato final do Frontend para expansão dos campos.

---

## Locadores

CRUD completo implementado e validado.

### Campos

* nome
* email
* telefone
* cpfCnpj
* endereco
* cidade
* uf
* banco
* agencia
* conta
* taxaAdministracao
* multa
* juros
* ativo

### Testes realizados

* POST
* GET
* PUT
* DELETE

Todos validados.

---

## Relacionamento Unidade ↔ Locador

Implementado e validado.

### Estrutura

Locador 1:N Unidades

### Testes realizados

* Criação de Unidade com locadorId
* Consulta com include
* Retorno de locadorRel

Resultado:

Relacionamento funcionando corretamente.

---

## Segurança

### Usuários

Protegido por:

* authMiddleware
* perfilMiddleware

### Locadores

Protegido por:

* authMiddleware
* perfilMiddleware

Regras:

ADMINISTRADOR

* GET
* POST
* PUT
* DELETE

ADMINISTRATIVO

* GET
* POST
* PUT

ZELADOR

* Sem acesso

Testes realizados:

* ADMINISTRADOR → 200
* ZELADOR → 403
* Sem token → 401

Todos validados.

---

# Sincronização Frontend

Atualizações recebidas e alinhadas:

## Unidades

Sincronizado.

## Kitnets

Sincronizado.

## Inquilinos

Aguardando definição final do contrato do Frontend.

---

# Próximas Etapas

## Segurança

* Proteger rotas de Unidades
* Proteger rotas de Kitnets

## Negócio

* Contratos
* Solicitações
* Vistorias
* Financeiro
* Relatórios

## Integração

* Consumir APIs reais no Frontend
* Remover dependência de localStorage gradualmente

---

# Resumo Executivo

Concluído:

✓ Usuários
✓ JWT
✓ Auth Middleware
✓ Perfil Middleware
✓ Unidades
✓ Kitnets
✓ Inquilinos
✓ Locadores
✓ Unidade ↔ Locador
✓ Sincronização Frontend Unidades
✓ Sincronização Frontend Kitnets
✓ Proteção de Usuários
✓ Proteção de Locadores

Status geral do Backend:

Estrutura principal consolidada e pronta para evolução dos módulos operacionais.
