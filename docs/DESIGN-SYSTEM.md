# 🎨 VIME APP 2.0 — Design System

> Documento oficial do padrão visual do VIME APP 2.0.

---

# Objetivo

Garantir que todos os módulos do sistema tenham a mesma identidade visual, organização e experiência de uso.

Todo novo componente desenvolvido deverá seguir este documento.

---

# Stack

- Next.js
- React
- TailwindCSS
- Lucide React
- Framer Motion

---

# Grid Base

O sistema utiliza uma escala baseada em múltiplos de 8.

Valores oficiais:

4px
8px
16px
24px
32px
40px
48px

Evitar medidas aleatórias.

---

# Espaçamentos

## Margem externa

24px

## Sidebar → Conteúdo

24px

## Topbar → Conteúdo

24px

## Entre cards

24px

## Entre seções

24px

## Entre título e conteúdo

16px

## Entre campos de formulário

16px

---

# Padding

## Cards

24px

Tailwind

```tsx
p-6
```

## Formulários

```tsx
p-6
```

## Modais

```tsx
p-6
```

---

# Border Radius

Padrão

```tsx
rounded-3xl
```

Botões pequenos

```tsx
rounded-xl
```

Badges

```tsx
rounded-full
```

---

# Sombras

Cards

```tsx
shadow-xl
```

Hover

```tsx
hover:shadow-2xl
```

---

# Cores

## Fundo

Slate

## Card

Vidro escuro

## Verde principal

Emerald

## Branco

Texto

## Cinza

Textos secundários

---

# Botões

Primário

Verde

```tsx
bg-emerald-600
hover:bg-emerald-700
```

Secundário

Glass

---

# Inputs

Sempre utilizar

```tsx
rounded-2xl

border

bg-white/5

backdrop-blur

focus:border-emerald-500

transition-all
```

---

# Cards

Todos os cards seguem:

```tsx
rounded-3xl

border

border-white/10

bg-slate-900/80

backdrop-blur-xl

p-6

transition-all
```

Hover

```tsx
hover:border-emerald-500/30

hover:-translate-y-1

hover:shadow-xl
```

---

# Modais

Todos os modais possuem

```tsx
rounded-3xl

max-h-[90vh]

overflow-y-auto

p-6
```

---

# Scroll

Sempre que houver:

- tabela

- grid

- lista

- modal

- histórico

- dashboard

- cards

Deve existir scroll quando necessário.

Nunca deixar conteúdo ultrapassar a tela.

---

# Ícones

Biblioteca oficial

Lucide React

Tamanho padrão

20

Cards KPI

34

---

# Animações

Biblioteca

Framer Motion

Fade

Slide

Scale

Duração

0.3 ~ 0.5 segundos

---

# Dashboard

Sempre utilizar

Gap

```tsx
gap-6
```

Space

```tsx
space-y-6
```

Cards

```tsx
rounded-3xl
```

---

# Sidebar

Largura

```tsx
w-[290px]
```

Colapsada

```tsx
w-24
```

---

# Topbar

Altura

```tsx
h-16
```

Sempre fixa no topo.

---

# Componentes reutilizáveis

MainLayout

Sidebar

Topbar

StatsCard

CardBase

Button

Input

Modal

Table

Badge

DashboardHeader

---

# Padrão dos módulos

Todo módulo novo deve possuir:

✅ Dashboard

✅ Cards Resumo

✅ Lista

✅ CRUD

✅ Modal

✅ Formulário

✅ Visualização

✅ Filtros

✅ Scroll

---

# Ordem de Desenvolvimento

1. Frontend

2. Layout

3. Componentes

4. LocalStorage

5. Backend

6. PostgreSQL

7. Prisma

8. Integrações

---

# Objetivo Final

Criar um ERP imobiliário moderno, consistente, reutilizável e preparado para produção.

04/08/2026

🎨 VIME APP 2.0 — Design System Oficial

Documento oficial de arquitetura visual, componentes e experiência do usuário do VIME APP 2.0.

Filosofia do Sistema

O VIME deve transmitir:

ERP Premium
Organização
Modernidade
Rapidez
Elegância
Consistência
Poucos cliques
Alto reaproveitamento de componentes

Todo componente criado deverá parecer que sempre existiu no sistema.

Nenhuma tela pode possuir aparência diferente das demais.

Stack Oficial
Next.js
React
TailwindCSS
Lucide React
Framer Motion
Arquitetura

Separação obrigatória.

UI
↓

Componentes do módulo
↓

Página

↓

Services

↓

Backend

Nunca colocar regra de negócio dentro dos componentes UI.

Componentes UI

Todos ficam em

src/components/ui

Componentes oficiais:

