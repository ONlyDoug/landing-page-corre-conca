# HANDOFF — Landing Page Corre Conça (Módulo 1)

Este documento registra o estado da entrega da **Landing Page** (Módulo 1) da 1ª Corrida Solidária Corre Conça, o que ainda depende de informação do cliente, e decisões técnicas relevantes para quem continuar o projeto (incluindo o Módulo 2 — Dashboard do Organizador).

## Status

Módulo 1 (Landing Page) **completo, verificado e em produção**: https://landing-page-corre-conca.vercel.app (ver seção "Deploy" abaixo).

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
| Links reais de redes sociais (Instagram/WhatsApp) | `lib/constants.ts` → `REDES_SOCIAIS` | `{ instagram: '#', whatsapp: '#' }` |
| Nome real da organização realizadora | `lib/constants.ts` → `ORGANIZACAO_REALIZACAO` | `'Organização a definir'` |
| Local e data de retirada do kit | `lib/constants.ts` → `KIT_NOTA`, `FAQ_ITEMS`, `REGULAMENTO_ITEMS` | "Data e local a confirmar" |
| Valor da premiação em dinheiro (pódio 6KM) | `lib/constants.ts` → `PREMIACAO.podio6km` | "valor a anunciar" |
| Domínio próprio (se houver) — hoje usa o domínio da Vercel | `app/layout.tsx` → `metadataBase` | `https://landing-page-corre-conca.vercel.app` |
| Ícone de Instagram | `components/sections/Footer.tsx` | Substituído por `Camera` (lucide-react) + `aria-label="Instagram do Corre Conça"`, pois `lucide-react@1.23.0` removeu todos os ícones de marca. Trocar por um SVG de marca real quando possível. |

Nenhuma dessas pendências bloqueia o funcionamento da página — todas têm um valor de fallback sensato e visível apenas no código-fonte/atributos, não quebram a experiência do usuário.

## Deploy

**Site em produção**: https://landing-page-corre-conca.vercel.app (Vercel, projeto `dougs-projects-9c166f33/landing-page-corre-conca`, conectado ao repositório GitHub `ONlyDoug/landing-page-corre-conca` — cada push em `main` gera um novo deploy automaticamente).

`LINK_INFINITEPAY` e os links de redes sociais ainda são placeholders (`'#'`) — atualizá-los em `lib/constants.ts` assim que o cliente fornecer os valores reais, e fazer novo `vercel --prod` (ou apenas dar push, já que o deploy automático está ativo).

## Módulo 2 — Fase 6: Infraestrutura Supabase + Integração Real com `/api/inscricao`

Concluída em 2026-07-07. `/api/inscricao` agora grava de verdade no Supabase (RF02 completo): valida com `inscricaoSchema`, converte e valida `dataNascimento` (`parseDataNascimentoISO` em `lib/validations.ts`), calcula lote/valor vigente no servidor (`getLoteAtivo` em `lib/utils.ts`, nunca confiando em valor enviado pelo cliente), normaliza CPF para dígitos antes de gravar, e retorna `{ success, qrCodeToken, linkPagamento }`.

**Projeto Supabase**: `corre-conca` (ref `bhnyvplhmopcbobkfrpy`, região `us-west-1`). Nota: o plano original previa criar o projeto em `sa-east-1` (menor latência, evento é na Bahia); esse projeto específico já existia (vazio) quando a criação foi tentada — provavelmente criado sem querer por um agente de planejamento anterior que tinha acesso às mesmas ferramentas MCP apesar de instruído a não executar nada. Foi reaproveitado em vez de duplicado, com o dono do projeto avisado. Se a latência de `us-west-1` incomodar no dashboard (Fase 8+), vale recriar em `sa-east-1`.

**Schema**: tabelas `inscricoes` e `pagamentos` conforme `PRD_CorreConca.md`, com `ENABLE ROW LEVEL SECURITY` nas duas (migração `create_inscricoes_pagamentos`). Duas adições não previstas no PRD, ambas não-destrutivas:
- Trigger `trg_inscricoes_atualizado_em` (`BEFORE UPDATE`) — sem ele, `atualizado_em` nunca reflete updates feitos nas Fases 7/8.
- Índice `idx_pagamentos_inscricao_id` — chave estrangeira não é indexada automaticamente pelo Postgres.
- Uma correção de segurança aplicada via advisor: `search_path` fixado na função `set_atualizado_em()` (migração `fix_set_atualizado_em_search_path`), evitando risco de search_path hijacking.

**RLS sem policies é esperado nesta fase**: `get_advisors` aponta `rls_enabled_no_policy` em ambas as tabelas — correto, pois não há usuário autenticado até a Fase 8. A rota grava usando a **service role key** (bypassa RLS), nunca a chave anônima; o client (`lib/supabase/server.ts`) só é importado por código server-side (a rota de API), nunca por componentes `"use client"`.

