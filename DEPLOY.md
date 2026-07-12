# Deploy — Persana (Vercel)

O projeto está **pronto para deploy**: build de produção verde, rotas estáticas,
**nenhuma variável de ambiente** necessária (não há serviço externo). Framework
detectado automaticamente: Next.js.

O root do repositório git **é** a pasta `persana/`, então em qualquer caminho o
**Root Directory** na Vercel é `./` (a raiz do repo).

---

## Caminho A — Vercel CLI (mais rápido, sem GitHub)

Precisa de uma conta em https://vercel.com (o login abre no navegador).

```bash
cd "C:\Users\leova\OneDrive\Documentos\Programação\persana"
npx vercel login          # autentica (abre o navegador)
npx vercel                # 1º deploy (cria o projeto + Preview URL)
npx vercel --prod         # publica em produção
```

Na 1ª vez o CLI pergunta: escopo/conta, "Link to existing project?" → **No**,
nome do projeto (ex.: `persana`), diretório → **./**. As respostas ficam salvas
em `.vercel/` (já no .gitignore).

---

## Caminho B — GitHub + import na Vercel (deploy contínuo)

1. Criar um repositório vazio no GitHub (ex.: `persana`).
2. Apontar o remote e dar push:
   ```bash
   cd "C:\Users\leova\OneDrive\Documentos\Programação\persana"
   git remote add origin https://github.com/<seu-usuario>/persana.git
   git push -u origin master
   ```
3. Em https://vercel.com/new → **Import** o repo → confirmar:
   - Framework Preset: **Next.js** (auto)
   - Root Directory: **./**
   - Build Command / Output: **padrão** (deixar em branco)
4. **Deploy**. Cada push em `master` re-deploya sozinho.

---

## Referência de build (o que a Vercel roda)

| Item | Valor |
|---|---|
| Install | `npm install` |
| Build | `next build` (padrão) |
| Node | 18+ (a Vercel usa uma LTS atual por padrão) |
| Env vars | nenhuma |
| Saída | estático + serverless (rotas `/` e `/dashboard` são estáticas) |

## Checklist pré-deploy (já verificado)
- [x] `npm run build` verde — rotas `/` e `/dashboard` prerenderizadas estáticas
- [x] `tsc --noEmit` limpo
- [x] Fontes self-hosted (sem dependência de CDN em runtime)
- [x] Sem segredos/keys no código