ActionMenu
Badge
Button
Card
ConfirmDialog
EmptyState
FadeIn
Input
Loading
Modal
Page
PageContainer
PageGrid
PageHeader
PageSection
SearchInput
Select
StatsCard
Table
Textarea

Estes componentes são utilizados por TODOS os módulos.

⭐ NOVO PADRÃO OFICIAL — Menus de Ações

Nunca mais utilizar:

position: absolute

para menus de ações.

❌ Errado

<div
  className="
    absolute
    right-0
    top-12
  "
>
Obrigatório

Todos os menus de ações utilizarão

ActionMenu.jsx

com

createPortal()

e

position: fixed

Estrutura oficial:

<ActionMenu
    open={open}
    position={position}
    onClose={...}
>

<MenuButton ... />

<MenuButton ... />

<MenuButton ... />

</ActionMenu>

Isso garante:

menu acima da tabela
menu acima dos cards
menu acima dos modais
sem cortes por overflow
comportamento igual ao Chrome
padrão único do sistema
Componentes de Ações

Cada módulo possui um componente próprio.

Exemplo

KitnetActionsMenu

ContratoActionsMenu

UnidadeActionsMenu

InquilinoActionsMenu

LocadorActionsMenu

SolicitacaoActionsMenu

VistoriaActionsMenu

Todos utilizam internamente

ActionMenu

Nunca criar menus diretamente na tabela.

Estrutura dos módulos

Todo módulo obrigatoriamente possui

ModuloHeader

ModuloStats

ModuloFilters

ModuloTabs

ModuloDashboard

ModuloTable

ModuloCard

ModuloCardList

ModuloModal

ModuloForm

ModuloActionsMenu

page.js
Fluxo das páginas
MainLayout

↓

Page

↓

PageContainer

↓

FadeIn

↓

PageHeader

↓

SearchInput

↓

Stats

↓

Filters

↓

Tabs

↓

Dashboard

↓

Table / Cards

↓

Modal

Nenhum módulo pode fugir desta estrutura.

Tables

Sempre utilizar

<Table />

Nunca criar tabelas diretamente.

As colunas utilizam

columns[]

com

render()

para personalizações.

Menus de ações:

KitnetActionsMenu

ContratoActionsMenu

etc.
Cards

Todos seguem:

rounded-3xl

border-white/10

bg-[#19242b]/90

backdrop-blur-xl

shadow-xl

transition-all

Hover

hover:border-emerald-500/30

hover:-translate-y-1

hover:shadow-2xl
Inputs

Sempre

Input

Select

Textarea

Nunca usar

<input>

<select>

<textarea>

diretamente nas páginas.

Botões

Sempre

<Button />

Variantes oficiais

primary

secondary

danger

ghost
Modais

Sempre

<Modal>

Nunca usar div fixa.

Padrão:

max-w-2xl

ou

max-w-3xl

rounded-3xl

max-h-[90vh]

overflow-y-auto

backdrop-blur
Scroll

Sempre existir em

tabelas
dashboards
grids
cards
modais
listas

Nunca deixar conteúdo ultrapassar a tela.

Dashboard

Estrutura

Header

↓

Cards KPI

↓

Filtros

↓

Tabs

↓

Dashboard

↓

Tabela

↓

Modal
Espaçamento

Escala oficial

4

8

16

24

32

40

48

Tailwind

gap-6

space-y-6

p-6

rounded-3xl
Ícones

Biblioteca

Lucide React

Tamanhos

18 → menus

20 → padrão

32 → cards

40~48 → EmptyState
Services

Toda API fica em

src/services

Nunca utilizar

fetch()

axios()

diretamente nas páginas.

Hooks

Toda regra reutilizável

src/hooks
Backend

Fluxo oficial

Frontend

↓

Service

↓

Controller

↓

Service

↓

Prisma

↓

PostgreSQL
Ordem de Desenvolvimento

Sempre seguir esta sequência:

Layout
UI
Componentes do módulo
Página
LocalStorage (quando necessário)
Integração com API
Backend
Prisma
PostgreSQL
Integrações externas
Objetivo Final

Criar um ERP imobiliário premium, consistente, reutilizável e preparado para produção.

Nenhum componente novo poderá fugir deste documento.

📌 Eu ainda acrescentaria uma regra que vai nos salvar MUITO tempo:
REGRA Nº 1 DO VIME

Se um componente puder ser reutilizado em dois ou mais módulos, ele obrigatoriamente deve ser transformado em componente global (src/components/ui) ou em um padrão oficial reutilizável. Nunca resolver um problema apenas em um módulo.

Foi exatamente isso que aconteceu hoje. Perdemos tempo porque havia um menu específico em Kitnets e outro em Contratos. Com essa regra, qualquer melhoria (como o ActionMenu) é feita uma única vez e reaproveitada no sistema inteiro. Isso vai acelerar muito o desenvolvimento do VIME daqui para frente.