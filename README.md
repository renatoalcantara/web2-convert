# web2-convert

Mande um print de um site dos anos 2000 — o Claude Opus 4.7 reproduz fielmente em HTML 4.01 (com tabelas, `<marquee>`, fontes Times New Roman e tudo mais) e em seguida reimagina o mesmo site como se fosse desenhado e construído hoje.

Uma brincadeira sobre como a web mudou — e sobre o que sobrevive ao tempo.

## Como funciona

1. Upload do print → Vercel Blob
2. SSE stream da reprodução fiel (HTML 4.01 retrô) usando vision do Claude
3. Botão "Modernizar isto" → SSE stream da releitura 2026 (HTML5 semântico, responsivo)
4. Slider antes/depois comparando as duas versões
5. Galeria pública (`/galeria`) e pessoal (`/minhas`, escopada por cookie)

## Stack

Next.js 15 · TypeScript · Tailwind · Anthropic SDK (`claude-opus-4-7`) · Drizzle + Neon · Vercel Blob.

## Setup local

```bash
cp .env.example .env.local
# preencha ANTHROPIC_API_KEY, DATABASE_URL, BLOB_READ_WRITE_TOKEN

npm install
npm run db:generate
npm run db:migrate
npm run dev
```

## Convenções

Veja [`CLAUDE.md`](./CLAUDE.md) para arquitetura, fluxo de requisição e regras para contribuir (humano ou agente).
