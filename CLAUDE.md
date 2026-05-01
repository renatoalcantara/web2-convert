# CLAUDE.md

Guia para assistentes de IA (e humanos) trabalhando neste repositório.

## O que é

**web2-convert** é uma "brincadeira" de portfólio: o usuário envia um print (jpg/png/webp/gif) de um site dos anos 2000 e a aplicação faz duas coisas em sequência, em streaming:

1. **Reprodução fiel** — Claude reconstrói o site em HTML 4.01 com tabelas, `<font>`, `<marquee>`, paleta saturada e tudo que define a estética da época.
2. **Releitura moderna (2026)** — em seguida, Claude reimagina o mesmo site (mesma intenção, mesmo conteúdo) como se fosse desenhado e construído hoje: HTML5 semântico, Grid/Flex, design tokens, responsivo, acessível.

A entrega final inclui um **slider antes/depois** comparando as duas versões, **galeria pública** com tudo que foi feito e **galeria pessoal** (escopada por cookie) para o usuário guardar suas conversões.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript estrito |
| Estilo | Tailwind CSS 3 (sem shadcn/ui ainda — componentes próprios em `src/components`) |
| LLM | Anthropic SDK · modelo **`claude-opus-4-7`** (vision + streaming + prompt caching) |
| Banco | Postgres serverless (Neon) via **Drizzle ORM** |
| Storage de imagem | **Vercel Blob** (`@vercel/blob`) |
| Identidade | Cookie HttpOnly `w2c_owner` (UUID); sem auth no MVP |
| Deploy alvo | Vercel |

A escolha de Opus 4.7 é deliberada: a fidelidade visual da reprodução retrô e o gosto da releitura moderna são o produto. Não trocar por Haiku/Sonnet sem combinar.

## Estrutura do código

```
src/
  app/
    layout.tsx                 # shell global (header com nav, footer)
    page.tsx                   # landing (hero animado + DropZone + passos 1/2/3)
    globals.css
    not-found.tsx
    c/[id]/page.tsx            # página pública de uma conversão
    galeria/page.tsx           # feed público (status='done' + isPublic)
    minhas/page.tsx            # conversões do dono atual (cookie)
    api/
      convert/route.ts         # POST: upload de imagem → cria registro pending
      convert/[id]/retro/route.ts   # GET (SSE): streama HTML retrô
      convert/[id]/modern/route.ts  # GET (SSE): streama HTML moderno
      conversions/route.ts     # GET: lista (?scope=public|mine)
  components/
    DropZone.tsx               # client: upload de arquivo → POST /api/convert → redireciona
    HeroBeforeAfter.tsx        # client: dois iframes alternando opacidade na home
    StreamingFrame.tsx         # client: consome SSE, renderiza preview/código
    ConversionFlow.tsx         # client: orquestra retro → botão → modern → slider
    BeforeAfterSlider.tsx      # client: divisor arrastável entre dois iframes
    GalleryGrid.tsx            # server-friendly: grid de cards
  db/
    index.ts                   # cliente Drizzle + Neon
    schema.ts                  # tabela `conversions` + enum de status
  lib/
    anthropic.ts               # cliente do SDK + constante MODEL
    prompts.ts                 # system + user prompts (retro e modern)
    owner.ts                   # cookie do dono (read/write)
    utils.ts                   # cn(), stripHtmlFences()
drizzle.config.ts
tailwind.config.ts
next.config.ts
.env.example
```

## Fluxo da requisição (mental model)

```
[home] → DropZone POST /api/convert (multipart)
            ↓ Vercel Blob put + insert conversions(status=pending)
            ↓ retorna { id }
[client redireciona] /c/[id]
            ↓ ConversionFlow renderiza imagem original
            ↓ StreamingFrame conecta GET /api/convert/[id]/retro (SSE)
            ↓     anthropic.messages.stream(model=claude-opus-4-7, system=RETRO, image+texto)
            ↓     emite eventos {type:"delta"|"complete"|"error"}
            ↓     ao final, UPDATE conversions SET retroHtml, status='retro_done'
[client mostra botão "Modernizar isto →"]
            ↓ usuário clica
[StreamingFrame] GET /api/convert/[id]/modern (SSE)
            ↓     mensagem inclui imagem + retroHtml + system MODERN
            ↓     UPDATE conversions SET modernHtml, status='done'
[client revela] BeforeAfterSlider(retro, modern) + downloads
```

A persistência do HTML após streaming permite que `/c/[id]` seja **sempre revisitável** sem regenerar — a página detecta `retroHtml`/`modernHtml` no servidor e renderiza diretamente em vez de re-streamar.

## Convenções importantes

### Modelo Claude

- Sempre `claude-opus-4-7` via `MODEL` em `src/lib/anthropic.ts`. Não inline o nome do modelo em outros arquivos.
- **Prompt caching obrigatório**: o `system` é enviado como array com `cache_control: { type: "ephemeral" }`. Os prompts em `src/lib/prompts.ts` são longos por design — o caching paga o tradeoff.
- **Streaming sempre**: usamos `anthropic.messages.stream(...)` com SSE para o cliente. Nunca substituir por `messages.create` não-streaming sem motivo (a UX do "vai aparecendo" é parte da brincadeira).
- `max_tokens: 8192` é o suficiente para sites únicos. Se algum dia precisar mais, atualize nos dois route handlers.

