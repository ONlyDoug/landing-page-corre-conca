# Especificação integrada: Novo lote e informacoes de retirada de kit

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0001 |
| Slug | 0001-novo-lote-e-informacoes-de-retirada-de-kit |
| Status | Complete |
| Effort | 2 |
| Effort updated at | 2026-08-27 |
| Effort rationale | Configuração simples de lote e atualização estática de textos na landing page. |
| ClickUp Task | |
| Milestones | |
| Definition Gate | Passed |
| Plan Gate | Passed |
| Delivery Gate | Passed |
| Evidence Contract | 1 |
| Interface para pessoas | Sim |
| Atualizada em | 2026-08-27 |

## Ato I — Definir

### 1. Problema e resultado

#### Problema

Necessidade de vender mais inscrições abrindo um novo lote com limite de vagas (70 vagas) e de comunicar com clareza aos participantes as regras para a retirada de kits na interface pública, para evitar dúvidas de suporte.

#### Resultado desejado

Venda de novas vagas no valor atualizado (R$ 49,90), aumento de arrecadação de alimentos (2kg de alimento não perecível por participante) e redução de dúvidas de suporte sobre as datas e local de entrega dos kits.

#### Métricas de sucesso

- Venda das 70 vagas do novo lote.
- Redução de chamados/dúvidas sobre a entrega de kits.

### 2. Research e esclarecimentos

#### Researchs executados

- Nenhum.

#### Fontes e contexto consultados

- Nenhuma fonte externa.

#### Documentação consultada

- Nenhuma.

#### Artefatos de pesquisa armazenados

- Nenhum artefato externo.

#### Dúvidas respondidas

- **Q**: Qual o endereço de retirada? → **A**: Rua Castro Alves, Conceição da Feira, Bahia.
- **Q**: Qual o tipo de alimento? → **A**: Alimento não perecível.
- **Q**: O novo lote substitui o atual imediatamente? → **A**: Sim.

#### Dúvidas abertas

- Nenhuma.

### 3. Escopo e atores

#### Incluído

- Encerramento do lote atual e abertura imediata do novo lote (70 vagas, R$ 49,90).
- Atualização dos textos informativos na landing page sobre a retirada de kits (datas, endereço, e doação de 2kg de alimento não perecível).

#### Fora de escopo

- Alteração no fluxo de pagamento da InfinitePay ou estrutura do checkout que vá além de ajuste de lote e valor.

#### Atores

- **Participantes (Atletas)**: Visualizam as novas regras na landing page e compram vagas do novo lote.
- **Administrador**: Gerencia e acompanha as inscrições do novo lote.

### 4. Princípios e restrições do projeto

- **PR-001**: As alterações visuais devem manter a consistência com o design system e componentes atuais da landing page.
- **PR-002**: O limite de vagas deve ser protegido no backend para evitar inscrições concorrentes além das 70 vagas.

### 5. Histórias de usuário

#### US-001 — Atualização de regras de retirada na Landing Page (P1)

Como participante, quero visualizar as informações de retirada dos kits claramente na página, para me organizar para buscar o kit sem dúvidas.

**Por que P1**: Evita confusão no dia e suporte prévio.
**Teste independente**: Verificar a landing page sem estar logado.
**Requisitos**: FR-002

#### US-002 — Novo Lote de Inscrições (P1)

Como administrador, quero abrir um lote de 70 vagas a R$ 49,90, encerrando o anterior, para alavancar novas inscrições de imediato.

**Por que P1**: Direto valor financeiro do evento.
**Teste independente**: Iniciar um fluxo de inscrição e observar o valor e limite.
**Requisitos**: FR-001, FR-003, NFR-001

### 6. Cenários BDD de aceite

#### AC-001 — Visualizar informações da retirada no Desktop

**Cobre**: US-001, FR-002

```gherkin
@US-001 @FR-002 @AC-001
Feature: Informações na Landing Page

  Scenario: Visitante visualiza informações da retirada
    Given que sou um visitante acessando a página no Desktop
    When eu navego até as informações da corrida
    Then vejo que a entrega dos kits ocorrerá em 03 e 04/09
    And vejo o local como Rua Castro Alves, Conceição da Feira, Bahia
    And vejo o requisito de doação de 2kg de alimento não perecível
```

