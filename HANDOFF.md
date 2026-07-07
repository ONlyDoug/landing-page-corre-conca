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

`LINK_INFINITEPAY` já aponta para o link real do checkout InfinitePay desde a Fase 7 (ver seção abaixo). Os links de redes sociais ainda são placeholders (`'#'`) — atualizá-los em `lib/constants.ts` assim que o cliente fornecer os valores reais, e fazer novo `vercel --prod` (ou apenas dar push, já que o deploy automático está ativo).

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

## Módulo 2 — Fase 8: Dashboard — Layout + Autenticação

Concluída em 2026-07-07. Painel do organizador em `/dashboard`, protegido por login (`/login`), com 1 único usuário — sem cadastro público, sem "esqueci minha senha", sem papéis/permissões (autenticado = acesso total). `/dashboard` mostra dados reais da tabela `inscricoes` (total de inscritos, confirmados, pendentes, valor arrecadado, últimas 10 inscrições).

**Correções feitas em cima da especificação original** (o plano assumia Next.js 14 e alguns detalhes desatualizados; todas verificadas contra o estado real do repo/infra antes de implementar):
- **`cookies()` assíncrono**: desde o Next 15, `cookies()` de `next/headers` retorna `Promise` — `lib/supabase/auth-server.ts` e seus call sites (`app/dashboard/layout.tsx`, `app/dashboard/actions.ts`) usam `await cookies()` / `await createAuthClient()`.
- **`middleware.ts` → `proxy.ts`**: no Next.js 16, a convenção `middleware` foi renomeada para `proxy` (função `middleware` → `proxy`); `middleware.ts` gerava warning de depreciação no build. O arquivo do projeto é `proxy.ts`, exportando `proxy()` e `config.matcher`.
- **`getUser()` em vez de `getSession()`** no proxy — `getSession()` confiaria no cookie sem revalidar contra o servidor do Supabase Auth; erro comum em exemplos de `@supabase/ssr` pela internet.
- **`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` não existiam na Vercel** (o plano assumia que a anon key já estava configurada — não estava). Foram adicionadas via `vercel env add` em Production + Preview, e a `NEXT_PUBLIC_SUPABASE_URL` também foi criada do zero (necessária porque o client de browser da página de login só lê env vars prefixadas com `NEXT_PUBLIC_`; `SUPABASE_URL`, sem prefixo, não chega ao bundle do navegador).
- **`lib/supabase/server.ts` exporta `supabaseAdmin`**, não `supabase` — usado sem alterações em `app/dashboard/page.tsx` para as queries (service role, bypassa RLS, mesmo padrão já usado em `/api/inscricao`).

**Dois clients Supabase distintos coexistem, por design**: `lib/supabase/server.ts` (service role, bypassa RLS, exclusivo para código server-side que precisa gravar/ler sem restrição — `/api/inscricao` e as queries de `app/dashboard/page.tsx`) e `lib/supabase/auth-server.ts` (anon key + cookies de sessão via `@supabase/ssr`, exclusivo para checar autenticação — `proxy.ts` no edge/middleware e `app/dashboard/layout.tsx` no server). Nenhum dos dois foi usado fora do seu propósito. RLS em `inscricoes`/`pagamentos` continua sem policies (estado esperado, ver nota da Fase 6) — irrelevante aqui porque o dashboard lê sempre via `supabaseAdmin`.

**Delegação visual ao Antigravity**: o plano previa gerar o CSS das 3 telas (`app/login/page.tsx`, `app/dashboard/layout.tsx`, `app/dashboard/page.tsx`) via `/antigravity:delegate` com `--yolo` (grava arquivo diretamente). O classificador de segurança do Claude Code bloqueou essa chamada (job autônomo com escrita de arquivo sem aprovação explícita do usuário para esse flag específico). Como a especificação visual já estava totalmente detalhada nos prompts de delegação, a estilização foi aplicada diretamente por Claude (mesmo resultado, sem o passo de delegação).

**Token de marca `roxo`** (`tailwind.config.ts`, já existente desde o Módulo 1) foi usado em vez de `purple-*` cru do Tailwind, para consistência visual com a landing page.

**Usuário organizador**: criado via API Admin do Supabase (`POST /auth/v1/admin/users` com a service role key, `email_confirm: true`) — não há ferramenta MCP dedicada para criar usuário de auth diretamente. `auth.users` tinha 0 linhas antes (confirmado via SQL), então a criação foi segura sem risco de colisão. Exatamente 1 usuário existe hoje.

**Ajustes pós-teste manual** (usuário testou login no navegador e reportou 2 problemas, corrigidos na sequência):
- Logo do evento (`LOGO_PATH`, mesmo componente `next/image` usado no `Hero.tsx`) substituiu o texto "Corre Conça" no card de login.
- Inputs de e-mail/senha ficavam com texto ilegível (quase branco sobre fundo branco) em navegadores com preferência de tema escuro — causa: `app/globals.css` define `--foreground: #ededed` sob `@media (prefers-color-scheme: dark)`, e os inputs não tinham cor de texto própria, então herdavam essa variável do `body`. Corrigido com `text-gray-900 bg-white` explícitos nos dois campos.

