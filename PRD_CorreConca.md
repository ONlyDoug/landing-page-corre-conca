# PRD: Landing Page + Dashboard — Corre Conça

**Versão:** 2.0  
**Data:** 2026-07-06  
**Responsável:** Equipe de Desenvolvimento  
**Prazo de entrega:** Imediato (LP prioritária) + Dashboard em paralelo

---

## Resumo

Plataforma completa para a **1ª edição da Corrida Solidária Corre Conça** (06/09/2026 — Conceição da Feira, BA), composta por:

- **Landing Page pública:** conversão de visitantes em inscritos, checkout via InfinitePay, dados gravados no Supabase
- **Dashboard privado `/dashboard`:** painel do organizador com gestão de inscrições, financeiro, check-in no dia e relatórios

---

## Contexto e Problema

**Público-alvo**
- Atleta: acessa a LP pelo WhatsApp/Instagram, se inscreve e paga
- Organizador: precisa saber quem pagou, quem não pagou, fazer check-in no dia e ver quanto arrecadou

**Onde será implantado**
- Domínio provisório gratuito (Vercel)
- Banco de dados: Supabase (free tier)

**Problemas a resolver**
- Inscrições descentralizadas sem controle
- Sem visibilidade de pagamentos confirmados vs pendentes
- Check-in no dia sem sistema → filas e confusão
- Sem relatório financeiro do evento

---

## Objetivos e Métricas

| Objetivo | Métrica | Meta |
|---|---|---|
| Converter visitantes em inscritos | Taxa de conversão CTA → inscrição concluída | ≥ 30% |
| Controle total de inscrições | % de inscrições com status de pagamento atualizado | 100% |
| Check-in ágil no dia | Tempo médio de check-in por atleta | < 10 segundos |
| Visibilidade financeira | Relatório disponível em tempo real | Sim |

---

## Escopo

**Incluso**
- Landing page completa (single page, Next.js/React)
- Formulário de inscrição gravando no Supabase
- Integração InfinitePay via webhook para atualizar status de pagamento
- Contador regressivo (virada de lote 23/07 / evento 06/09)
- Lotes: Lote 1 R$25 + 2kg alimento | Lote 2 R$40 + 2kg alimento
- Geração de QR Code único por inscrição (para check-in)
- Dashboard privado `/dashboard` com autenticação (Supabase Auth)
- Dashboard: lista de inscritos com filtros
- Dashboard: painel financeiro (arrecadado, pendente, por modalidade)
- Dashboard: check-in (busca por nome/CPF + leitura de QR Code em mobile)
- Dashboard: exportação CSV dos inscritos
- Dashboard: relatório pós-evento
- Responsivo mobile-first (LP e Dashboard)
- Deploy na Vercel

**Fora de escopo**
- Área logada para o atleta
- Múltiplos administradores / níveis de acesso
- Integração com plataformas de resultado pós-evento
- Galeria de fotos
- CMS / blog
- App nativo (PWA é suficiente para check-in mobile)

---

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                    VERCEL (Next.js)                  │
│                                                      │
│  / (LP pública)          /dashboard (privado)        │
│  ├─ Hero                 ├─ Login (Supabase Auth)    │
│  ├─ Seções informativas  ├─ Inscritos (tabela)       │
│  ├─ Lotes & Preços       ├─ Financeiro               │
│  └─ Formulário ──────────├─ Check-in                 │
│       │                  └─ Relatórios / Export      │
│       │ POST /api/inscricao                          │
│       ▼                                              │
│  API Routes (Next.js)                                │
│  ├─ /api/inscricao    → grava no Supabase            │
│  ├─ /api/webhook      → recebe InfinitePay           │
│  └─ /api/checkin      → atualiza presença            │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
          ┌────────────────────────┐
          │      SUPABASE          │
          │  ├─ tabela: inscricoes │
          │  ├─ tabela: pagamentos │
          │  └─ Auth (organizador) │
          └────────────────────────┘
                       ▲
          InfinitePay webhook (POST)
```

**Stack completa**
- Framework: Next.js 14+ (App Router)
- Estilização: Tailwind CSS
- Animações: Framer Motion
- Formulário: React Hook Form + Zod
- Banco: Supabase (PostgreSQL)
- Auth: Supabase Auth (e-mail + senha, 1 usuário)
- QR Code: `qrcode` (geração) + `html5-qrcode` (leitura mobile)
- Tabelas do dashboard: TanStack Table
- Gráficos: Recharts
- Export CSV: `papaparse`
- Deploy: Vercel

---

## Schema do Banco de Dados (Supabase)

```sql
-- Tabela principal de inscrições
CREATE TABLE inscricoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  cidade TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  telefone TEXT NOT NULL,
  tamanho_camisa TEXT NOT NULL CHECK (tamanho_camisa IN ('P','M','G','GG','XG')),
  modalidade TEXT NOT NULL CHECK (modalidade IN ('caminhada_3km','corrida_6km')),
  lote INTEGER NOT NULL CHECK (lote IN (1,2)),
  valor_pago NUMERIC(10,2) NOT NULL,
  status_pagamento TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status_pagamento IN ('pendente','confirmado','cancelado')),
  qr_code_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  presenca_confirmada BOOLEAN DEFAULT FALSE,
  checkin_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de log de pagamentos (webhook InfinitePay)