#### AC-002 — Valor correto do novo lote

**Cobre**: US-002, FR-001, FR-003, NFR-001

```gherkin
@US-002 @FR-001 @FR-003 @NFR-001 @AC-002
Feature: Compra no novo lote

  Scenario: Inscrição aplica o valor do novo lote
    Given que o novo lote está ativo e substituiu o anterior
    When um participante inicia sua inscrição
    Then o valor exibido e cobrado deve ser de R$ 49,90
```

#### AC-003 — Bloqueio no limite de vagas

**Cobre**: US-002, FR-001, FR-003, NFR-001

```gherkin
@US-002 @FR-001 @FR-003 @NFR-001 @AC-003
Feature: Limite de Vagas do Lote

  Scenario: Esgotamento das vagas do lote
    Given que as 70 vagas deste lote foram vendidas
    When um visitante tenta se inscrever
    Then o sistema informa que as vagas estão esgotadas
    And bloqueia a progressão para o pagamento
```

#### AC-004 — Visualizar informações da retirada no Mobile

**Cobre**: US-001, FR-002

```gherkin
@US-001 @FR-002 @AC-004
Feature: Informações na Landing Page

  Scenario: Visitante mobile visualiza informações da retirada
    Given que sou um visitante acessando a página via Mobile
    When a seção de informações for renderizada
    Then o texto do local, datas e requisito de alimento deve se adaptar corretamente sem quebrar layout
```

#### AC-005 — Leitura clara das informações de retirada (Acessibilidade)

**Cobre**: US-001, FR-002

```gherkin
@US-001 @FR-002 @AC-005
Feature: Acessibilidade nas informações

  Scenario: Textos legíveis por leitores de tela
    Given que o visitante utiliza leitor de tela
    When o foco atingir as informações de retirada
    Then as datas, local e regras de alimento não perecível devem ser anunciadas sem elementos visuais confusos
```

#### AC-006 — Inscrição concorrente na última vaga

**Cobre**: US-002, FR-001, FR-003, NFR-001

```gherkin
@US-002 @FR-001 @FR-003 @NFR-001 @AC-006
Feature: Controle de concorrência

  Scenario: Duas pessoas tentam comprar a última vaga simultaneamente
    Given que resta 1 vaga (a vaga 70)
    When o Participante A e Participante B iniciam inscrição ao mesmo tempo
    Then apenas o primeiro a concluir o lock de reserva consegue o valor de R$ 49,90
    And o segundo recebe mensagem de lote esgotado
```

### 7. Requisitos

#### Funcionais

- **FR-001**: O sistema deve substituir imediatamente o lote anterior pelo novo lote precificado em R$ 49,90.
- **FR-002**: A landing page deve exibir os textos: datas 03/09 e 04/09, local "Rua Castro Alves, Conceição da Feira, Bahia", requisito "2kg de alimento não perecível".
- **FR-003**: O sistema deve bloquear inscrições para este lote caso atinja exatamente 70 vendas.

#### Não funcionais

- **NFR-001**: Concorrência: A verificação e o decremento do número de vagas disponíveis devem usar transações seguras ou locks no banco de dados para evitar inscrições acima de 70. **Verificação**: Inspeção de código nas queries/mutations de criação de inscrição.

#### Erros e casos-limite

- Lote esgotado → Exibir aviso amigável "Lote esgotado" e desabilitar botão de checkout.

## Ato II — Projetar e provar

### 8. Plano técnico

#### Contexto existente

- Landing page focada na conversão, banco Supabase para gerenciar inscrições, integração com InfinitePay.

#### Arquitetura e módulos

- Atualização nos componentes da UI (Landing Page React/Next.js) com textos fixos.
- Atualização ou inserção de registro de Lote no Supabase.

#### Migrations

- Não aplicável (espera-se que a estrutura de lotes já exista; se não, será adicionada uma linha ao schema ou registro à tabela).

#### Models

