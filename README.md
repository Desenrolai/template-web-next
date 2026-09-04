# template-web-next

Template base para frontends web da Desenrolai. Gerado pelo forge em `forge.desenrol.ai`.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **TypeScript 6** em modo strict
- **Tailwind CSS v4** (`@import "tailwindcss"` + `@theme` — não há `tailwind.config.ts`)
- **Vitest 4** + Testing Library
- **ESLint 9** (flat config) + Prettier — ver abaixo por que não é o 10
- **Node 24 LTS**

### Por que `eslint` está em `^9.39.5` e não em `^10`

Não é desleixo, e **subir às cegas quebra o lint**. `eslint-config-next@16.3.4` arrasta
`eslint-plugin-react`, `eslint-plugin-jsx-a11y` e `eslint-plugin-import`, e **nenhuma
versão publicada das três — nem prerelease — declara peer `^10`**. Com ESLint 10 o lint
morre assim:

```
TypeError: contextOrFilename.getFilename is not a function
```

(`context.getFilename()` foi removida no ESLint 10 e os plugins ainda a usam.)

O gatilho para reavaliar é **`eslint-plugin-jsx-a11y` publicar peer `^10`**, não uma data:

```bash
npm view eslint-plugin-jsx-a11y peerDependencies
```

A alternativa — dropar o `eslint-config-next` e montar a flat config à mão — custa perder
o lint de acessibilidade (`jsx-a11y`) e passar a manter a config a cada major do Next.
Decisão registrada na ADR-0037.

## Começando

```bash
cp .env.example .env.local
# preencha NEXT_PUBLIC_API_URL e NEXT_PUBLIC_APP_URL

npm install
npm run dev
```

## Scripts

| Comando             | Descrição                                                         |
| ------------------- | ----------------------------------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento                                       |
| `npm run build`     | Build de produção (standalone)                                    |
| `npm run start`     | Inicia o servidor de produção                                     |
| `npm run lint`      | ESLint                                                            |
| `npm run format`    | Prettier (check) — `format:write` corrige                         |
| `npm run typecheck` | `tsc --noEmit`                                                    |
| `npm test`          | Vitest (uma passada) — `test:watch` e `test:coverage` disponíveis |

## Cor de marca ≠ cor que carrega texto

O coral da marca (`--color-brand`, `#F0503C`) **não tem par que passe em AA**: 3,55:1 sobre
papel e 4,26:1 sobre carvão. Escurecê-lo melhora um lado e piora o outro — não existe um
tom único que sirva para as duas superfícies.

Por isso o tema em `app/globals.css` separa:

- **marca** — `--color-brand`, só identidade visual (barras, selos, ícones decorativos);
- **ação/texto** — rampa medida, uma cor por superfície:

| Token                                      | Superfície                 | Contraste medido |
| ------------------------------------------ | -------------------------- | ---------------- |
| `--color-action-on-paper` `#CE3B27`        | `--color-paper` `#FFFFFF`  | 4,91:1           |
| `--color-action-on-carbon` `#FC624D`       | `--color-carbon` `#262626` | 5,04:1           |
| `--color-action-on-carbon-hover` `#FF6F58` | `--color-carbon`           | 5,52:1           |

Os pares que a UI usa estão declarados em `app/theme/pairs.ts` e o teste
`app/theme/contrast.test.ts` **calcula** a razão de cada par a partir do CSS — renomear ou
escurecer um token quebra o teste, não só o visual. O mesmo teste inclui um caso de
controle provando que a marca reprova em AA nas duas superfícies (é o motivo da separação
existir) e uma guarda contra `var(--token, #fallback)`: o fallback é uma **segunda** fonte
de cor, invisível ao teste, que drifta em silêncio.

## Pool de teste dentro de container

`os.cpus()` reporta as CPUs do **host**, não o limite do cgroup. Dimensionar o pool do
Vitest por ele cria workers demais e o job morre por pressão de recurso **com todos os
testes passando**. `tooling/cgroup-cpus.ts` lê `/sys/fs/cgroup/cpu.max` (v2, com fallback
para `cpu.cfs_quota_us`/`cpu.cfs_period_us` do v1) e alimenta `maxWorkers` em
`vitest.config.ts`.

## Health check

`GET /api/health` → `{ "status": "ok" }`

## Deploy

Imagem multi-stage sobre `node:24-alpine`, rodando como **uid 1001** e compatível com
`readOnlyRootFilesystem: true` — que é como o forge sobe o pod. Publicada no GHCR pelo CI
ao dar push na branch padrão:

```
ghcr.io/desenrolai/<nome-do-repo>:main
```