CREATE TABLE pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inscricao_id UUID REFERENCES inscricoes(id),
  infinitepay_id TEXT,
  status TEXT NOT NULL,
  valor NUMERIC(10,2),
  payload JSONB,
  recebido_em TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: somente usuários autenticados leem/escrevem
ALTER TABLE inscricoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
```

---

## Requisitos Funcionais

### RF01 — Hero + Countdown
(sem alteração da v1.0)

---

### RF02 — Formulário de Inscrição com Supabase
Formulário captura dados do atleta, grava no Supabase e redireciona ao pagamento.

**Fluxo principal**
1. Atleta preenche e valida o formulário
2. POST `/api/inscricao` grava registro no Supabase com `status_pagamento: 'pendente'`
3. Supabase gera `qr_code_token` único automaticamente
4. API retorna o link de pagamento InfinitePay com `referencia=inscricao.id`
5. Atleta é redirecionado ao checkout InfinitePay
6. Modal de sucesso exibe: "Finalize o pagamento para confirmar sua vaga"

**Prioridade:** Alta

---

### RF03 — Webhook InfinitePay → Atualização de Pagamento
Endpoint que recebe notificações da InfinitePay e atualiza o status no Supabase.

**Fluxo principal**
1. InfinitePay envia POST para `/api/webhook/infinitepay`
2. API valida a assinatura/token do webhook
3. Identifica a inscrição pela `referencia` (inscricao.id)
4. Atualiza `status_pagamento` para `'confirmado'` ou `'cancelado'`
5. Grava log na tabela `pagamentos`

**Prioridade:** Alta

---

### RF04 — Dashboard: Autenticação
Rota `/dashboard` protegida por Supabase Auth (e-mail + senha).

**Fluxo principal**
1. Organizador acessa `/dashboard`
2. Middleware Next.js verifica sessão Supabase
3. Se não autenticado: redireciona para `/login`
4. Credenciais criadas manualmente no painel Supabase (1 usuário)

**Prioridade:** Alta

---

### RF05 — Dashboard: Gestão de Inscrições
Tabela completa de inscritos com filtros e busca.

**Colunas:** Nome, CPF (mascarado), Cidade, Modalidade, Lote, Valor, Status Pagamento, Presença, Data Inscrição

**Filtros:**
- Status pagamento: Todos | Confirmado | Pendente | Cancelado
- Modalidade: Todos | Caminhada 3KM | Corrida 6KM
- Presença: Todos | Presente | Ausente
- Busca livre: nome ou CPF

**Ações por linha:**
- Confirmar pagamento manualmente (botão)
- Cancelar inscrição
- Ver QR Code do atleta

**Prioridade:** Alta

---

### RF06 — Dashboard: Painel Financeiro
Visão consolidada da arrecadação do evento.

**Cards de resumo:**
- Total arrecadado (pagamentos confirmados)
- Total pendente
- Total de inscritos
- Inscritos por modalidade (Caminhada / Corrida)
- Inscritos por lote (Lote 1 / Lote 2)

**Gráfico:** barras de inscrições por dia (evolução temporal)

**Prioridade:** Média

---

### RF07 — Dashboard: Check-in no Dia do Evento
Tela otimizada para mobile, usada no dia 06/09 na largada.

**Modo 1 — Busca manual:**
1. Organizador digita nome ou CPF
2. Sistema exibe o atleta encontrado com foto do status
3. Botão "Confirmar Presença" atualiza `presenca_confirmada = true` e registra `checkin_em`

**Modo 2 — Leitura de QR Code:**
1. Organizador abre câmera do celular via browser
2. Aponta para o QR Code do atleta (impresso no número de peito ou no celular do atleta)
3. Sistema identifica o `qr_code_token`, exibe dados do atleta
4. Um toque confirma presença

**Estados visuais:**
- Verde: pagamento confirmado → pode fazer check-in
- Amarelo: pagamento pendente → alertar organizador
- Vermelho: cancelado → não permitir entrada
- Azul: já fez check-in → "Atleta já registrado às HH:MM"

**Prioridade:** Alta

---

### RF08 — Dashboard: Exportação e Relatório
Exportação de dados e relatório final do evento.

**Exportar CSV:** todos os inscritos com todos os campos (exceto CPF completo — mascarado)

**Relatório pós-evento (gerado após o evento):**
- Total de inscritos vs presentes
- % de presença por modalidade
- Arrecadação total confirmada
- Atletas ausentes (não fizeram check-in)

**Prioridade:** Média

---

## Requisitos Não Funcionais

**Performance**
- LP: LCP < 2.5s em 4G, Lighthouse mobile ≥ 80
- Dashboard: carregamento da tabela de inscritos < 1s (até 500 registros — suficiente para o evento)

**Segurança**
- Webhook InfinitePay validado por token secreto (env var)
- Dashboard acessível somente via Supabase Auth
- RLS ativo no Supabase (Row Level Security)
- CPF nunca exibido completo no dashboard (mascarado: `***.***.***-00`)
- HTTPS via Vercel (automático)

**Disponibilidade**
- Vercel + Supabase free tier: suficiente para o volume esperado (< 500 inscrições)

**Responsividade**
- LP: mobile-first, 375px / 768px / 1280px
- Dashboard: funcional em desktop; tela de check-in otimizada para mobile (375px)

**Acessibilidade**
- WCAG AA nos componentes públicos (LP)
- Dashboard: contraste adequado, foco visível

---

## Itens Pendentes do Cliente

| Item | Impacto | Urgência |
|---|---|---|
| Link de pagamento InfinitePay | RF02 e RF03 — checkout não funciona sem | 🔴 Crítica |
| Webhook InfinitePay (configuração) | RF03 — status automático de pagamento | 🔴 Crítica |
| E-mail e senha do organizador (para criar conta Supabase Auth) | RF04 — login do dashboard | 🟡 Alta |
| Local e data de retirada dos kits | Conteúdo da LP | 🟢 Média |
| Valor das premiações em dinheiro | Conteúdo da LP | 🟢 Média |
| Links das redes sociais | Footer da LP | 🟢 Baixa |

---

## Riscos e Mitigação

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| InfinitePay sem suporte a webhook documentado | Média | Alto | Pesquisar documentação; fallback: confirmar pagamento manualmente no dashboard |
| QR Code no celular do atleta (sem impressão) | Baixa | Médio | Enviar QR por e-mail/WhatsApp após inscrição; modo de busca manual como fallback |
| Supabase free tier: limite de 500MB banco | Baixa | Baixo | Para < 500 inscrições é mais que suficiente |
| Organizador sem familiaridade com dashboard | Média | Médio | Dashboard simples, sem jargões técnicos; onboarding de 15 min via chamada |

---

## Critérios de Aceitação

**Landing Page**
- [ ] Formulário grava inscrição no Supabase com status `pendente`
- [ ] Redirecionamento ao checkout InfinitePay funciona
- [ ] QR Code token gerado automaticamente pelo banco

**Dashboard**
- [ ] `/dashboard` redireciona para `/login` se não autenticado
- [ ] Login com e-mail e senha funciona via Supabase Auth
- [ ] Tabela de inscritos carrega com dados reais do Supabase
- [ ] Filtros de status, modalidade e busca funcionam corretamente
- [ ] Confirmação manual de pagamento atualiza o status em tempo real
- [ ] Check-in por busca de nome/CPF funciona e registra timestamp
- [ ] Check-in por QR Code lê o token e confirma presença
- [ ] Estados visuais do check-in (verde/amarelo/vermelho/azul) corretos
- [ ] Painel financeiro exibe totais corretos
- [ ] Exportação CSV baixa arquivo com dados dos inscritos
- [ ] Webhook atualiza `status_pagamento` ao receber notificação InfinitePay

---

## Seções da Landing Page (inalteradas)

1. Hero — Logo, título, data, local, CTA + countdown
2. Sobre — Missão solidária
3. Modalidades — Cards Caminhada e Corrida
4. Premiação — Medalhas + pódio financeiro 6KM
5. Kit do Atleta
6. Lotes & Preços — Lote 1 (R$25) e Lote 2 (R$40)
7. Formulário de Inscrição → Supabase → InfinitePay
8. Regulamento — Accordion
9. FAQ — Accordion
10. Footer

## Rotas da Aplicação

| Rota | Tipo | Descrição |
|---|---|---|
| `/` | Pública | Landing page completa |
| `/login` | Pública | Login do organizador |
| `/dashboard` | Privada | Visão geral + inscritos |
| `/dashboard/financeiro` | Privada | Painel financeiro |
| `/dashboard/checkin` | Privada | Check-in no dia |
| `/dashboard/relatorios` | Privada | Exportação e relatório |
| `/api/inscricao` | API | Grava inscrição no Supabase |
| `/api/webhook/infinitepay` | API | Recebe notificações de pagamento |
| `/api/checkin` | API | Confirma presença por token QR |