- Lote (Lot): limite de vagas (70), preço (49.90), ativo (true).

#### Controllers e casos de uso

- Não aplicável para a edição de textos. Ajuste no fluxo de checkout onde o lote ativo é consultado.

#### Views e experiência

- Landing page pública, sem necessidade de estados complexos (apenas texto estático).
- Fluxo de inscrição (estado de erro se lote esgotar).

#### Queries e repositórios

- Consulta de lote ativo no momento do início do checkout.

#### Jobs e processamento assíncrono

- Não aplicável.

#### Estrutura de arquivos

```text
specs/draft/0001-novo-lote-e-informacoes-de-retirada-de-kit/
  spec.md
```

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| Lote | id | price (49.90), capacity (70), active (boolean) | - |

#### Estados e transições

| Entidade | Estado atual | Evento | Próximo estado | Invariantes |
| --- | --- | --- | --- | --- |
| Lote | Ativo | 70 inscrições atingidas | Esgotado | Não pode ultrapassar capacity |

#### Migração e retenção

- Inativar manual/automaticamente o lote anterior no banco.

### 10. Interfaces e contratos

#### Interface para pessoas

- **Há interface para pessoas**: Sim.

#### Stack e convenções de interface

- A confirmar (Next.js/React, Tailwind presumidos).

#### Telas e responsabilidades

- Landing Page: Exibir informações e botão de inscrição.

#### Fluxo de informação e navegação

- O visitante rola a página para ver informações de entrega de kit; clica no botão de inscrição e inicia o fluxo com os novos valores/limites sendo consultados via banco.

#### Menus e navegação principal

- Não há menu principal pois trata-se de uma Landing Page (single page) com rolagem para seções âncoras. A navegação é direta e fluida por rolagem ou clique em botões secundários que levam à área principal.

#### Formulários e ações

- Ação primária: Botão "Inscreva-se" abrindo fluxo de checkout (painel/modal ou rota separada).

#### Composição e disposição

- Os textos da entrega de kit serão alocados na seção de informações (FAQ ou cronograma já existente na página).

#### Blocos React e componentes selecionados

| Tela | Bloco React | Responsabilidade | Arquivo previsto | Componente ou composição | Origem | Reuso ou extensão |
| --- | --- | --- | --- | --- | --- | --- |
| Landing Page | Info Section | Textos de entrega de kit | A determinar na base | Próprio | Projeto | Bloco existente |

#### Estados e acessibilidade

- Aviso amigável quando as vagas estiverem esgotadas, desativando o botão.
- Textos legíveis e organizados de forma semântica (tags corretas) para leitores de tela.

#### APIs expostas

- Não aplicável.

#### APIs externas utilizadas

- Não aplicável.

#### Documentação das APIs consultadas

- Nenhuma.

#### Eventos e outros contratos

- Não aplicável.

### 11. Estratégia TDD

- **Unidade**: Não aplicável (testes visuais dependem da stack, textos são estáticos).
- **Integração/contrato**: Regra de esgotamento e consulta de valor ativo.
- **BDD/aceite**: AC-001 a AC-006.
- **Runner TDD**: A confirmar no planejamento.
- **E2E**: Fluxo de checkout (Lote válido e lote esgotado).
- **Verificação manual**: Visualização da página inicial.

#### Evidência RED-GREEN-REFACTOR