### Prompts

- Vivem em `src/lib/prompts.ts`. **Não duplicar** strings de prompt em outros lugares.
- Os system prompts impõem regras duras (HTML 4.01 com `<table>` no retrô, HTML5 semântico no moderno) e dizem **"output only raw HTML, no markdown fences"**. Mesmo assim, sempre rodamos `stripHtmlFences()` em `src/lib/utils.ts` no resultado antes de salvar — defesa em profundidade.
- Mudanças nos prompts afetam diretamente a qualidade do produto. Trate como código de produto, não como config.

### Banco

- Schema único: `conversions` em `src/db/schema.ts`. Estados: `pending → retro_streaming → retro_done → modern_streaming → done` (ou `error`).
- Sempre acessar via `db` exportado de `src/db/index.ts`. Nunca instanciar `neon()` em outros arquivos.
- Migrations: `npm run db:generate` para gerar SQL, `npm run db:migrate` para aplicar. Os arquivos vão para `drizzle/` (em `meta/` ignorado no git).
- `ownerCookie` é o cookie `w2c_owner`. Para "minhas conversões" o filtro é `eq(conversions.ownerCookie, owner)`.

### Iframes e segurança

- **Todo HTML gerado pelo modelo é renderizado em `<iframe sandbox="allow-same-origin">`**. Isso é crítico — modelo pode gerar `<script>` e queremos que rode no contexto do iframe (para a fidelidade da brincadeira), mas nunca com acesso ao topo. Não relaxe esse sandbox sem combinar.
- O `srcDoc` recebe a string crua; nunca interpolar com template strings do app diretamente em DOM fora do iframe.

### Upload

- Limite **8MB** e MIMEs permitidos: `image/png`, `image/jpeg`, `image/webp`, `image/gif`. Validado em `src/app/api/convert/route.ts`. Se relaxar, mudar também o `accept` do `<input>` no `DropZone`.
- Uploads vão para Vercel Blob com `access: "public"`. Cada conversão guarda apenas a URL pública.

### Estilo de código

- TypeScript estrito (`strict: true`). Não desabilitar regras pontuais sem necessidade.
- Componentes client usam `"use client"` no topo. Tudo que faz IO/DB roda em server components ou route handlers (Node runtime).
- Tailwind direto no JSX. Variáveis CSS para a paleta (`--bg`, `--fg`, `--muted`, `--accent`, `--border`) em `globals.css` para permitir tweak global rápido.
- Sem comentários explicando o que o código faz; apenas o "porquê" não-óbvio (ver instruções gerais).
- Rotas API: sempre `runtime = "nodejs"` (precisamos do `Buffer` para base64 da imagem). Para os streams de IA, também `maxDuration = 300`.

### Identidade

- Cookie `w2c_owner` é criado em `getOrCreateOwnerCookie()` (apenas em rotas de escrita: POST /api/convert). Páginas de leitura usam `getOwnerCookie()` (não cria, pode retornar `null`).
- Não implementar auth real (NextAuth, Clerk, etc.) sem combinar — é fora de escopo do MVP.

## Comandos

```bash
npm install
npm run dev          # localhost:3000
npm run build        # next build
npm run typecheck    # tsc --noEmit (sem testes ainda)
npm run lint         # next lint

npm run db:generate  # cria migration a partir do schema
npm run db:migrate   # aplica migrations no DATABASE_URL
npm run db:studio    # GUI do Drizzle
```

### Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

- `ANTHROPIC_API_KEY` — chave do console Anthropic
- `DATABASE_URL` — Postgres do Neon (com `?sslmode=require`)
- `BLOB_READ_WRITE_TOKEN` — token do Vercel Blob

Sem qualquer uma delas, a aplicação falha no boot (intencional — falha cedo).

## Roadmap curto (não implementado ainda)

- Toggle privado/público por conversão (schema já tem `isPublic`, falta UI)
- Edição manual do título de uma conversão
- "Regerar moderna" reusando a mesma retrô (variante da releitura)
- OG image dinâmica para `/c/[id]` (capturar o slider)
- Testes (Playwright para E2E do fluxo, Vitest para utils)
- Rate limit no `/api/convert` (Upstash) — atualmente qualquer um pode spamar

## Notas para o assistente

- **Não invente URLs** para Anthropic, Vercel ou Neon docs — pergunte ou peça WebFetch.
- **Não troque o modelo** sem pedir. `claude-opus-4-7` é decisão de produto.
- Quando alterar prompts em `src/lib/prompts.ts`, **renderize uma conversão de teste** antes de afirmar que está bom — a saída do modelo é o produto.
- Mudanças no schema **exigem** rodar `npm run db:generate` e commitar a migration junto.
- Se for tocar no `BeforeAfterSlider` ou no sandbox dos iframes, lembre que segurança > UX bonitinha.
- Trabalhe sempre na branch `claude/add-claude-documentation-2mjsf` enquanto este projeto estiver em scaffold inicial; depois disso seguir convenção do repo.