**Variáveis de ambiente** (nunca prefixadas com `NEXT_PUBLIC_`, pois nada roda no browser ainda): `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`, em `.env.local` (não commitado) e replicadas na Vercel (Production + Preview). `.env.example` documenta as chaves sem valores reais. Em `lib/supabase/server.ts`, o client é instanciado via um Proxy lazy (só chama `createClient` no primeiro uso real) — sem isso, `next build` falha ao "coletar dados da página" da rota em ambientes sem as variáveis configuradas.

**Detalhe de arquitetura descoberto durante a implementação**: `lib/utils.ts` tinha o hook `useHydrated()` (usa `useSyncExternalStore`, só funciona em Client Components) misturado com funções puras (`getLoteStatus`, `getLoteAtivo`, máscaras). Como `/api/inscricao` (Server Component/Route) passou a importar `getLoteAtivo` do mesmo arquivo, o build quebrava. `useHydrated` foi extraído para `lib/useHydrated.ts`; `CountdownTimer.tsx` foi o único ponto de import atualizado.

**Testado manualmente** (curl contra `localhost:3000`, depois limpo do banco): inscrição válida → `200` com `qrCodeToken`; mesmo CPF de novo → `409` com mensagem amigável; `dataNascimento` inválida (`31/02/2026`) → `400` em `fieldErrors.dataNascimento`. Registro conferido via SQL: CPF gravado sem máscara, `data_nascimento` em formato `DATE` real, `lote`/`valor_pago` corretos, `status_pagamento = 'pendente'`.

**Fora de escopo desta fase** (fica para depois): `components/sections/Formulario.tsx` não foi alterado — ainda mostra erro genérico mesmo para CPF duplicado (só checa `result.success` booleano); considerar exibir a mensagem específica do backend como follow-up. Webhook real do InfinitePay (Fase 7, aguarda credenciais do cliente — `LINK_INFINITEPAY` continua `'#'`). Autenticação/dashboard/policies de RLS (Fase 8+).

## Módulo 2 (lembrete)

O **Dashboard do Organizador** (autenticação, webhook do InfinitePay, check-in, relatórios) segue sendo construído de forma incremental por fase (ver seção acima para a Fase 6). Os nomes de campo e valores de enum do formulário de inscrição (`modalidade: 'caminhada_3km' | 'corrida_6km'`, `tamanhoCamisa: 'P'|'M'|'G'|'GG'|'XG'`) foram definidos pensando em compatibilidade direta com a tabela `inscricoes` no Supabase — não renomear esses campos sem atualizar ambos os lados.

## Decisões técnicas relevantes

- **Tailwind CSS v3** foi forçado no scaffold (em vez do v4 padrão do `create-next-app` atual), para manter o formato clássico de `tailwind.config.ts` especificado no plano.
- **Hidratação segura para dados dependentes de tempo** (contagem regressiva, status de lote): em vez do padrão comum `useState(false)` + `useEffect(() => setMounted(true), [])` — que dispara o lint `react-hooks/set-state-in-effect` — foi criado um hook compartilhado `useHydrated()` (`lib/useHydrated.ts`, separado de `lib/utils.ts` desde a Fase 6 para não puxar `useSyncExternalStore` para dentro de Server Components), baseado em `useSyncExternalStore`, usado por `CountdownTimer.tsx` e `LoteCard.tsx`.
- **Status do lote e alvo da contagem regressiva nunca são estáticos**: são sempre recalculados no cliente (via `useEffect` + `getLoteStatus`/`getCountdownTarget`), para que a página não "congele" em "Lote 1 ativo" para sempre após a geração estática. `page.tsx` também define `export const revalidate = 3600` como reforço.
- **`images.dangerouslyAllowSVG: true`** foi adicionado em `next.config.ts` — necessário porque o Next.js bloqueia otimização de SVG por padrão, e a logo placeholder é um SVG local servido via `next/image`.
- **CPF validado com algoritmo real de dígito verificador (módulo 11)**, rejeitando sequências repetidas (`111.111.111-11` etc.), em `lib/validations.ts` — não é uma validação superficial de formato.
- **Rota `/api/inscricao`** usa `inscricaoSchema.safeParse()` (nunca `parse()` bruto nem cast `any`) sobre o corpo da requisição, retornando erros estruturados via `parsed.error.flatten()` em caso de falha de validação (HTTP 400).
- **Aviso de hydration mismatch** eventualmente visto no console do `next dev` (`clickup-chrome-ext_installed` na classe do `<body>`) foi investigado e confirmado como **falso positivo causado por uma extensão do Chrome** no ambiente local de teste, não um bug da aplicação.