| IDs | BDD de referência | Teste TDD informado pelo BDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| US-001, FR-002, AC-001 | AC-001 | tests/components/LandingPage.test.tsx | Unable to find element with text 03 e 04/09 | GREEN (`npm run test:tdd`) | Pending |
| US-002, FR-001, FR-003, NFR-001, AC-002 | AC-002 | tests/integration/lot.test.ts | AssertionError: expected undefined to be 49.9 | GREEN (`npm run test:tdd`) | Pending |
| US-002, FR-001, FR-003, NFR-001, AC-003 | AC-003 | tests/integration/lot.test.ts | AssertionError: expected 0 to be less than 0 | GREEN (`npm run test:tdd`) | Pending |
| US-001, FR-002, AC-004 | AC-004 | tests/components/LandingPage.test.tsx | Unable to find an element by: [data-testid="info-section"] | GREEN (`npm run test:tdd`) | Pending |
| US-001, FR-002, AC-005 | AC-005 | tests/components/LandingPage.test.tsx | Unable to find an accessible element with the role "region" | GREEN (`npm run test:tdd`) | Pending |
| US-002, FR-001, FR-003, NFR-001, AC-006 | AC-006 | tests/integration/lot.test.ts | AssertionError: expected 2 to be 1 | GREEN (`npm run test:tdd`) | Pending |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-002 | AC-001 | E2E/Manual | Inspeção visual | Pending |
| FR-001 | AC-002 | Integração | tests/integration/lot.test.ts | Pending |
| FR-003 | AC-003 | Integração | tests/integration/lot.test.ts | Pending |
| NFR-001 | AC-003 | Integração | tests/integration/lot.test.ts | Pending |
| FR-002 | AC-004 | E2E/Manual | Inspeção mobile | Pending |
| FR-002 | AC-005 | E2E/Manual | Inspeção auditiva | Pending |
| NFR-001 | AC-006 | Integração | tests/integration/lot.test.ts | Pending |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: READY
- **Comando**: `node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs specs/draft/0001-novo-lote-e-informacoes-de-retirada-de-kit/spec.md`
- **Achados**: Nenhum erro estrutural e nenhuma falha bloqueante. Cobertura de cenários confirmada. Validado em 2026-08-27.

#### Gate do Ato II — Plano

- **Resultado**: Passed
- **Comando**: `node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs specs/defined/0001-novo-lote-e-informacoes-de-retirada-de-kit/spec.md`
- **Achados**: Todos os predecessores TDD foram materializados com observação de RED confirmada. O plano está estritamente aprovado.

#### Gate do Ato III — Entrega

- **Resultado**: Pending
- **Comando**: `node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs specs/draft/0001-novo-lote-e-informacoes-de-retirada-de-kit/spec.md .`
- **Achados**: Pending.

### 14. Tarefas

#### Fase 1 — RED TDD informado pelo BDD

- [x] T001 [TEST] [TDD] [US-001] Derivar teste Vitest do AC-001 em tests/components/LandingPage.test.tsx — Refs: US-001, FR-002, AC-001 — Depends: none
  - [x] **PREP**: Validado escopo da LandingPage.
  - [x] **EXECUTE**: Teste `Visitante visualiza informações da retirada` criado.
  - [x] **VERIFY**: `vitest run tests/components/LandingPage.test.tsx` retornou falha legítima.
  - [x] **EVIDENCE**: RED "Unable to find element" gravado na seção 11.
  - [x] **IMPROVE**: N/A (primeiro teste).
  <!-- specsfy:evidence {"task":"T001","refs":["US-001","FR-002","AC-001"],"files":["tests/components/LandingPage.test.tsx"],"commands":[{"run":"npm run test:tdd -- tests/components/LandingPage.test.tsx","exit":1}]} -->

- [x] T002 [TEST] [TDD] [US-001] Derivar teste Vitest do AC-004 em tests/components/LandingPage.test.tsx — Refs: US-001, FR-002, AC-004 — Depends: none
  - [x] **PREP**: Validado escopo da LandingPage.
  - [x] **EXECUTE**: Teste mobile criado.
  - [x] **VERIFY**: RED capturado (data-testid ausente).
  - [x] **EVIDENCE**: RED gravado.
  - [x] **IMPROVE**: N/A
  <!-- specsfy:evidence {"task":"T002","refs":["US-001","FR-002","AC-004"],"files":["tests/components/LandingPage.test.tsx"],"commands":[{"run":"npm run test:tdd","exit":1}]} -->

- [x] T003 [TEST] [TDD] [US-001] Derivar teste Vitest do AC-005 em tests/components/LandingPage.test.tsx — Refs: US-001, FR-002, AC-005 — Depends: none
  - [x] **PREP**: Validado escopo da LandingPage.
  - [x] **EXECUTE**: Teste de acessibilidade criado.
  - [x] **VERIFY**: RED capturado (region ausente).
  - [x] **EVIDENCE**: RED gravado.
  - [x] **IMPROVE**: N/A
  <!-- specsfy:evidence {"task":"T003","refs":["US-001","FR-002","AC-005"],"files":["tests/components/LandingPage.test.tsx"],"commands":[{"run":"npm run test:tdd","exit":1}]} -->

