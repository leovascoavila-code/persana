# Persana — regras do projeto

## Identidade
- Direção: "Editorial Noturno" (Mercury × Stripe Press). Dark-first.
- Dois mundos: Tinta (app, escuro) e Journal (editorial). Nunca misturar numa mesma superfície.

## Tipografia
- Serifa Spectral: títulos, números-herói (stat tiles), texto editorial longo.
- Sans Manrope: toda a UI, rótulos, dados de tabela/eixo (tabular-nums).
- Fontes SEMPRE self-hosted via next/font. Proibido <link> para Google Fonts.

## Cor
- Superfícies em grafite neutro (tokens em globals.css). Sem tons roxos.
- --brand = **verde #1F9463** (Leo optou por evitar o vermelho do logo, 2026-07-12).
  Escala 300/400/500/600. Só em ação/foco/link/estado ativo. Máx ~5% da tela.
- --accent = **azul #1C7ED6** (acento secundário; substitui o periwinkle removido).
  Usado no eyebrow, série 2 do gráfico, avatar/badge do app. Tons de azul, nunca roxo.
- Vermelho fica RESERVADO só para danger (#E5605C) — não é cor de marca.
- Semânticas (success/warning/danger) só com ícone+rótulo.

## Componentes
- Base shadcn/ui + Radix, re-tokenizados com as CSS variables. Não hardcodar hex.
- Grade de 4px. Raios: 6/12/18. Duas sombras apenas.

## Referência visual
- /design-reference/*.html são o gabarito. Ao construir um componente, conferir
  o CSS correspondente lá antes de improvisar.