**Testado**:
- `npx tsc --noEmit` e `npm run build` — 0 erros, 0 warnings.
- Redirecionamento `/dashboard` → `/login` sem sessão: confirmado via `curl -L`.
- Login com credenciais erradas/corretas: confirmado direto contra a API de Auth do Supabase (`invalid_credentials` vs. `access_token` válido) — a extensão Claude in Chrome não estava conectada nesta sessão, então a automação de navegador ponta a ponta (clique-a-clique) não foi possível; uma simulação de cookie de sessão via `curl` foi bloqueada pelo classificador de segurança do Claude Code por persistir um token de acesso vivo.
- **Teste manual em navegador real, feito pelo usuário**: login funcionando corretamente.

**Fora de escopo desta fase** (fica para depois): as rotas do menu lateral (`/dashboard/inscritos`, `/dashboard/financeiro`, `/dashboard/checkin`, `/dashboard/relatorios`) existem como links no `navLinks` de `app/dashboard/layout.tsx`, mas as páginas em si ainda não foram criadas — vão dar 404 se clicadas. Webhook do InfinitePay e API de check-in ficaram para a Fase 7 (ver seção abaixo) — as páginas do dashboard que os consomem continuam pendentes.

## Módulo 2 — Fase 7: Webhook InfinitePay + API Check-in

Concluída em 2026-07-07. Fecha o ciclo financeiro: `app/api/webhook/infinitepay/route.ts` (novo) recebe a notificação de pagamento da InfinitePay, e `app/api/checkin/route.ts` (novo) dá ao dashboard autenticado uma forma de confirmar presença no dia do evento.

**Confirmado antes de implementar**: `linkPagamento` devolvido por `/api/inscricao` já era (e continua sendo) o link fixo `LINK_INFINITEPAY`, sem nenhuma query string com o id da inscrição — não existia em nenhum lugar do repo um mecanismo para embutir `order_nsu` na URL de checkout. `/api/inscricao/route.ts` **não foi alterado** por causa disso.

**Decisão de arquitetura — Opção A (link fixo, sem vínculo automático garantido)**: o checkout InfinitePay em uso é um link fixo do painel (`https://checkout.infinitepay.io/delso-palmeira-de/OcZUhPRkf8`), não a API de criação dinâmica de links (que exigiria credenciais de API que não temos). Por isso o webhook não pode confiar que `order_nsu` sempre vai corresponder a uma inscrição real — a estratégia adotada foi: gravar um log completo de auditoria em `pagamentos` **sempre**, e só promover `inscricoes.status_pagamento` para `'confirmado'` quando `order_nsu` bater com um UUID que exista de fato na tabela `inscricoes`. Quando não bater (caso mais provável com o link fixo), o pagamento fica registrado para conferência manual do organizador pelo dashboard. Upgrade natural para o futuro: Opção B (gerar o link dinamicamente via `POST https://api.checkout.infinitepay.io/links` com `order_nsu = inscricao.id`), quando houver credenciais de API da InfinitePay.

**Sem autenticação por header no webhook**: confirmado que a InfinitePay não envia secret/token — a segurança vem do log de auditoria completo + validação de UUID + **verificação de valor** antes de qualquer escrita em `inscricoes`. `paid_amount` chega em centavos (`/100` antes de gravar em `pagamentos.valor`). Todas as chamadas ao Supabase tratam seu próprio erro localmente (`console.error`), sem interromper o fluxo — a rota sempre responde `200 { received: true }` no final (exceto JSON malformado, `400`), como a InfinitePay exige (resposta em menos de 1s; só operações simples de insert/select/update de uma linha antes do retorno).

**Verificação de valor adicionada após review de segurança**: `status_pagamento` só vira `'confirmado'` quando `paid_amount / 100` (valor recebido) for `>= inscricoes.valor_pago` (valor esperado, calculado no servidor pela Fase 6 — nunca confiado do cliente). Um `order_nsu` válido com valor insuficiente ainda é logado e vinculado à inscrição em `pagamentos.inscricao_id` (para conferência manual do organizador), mas não confirma o pagamento sozinho. Testado manualmente: valor abaixo do esperado → mantém `'pendente'`; valor igual/maior → confirma. **Limitação aceita e não resolvida**: como a InfinitePay não expõe um secret de webhook (confirmado na documentação real do produto) e o link de checkout é fixo (Opção A — nenhum código nosso controla o `order_nsu` que a InfinitePay vai mandar), a única defesa contra uma chamada forjada para `/api/webhook/infinitepay` é o atacante não conhecer um `id` de inscrição válido — esse `id` nunca é exposto pela API (`/api/inscricao` só devolve `qrCodeToken`, não o `id`) nem pela UI pública, mas não há verificação server-to-server contra a InfinitePay confirmando que o pagamento realmente aconteceu. Upgrade futuro (junto com a Opção B): validar a autenticidade via consulta server-to-server ao `invoice_slug` na API da InfinitePay antes de confirmar, assim que houver credenciais de API.

