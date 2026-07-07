# HANDOFF — Landing Page Corre Conça (Módulo 1)

Este documento registra o estado da entrega da **Landing Page** (Módulo 1) da 1ª Corrida Solidária Corre Conça, o que ainda depende de informação do cliente, e decisões técnicas relevantes para quem continuar o projeto (incluindo o Módulo 2 — Dashboard do Organizador).

## Status

Módulo 1 (Landing Page) **completo e verificado localmente**. Nenhum deploy foi realizado (ver seção "Deploy" abaixo).

Verificação final executada em 2026-07-06:
- `npm run build` — build de produção completo, 0 erros. Rota `/` estática com `revalidate: 3600`, `/api/inscricao` dinâmica.
- `npm run lint` (ESLint) — 0 erros, 0 warnings.
- `npx tsc --noEmit` — 0 erros (TypeScript strict, sem `any` nem `@ts-ignore` em todo o projeto).
- `validarCPF` testado isoladamente (script fora do repo, `scratchpad/test-cpf.js`) com 7 casos: CPF válido com e sem máscara, sequências repetidas (`111.111.111-11`, `000.000.000-00`), dígito verificador errado, CPF aleatório inválido e tamanho inválido — todos passaram.
- Testado manualmente em navegador real nos breakpoints 375px / 768px / 1280px: grid responsivo, âncoras de scroll suave, sticky CTA mobile.
- Fluxo de inscrição testado ponta a ponta: máscaras de CPF/telefone/data, rejeição de CPF inválido, submit com sucesso (`POST /api/inscricao` → `{"success":true}`, log estruturado no terminal do `next dev`), modal de sucesso.
- Accordion de Regulamento/FAQ testado (abre single-open, fecha corretamente).
- Sem dado de evento hardcoded fora de `lib/constants.ts`, exceto textos estáticos de SEO/copy (título/descrição de metadata, rótulo "Somente modalidade 6KM") que duplicam informação já presente em `constants.ts` — aceitável, não é dado que muda com frequência.

## Como rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`. Build de produção: `npm run build && npm run start`.

## Pendências (aguardando informação do cliente)

Todas as pendências abaixo estão marcadas com comentário `PLACEHOLDER` no código-fonte, para fácil localização:

| Pendência | Arquivo / variável | Valor atual |
|---|---|---|
| Link de pagamento do painel InfinitePay | `lib/constants.ts` → `LINK_INFINITEPAY` | `'#'` |
| E-mail real da organização | `lib/constants.ts` → `EMAIL_ORGANIZACAO` | `'contato@correconca.org.br'` (inventado) |
| Logo real do evento | `public/images/logo-placeholder.svg` (referenciado via `lib/constants.ts` → `LOGO_PATH`) | SVG placeholder circular roxo/branco |
| Links reais de redes sociais (Instagram/WhatsApp) | `lib/constants.ts` → `REDES_SOCIAIS` | `{ instagram: '#', whatsapp: '#' }` |
| Nome real da organização realizadora | `lib/constants.ts` → `ORGANIZACAO_REALIZACAO` | `'Organização a definir'` |
| Local e data de retirada do kit | `lib/constants.ts` → `KIT_NOTA`, `FAQ_ITEMS`, `REGULAMENTO_ITEMS` | "Data e local a confirmar" |
| Valor da premiação em dinheiro (pódio 6KM) | `lib/constants.ts` → `PREMIACAO.podio6km` | "valor a anunciar" |
| Domínio de produção definitivo (Open Graph / metadata) | `app/layout.tsx` → `metadataBase` | `https://correconca.example.com.br` (placeholder) |
| Ícone de Instagram | `components/sections/Footer.tsx` | Substituído por `Camera` (lucide-react) + `aria-label="Instagram do Corre Conça"`, pois `lucide-react@1.23.0` removeu todos os ícones de marca. Trocar por um SVG de marca real quando possível. |

Nenhuma dessas pendências bloqueia o funcionamento da página — todas têm um valor de fallback sensato e visível apenas no código-fonte/atributos, não quebram a experiência do usuário.

## Deploy

**Nenhum deploy foi realizado nesta entrega.** Não fazer deploy (Vercel ou qualquer outro provedor) sem confirmação explícita do cliente/usuário — em especial porque `LINK_INFINITEPAY`, `metadataBase` e os links de redes sociais ainda são placeholders, e um deploy prematuro exporia essas URLs falsas publicamente.

## Módulo 2 (lembrete)

O **Dashboard do Organizador** (autenticação, Supabase, webhook do InfinitePay, check-in, relatórios) foi **deliberadamente deixado fora do escopo** desta entrega, por decisão conjunta com o cliente. Deve ser tratado como um projeto/spec separado, iniciado somente após a validação desta landing page. Os nomes de campo e valores de enum do formulário de inscrição (`modalidade: 'caminhada_3km' | 'corrida_6km'`, `tamanhoCamisa: 'P'|'M'|'G'|'GG'|'XG'`) já foram definidos pensando em compatibilidade direta com a futura tabela `inscricoes` no Supabase — não renomear esses campos sem atualizar ambos os lados.

## Decisões técnicas relevantes

- **Tailwind CSS v3** foi forçado no scaffold (em vez do v4 padrão do `create-next-app` atual), para manter o formato clássico de `tailwind.config.ts` especificado no plano.
- **Hidratação segura para dados dependentes de tempo** (contagem regressiva, status de lote): em vez do padrão comum `useState(false)` + `useEffect(() => setMounted(true), [])` — que dispara o lint `react-hooks/set-state-in-effect` — foi criado um hook compartilhado `useHydrated()` em `lib/utils.ts`, baseado em `useSyncExternalStore`, usado por `CountdownTimer.tsx` e `LoteCard.tsx`.
- **Status do lote e alvo da contagem regressiva nunca são estáticos**: são sempre recalculados no cliente (via `useEffect` + `getLoteStatus`/`getCountdownTarget`), para que a página não "congele" em "Lote 1 ativo" para sempre após a geração estática. `page.tsx` também define `export const revalidate = 3600` como reforço.
- **`images.dangerouslyAllowSVG: true`** foi adicionado em `next.config.ts` — necessário porque o Next.js bloqueia otimização de SVG por padrão, e a logo placeholder é um SVG local servido via `next/image`.
- **CPF validado com algoritmo real de dígito verificador (módulo 11)**, rejeitando sequências repetidas (`111.111.111-11` etc.), em `lib/validations.ts` — não é uma validação superficial de formato.
- **Rota `/api/inscricao`** usa `inscricaoSchema.safeParse()` (nunca `parse()` bruto nem cast `any`) sobre o corpo da requisição, retornando erros estruturados via `parsed.error.flatten()` em caso de falha de validação (HTTP 400).
- **Aviso de hydration mismatch** eventualmente visto no console do `next dev` (`clickup-chrome-ext_installed` na classe do `<body>`) foi investigado e confirmado como **falso positivo causado por uma extensão do Chrome** no ambiente local de teste, não um bug da aplicação.