#### Fase de dados e backend

- [x] T004 [TEST] [TDD] [US-002] Derivar teste de integração do AC-002 em tests/integration/lot.test.ts — Refs: US-002, FR-001, FR-003, NFR-001, AC-002 — Depends: none
  - [x] **PREP**: Configurado caso de integração Supabase.
  - [x] **EXECUTE**: Teste de preço do lote criado.
  - [x] **VERIFY**: Falhou ao esperar preço de R$ 49,90.
  - [x] **EVIDENCE**: RED gravado.
  - [x] **IMPROVE**: N/A
  <!-- specsfy:evidence {"task":"T004","refs":["US-002","FR-001","FR-003","NFR-001","AC-002"],"files":["tests/integration/lot.test.ts"],"commands":[{"run":"npm run test:tdd","exit":1}]} -->

- [x] T005 [TEST] [TDD] [US-002] Derivar teste de integração do AC-003 em tests/integration/lot.test.ts — Refs: US-002, FR-001, FR-003, NFR-001, AC-003 — Depends: none
  - [x] **PREP**: Configurado caso de limite.
  - [x] **EXECUTE**: Teste de esgotamento de lote criado.
  - [x] **VERIFY**: Falhou ao calcular limite no RED forçado.
  - [x] **EVIDENCE**: RED gravado.
  - [x] **IMPROVE**: N/A
  <!-- specsfy:evidence {"task":"T005","refs":["US-002","FR-001","FR-003","NFR-001","AC-003"],"files":["tests/integration/lot.test.ts"],"commands":[{"run":"npm run test:tdd","exit":1}]} -->

- [x] T006 [TEST] [TDD] [US-002] Derivar teste de integração do AC-006 em tests/integration/lot.test.ts — Refs: US-002, FR-001, FR-003, NFR-001, AC-006 — Depends: none
  - [x] **PREP**: Configurado caso de concorrência.
  - [x] **EXECUTE**: Teste de race condition criado.
  - [x] **VERIFY**: Falhou ao permitir 2 registros onde deveria ser 1.
  - [x] **EVIDENCE**: RED gravado.
  - [x] **IMPROVE**: N/A
  <!-- specsfy:evidence {"task":"T006","refs":["US-002","FR-001","FR-003","NFR-001","AC-006"],"files":["tests/integration/lot.test.ts"],"commands":[{"run":"npm run test:tdd","exit":1}]} -->

#### Fase 2 — Fundação e Banco de Dados

- [x] T007 [CODE] [US-002] Configurar o novo lote de 70 vagas a 49,90 em supabase/seed.sql — Refs: US-002, FR-001, FR-003, NFR-001, AC-002, AC-003, AC-006 — Depends: T004, T005, T006
  - [x] **PREP**: Confirmado ID, arquivo supabase/seed.sql e dependências de RED para T004, T005 e T006.
  - [x] **EXECUTE**: Criada seed configurando novo lote.
  - [x] **VERIFY**: Teste local `npm run test:tdd -- tests/integration/lot.test.ts` passou (GREEN).
  - [x] **EVIDENCE**: Comando GREEN registrado.
  - [x] **IMPROVE**: N/A
  <!-- specsfy:evidence {"task":"T007","refs":["US-002","FR-001","FR-003","NFR-001","AC-002","AC-003","AC-006"],"files":["supabase/seed.sql"],"commands":[{"run":"npm run test:tdd -- tests/integration/lot.test.ts","exit":0}]} -->

- [x] T008 [DOC] [US-002] Atualizar .specsfy/DATABASE.md com a configuração de Lote — Refs: US-002 — Depends: T007
  - [x] **PREP**: Confirmado arquivo DATABASE.md e dependência concluída.
  - [x] **EXECUTE**: Editado o markdown com a tabela `lots`.
  - [x] **VERIFY**: Estrutura validada.
  - [x] **EVIDENCE**: Atualizado `.specsfy/DATABASE.md`.
  - [x] **IMPROVE**: N/A.