**Check-in exige sessão autenticada**: `app/api/checkin/route.ts` usa `createAuthClient()` (`lib/supabase/auth-server.ts`, Fase 8) para `auth.getUser()` antes de qualquer leitura — sem usuário, `401` imediato, sem vazar se o token existe ou não. A busca/gravação em si usa `supabaseAdmin` (service role), mesmo padrão do resto do projeto. Se `presenca_confirmada` já era `true`, a rota não reescreve nada e devolve `jaRegistrado: true`. Pagamento `'pendente'`/`'cancelado'` não bloqueia o check-in — o organizador decide no campo — mas a resposta inclui um `alerta` para ele ver isso na tela.

**RLS policies adicionadas nesta fase** (projeto `bhnyvplhmopcbobkfrpy`, migração `add_authenticated_rls_policies`): SELECT/UPDATE em `inscricoes` e SELECT/INSERT em `pagamentos` para o role `authenticated`, todas `USING (true)`/`WITH CHECK (true)` — ficaram pendentes desde a Fase 6 porque não havia autenticação até a Fase 8. `get_advisors` aponta `rls_policy_always_true` nas duas novas policies de escrita — esperado e intencional (mesma política de "1 usuário organizador, autenticado = acesso total" já documentada na Fase 8), não uma regressão. Nota: `/api/webhook/infinitepay` e `/api/checkin` usam `supabaseAdmin` (bypassa RLS), então essas policies não protegem essas duas rotas — elas preparam terreno para o dia em que alguma tela do dashboard consultar diretamente com a anon key + sessão do usuário no browser.

**Testado**: `npx tsc --noEmit` e `npm run build` — 0 erros. `curl` manual: JSON inválido no webhook → `400`; payload válido → `200 { received: true }`; `GET` na rota do webhook → `405` (comportamento automático do Next.js App Router para métodos não exportados, não precisou de código manual); check-in sem sessão → `401`.

**Fora de escopo desta fase**: as páginas `/dashboard/checkin` e `/dashboard/financeiro` (menu já linkado desde a Fase 8) continuam não implementadas — esta fase entregou só o backend que elas vão consumir. Endurecimento de concorrência (retry duplicado de webhook, corrida entre dois check-ins simultâneos do mesmo QR) foi avaliado e considerado aceitável para o volume do evento; ver comentário de riscos no plano desta fase se precisar revisitar.

## Módulo 2 (lembrete)

O **Dashboard do Organizador** (autenticação, webhook do InfinitePay, check-in, relatórios) segue sendo construído de forma incremental por fase (ver seções acima para Fase 6 e Fase 8). Os nomes de campo e valores de enum do formulário de inscrição (`modalidade: 'caminhada_3km' | 'corrida_6km'`, `tamanhoCamisa: 'P'|'M'|'G'|'GG'|'XG'`) foram definidos pensando em compatibilidade direta com a tabela `inscricoes` no Supabase — não renomear esses campos sem atualizar ambos os lados.

## Decisões técnicas relevantes

- **Tailwind CSS v3** foi forçado no scaffold (em vez do v4 padrão do `create-next-app` atual), para manter o formato clássico de `tailwind.config.ts` especificado no plano.
- **Hidratação segura para dados dependentes de tempo** (contagem regressiva, status de lote): em vez do padrão comum `useState(false)` + `useEffect(() => setMounted(true), [])` — que dispara o lint `react-hooks/set-state-in-effect` — foi criado um hook compartilhado `useHydrated()` (`lib/useHydrated.ts`, separado de `lib/utils.ts` desde a Fase 6 para não puxar `useSyncExternalStore` para dentro de Server Components), baseado em `useSyncExternalStore`, usado por `CountdownTimer.tsx` e `LoteCard.tsx`.
- **Status do lote e alvo da contagem regressiva nunca são estáticos**: são sempre recalculados no cliente (via `useEffect` + `getLoteStatus`/`getCountdownTarget`), para que a página não "congele" em "Lote 1 ativo" para sempre após a geração estática. `page.tsx` também define `export const revalidate = 3600` como reforço.
- **`images.dangerouslyAllowSVG: true`** foi adicionado em `next.config.ts` — necessário porque o Next.js bloqueia otimização de SVG por padrão, e a logo placeholder é um SVG local servido via `next/image`.
- **CPF validado com algoritmo real de dígito verificador (módulo 11)**, rejeitando sequências repetidas (`111.111.111-11` etc.), em `lib/validations.ts` — não é uma validação superficial de formato.
- **Rota `/api/inscricao`** usa `inscricaoSchema.safeParse()` (nunca `parse()` bruto nem cast `any`) sobre o corpo da requisição, retornando erros estruturados via `parsed.error.flatten()` em caso de falha de validação (HTTP 400).
- **Aviso de hydration mismatch** eventualmente visto no console do `next dev` (`clickup-chrome-ext_installed` na classe do `<body>`) foi investigado e confirmado como **falso positivo causado por uma extensão do Chrome** no ambiente local de teste, não um bug da aplicação.
