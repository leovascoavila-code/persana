# Persana

SaaS com **site de marketing + app** na direção visual **"Editorial Noturno"**
(Mercury × Stripe Press), **dark-first**. Dois mundos que nunca se misturam numa
mesma superfície:

- **Tinta** — o produto logado (escuro, grafite neutro)
- **Journal** — a comunicação editorial (grafite + acento de marca)

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — tokens como CSS variables via `@theme`
- Primitivos no padrão **shadcn/ui + Radix**, re-tokenizados (sem hex hardcoded)
- **Spectral** (serifa) + **Manrope** (sans) — **self-hosted** via `next/font/local`
  (arquivos `.woff2` do @fontsource em `public/fonts/`, zero dependência de CDN)
- Gráficos em **SVG** declarativo

## Rodar local

```bash
npm install
npm run dev      # http://localhost:3000
```

Outros scripts:

```bash
npm run build    # build de produção
npm start        # servir o build
npm run lint     # eslint
```

## Estrutura

```
persana/
├─ app/
│  ├─ (marketing)/page.tsx     # home — mundo Journal (Nav, Hero, Journal)
│  ├─ (app)/dashboard/page.tsx # app — mundo Tinta (StatTiles, gráfico, tabela)
│  ├─ layout.tsx               # fontes + metadata
│  ├─ globals.css              # design tokens (fonte de verdade das cores)
│  ├─ fonts.ts                 # Spectral + Manrope self-hosted
│  └─ icon.svg                 # favicon 'p.'
├─ components/
│  ├─ ui/            # primitivos: button, badge, card, input, table, stat-tile
│  ├─ marketing/     # Nav, Hero, AppPreview, JournalSection, Logo
│  └─ app/           # AppShell, RevenueCard, RevenueChart
├─ lib/utils.ts      # cn() (clsx + tailwind-merge)
├─ public/fonts/     # .woff2 (Spectral 400/500/600, Manrope 400/500/600/700)
├─ design-reference/ # HTML dos protótipos — gabarito visual
├─ CLAUDE.md         # regras de design do projeto
└─ DEPLOY.md         # passo-a-passo de deploy na Vercel
```

## Design tokens (resumo)

Definidos em [`app/globals.css`](app/globals.css) e expostos como utilitários
Tailwind pelo `@theme`. **Não hardcodar hex** — usar sempre `var(--token)` ou as
utilities (`bg-bg-1`, `text-text-2`, `bg-brand-500`, `text-accent-300`…).

| Grupo | Tokens |
|---|---|
| Superfícies (Tinta) | `--bg-0` #0C0C0D · `--bg-1` #141416 · `--bg-2` #1C1C1F · `--bg-3` #26262A |
| Texto | `--text-1` #F4F4F5 · `--text-2` #A1A1AA · `--text-3` #71717A |
| **Brand** (verde) | `--brand-500` **#1F9463** (+300/400/600) — só ação/foco/link, máx ~5% da tela |
| **Accent** (azul) | `--accent-500` **#1C7ED6** (+300/400/600) — eyebrow, série 2, toques no app |
| Journal | `--journal-bg` #17171A · `--journal-card` · `--journal-quote` |
| Semânticas | `--success` · `--warning` · `--danger` (#E5605C) — sempre com ícone+rótulo |

**Regras de cor:** superfícies em grafite neutro (sem roxo); vermelho **só** para
`danger`; números de tabela/eixo em Manrope `tabular-nums`, números-herói em Spectral.
Detalhes em [`CLAUDE.md`](CLAUDE.md).

## Tipografia

- **Spectral** (serifa): títulos, números-herói (stat tiles), texto editorial.
- **Manrope** (sans): toda a UI, rótulos, dados de tabela/eixo.
- Sempre self-hosted — proibido `<link>` para Google Fonts.

## Deploy

Pronto para Vercel (sem variáveis de ambiente). Ver [`DEPLOY.md`](DEPLOY.md).