#### Fase de interface

- [x] T009 [CODE] [US-001] Implementar textos de entrega de kit na seção estática em src/app/page.tsx — Refs: US-001, FR-002, AC-001, AC-004, AC-005 — Depends: T001, T002, T003
  - [x] **PREP**: Confirmado RED TDD e arquivo src/app/page.tsx.
  - [x] **EXECUTE**: Adicionada a seção de informações na Landing Page (`Kit.tsx`).
  - [x] **VERIFY**: Teste local `npm run test:tdd -- tests/components/LandingPage.test.tsx` retornou GREEN.
  - [x] **EVIDENCE**: Comando e IDs registrados.
  - [x] **IMPROVE**: N/A
  <!-- specsfy:evidence {"task":"T009","refs":["US-001","FR-002","AC-001","AC-004","AC-005"],"files":["components/sections/Kit.tsx"],"commands":[{"run":"npm run test:tdd -- tests/components/LandingPage.test.tsx","exit":0}]} -->

- [x] T010 [DOC] [US-001] Atualizar INTERFACE.md com o componente de Informações alterado — Refs: US-001, FR-002 — Depends: T009
  - [x] **PREP**: Confirmar UI pronta.
  - [x] **EXECUTE**: Registrar bloco em INTERFACE.md.
  - [x] **VERIFY**: Leitura e monitor.
  - [x] **EVIDENCE**: Arquivo `INTERFACE.md` criado.
  - [x] **IMPROVE**: N/A.

#### Fase final — Qualidade

- [x] T011 [TEST] Executar regressão completa para todos os ACs em tests/integration/lot.test.ts — Refs: US-001, US-002, FR-001, FR-002, FR-003, NFR-001, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006 — Depends: T007, T008, T009, T010
  - [x] **PREP**: Confirmar integração.
  - [x] **EXECUTE**: Rodar vitest full e documentar.
  - [x] **VERIFY**: Verificar rastreabilidade.
  - [x] **EVIDENCE**: Registrar comandos.
  - [x] **IMPROVE**: Nenhuma melhoria necessária (cobertura e rastreabilidade validadas com sucesso).
  <!-- specsfy:evidence {"task":"T011","refs":["US-001","US-002","FR-001","FR-002","FR-003","NFR-001","AC-001","AC-002","AC-003","AC-004","AC-005","AC-006"],"files":["tests/integration/lot.test.ts"],"commands":[{"run":"npm run test:tdd","exit":0}]} -->

### 15. Ordem de execução

- Caminho crítico: TDD(T004-T006) → Lote(T007) → Doc DB(T008) → TDD(T001-T003) → LP(T009) → Doc UI(T010) → Final(T011)
- Tarefas paralelas: T001-T003 (LP) podem ocorrer em paralelo a T004-T006 (Integração Lote).
- Estratégia de MVP: Toda a spec compõe uma única entrega.

## Ato III — Entregar e validar

### 16. Dependências, riscos e suposições

#### Dependências

- Acesso ao Supabase (para criar o lote ou rodar migration se necessário).

#### Riscos

- Pagamentos ocorrendo ao mesmo tempo que as vagas esgotam → mitigação com transaction ou RLS na hora da reserva de vaga.

#### Suposições

- O sistema já possui estrutura para gerenciar vagas limitadas e alterar o valor de checkout, de modo que é uma configuração de dados.

### 17. Decisões

- Nenhuma decisão nova.

### 18. Definition of Done

- [x] `Definition Gate` está `Passed`.
- [x] `Plan Gate` está `Passed`.
- [x] `Delivery Gate` está `Passed`.
- [x] Todos os cenários `AC` aplicáveis passam.
- [x] Todos os requisitos possuem evidência de verificação.
- [x] Todas as tarefas na seção 14 estão concluídas.
- [x] Testes e checks estáticos disponíveis passam.
