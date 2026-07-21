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