# Especificação integrada: Atualização de Layout para Pós-Inscrições e Entrega de Kits

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0002 |
| Slug | 0002-atualizacao-layout-pos-inscricoes |
| Status | Complete |
| Effort | 1 |
| Effort updated at | 2026-09-01 |
| Effort rationale | Ocultar componentes e ajustar textos estáticos são tarefas de baixo esforço. |
| ClickUp Task | |
| Milestones | |
| Definition Gate | Passed |
| Plan Gate | Passed |
| Delivery Gate | Passed |
| Evidence Contract | 1 |
| Interface para pessoas | Sim |
| Atualizada em | 2026-09-01 |

## Ato I — Definir

### 1. Problema e resultado

#### Problema

O período de inscrições do evento foi encerrado. A landing page atual, voltada para conversão e venda, encontra-se desatualizada. A permanência de tabelas de preços e botões de "Inscreva-se" pode gerar dúvidas e frustração, e informações cruciais sobre a entrega dos kits estão sem o devido destaque.

#### Resultado desejado

Uma landing page atualizada com foco no período "Pós-Inscrições", dando destaque prioritário às datas e local de entrega dos kits e eliminando os elementos de vendas. Isso deverá reduzir as dúvidas de suporte e preparar adequadamente os participantes.

#### Métricas de sucesso

- Ausência de cliques em botões de vendas "mortos".
- Redução de mensagens de suporte via WhatsApp/Instagram perguntando a data e horário da entrega dos kits.

### 2. Research e esclarecimentos

#### Researchs executados

- Nenhum executado.

#### Fontes e contexto consultados

- BACKLOG-0002
- `specs/inbox/2026-09-01-201354-atualizacao-de-layout-para-pos-inscricoes-e-adicao-de-entrega-de-kits.md`
- `specs/completed/0001-novo-lote-e-informacoes-de-retirada-de-kit/spec.md`

#### Documentação consultada

- Nenhuma documentação externa.

#### Artefatos de pesquisa armazenados

- Nenhum artefato externo armazenado.

#### Dúvidas respondidas

- **Q**: Como tratar as seções focadas em venda? → **A**: Ocultar a seção de preços e botões de inscrição, dando destaque total às informações do evento e entrega de kits no topo.
- **Q**: Atualizar com os textos provisórios ou aguardar? → **A**: Publicar agora com os textos provisórios ("Pela tarde", "O dia inteiro" e "A definir - Centro da cidade").

#### Dúvidas abertas

- Nenhuma.

### 3. Escopo e atores

#### Incluído

- Ocultar seção de preços.
- Remover botões de ação "Inscreva-se".
- Ajustar os textos de entrega de kit para: "Dia 4: Pela tarde", "Dia 5: O dia inteiro" e "Local: A definir (Centro da cidade)".
- Reorganizar visualmente o topo (Hero) para dar destaque às informações do evento e de kits.

#### Fora de escopo

- Desenvolver sistema dinâmico para os usuários agendarem os horários da entrega.
- Publicação imediata do endereço exato e horário exato (são provisórios nesta entrega).

#### Atores

- **Participantes/Visitantes**: Buscam as informações pós-inscrição na landing page.

### 4. Princípios e restrições do projeto

- **PR-001**: O layout da página não pode ser "quebrado" com a ocultação dos elementos de preço; o visual da área central deve permanecer limpo e balanceado.

### 5. Histórias de usuário

#### US-001 — Atualização de informações pós-inscrições (P1)

Como participante inscrito, quero ver as informações da entrega de kits no topo da página e não me distrair com botões de inscrição inativos, para que eu saiba rapidamente as datas provisórias e não tente realizar novas inscrições.

**Por que P1**: As inscrições estão fechadas; exibir botões leva a erros.
**Teste independente**: Acessar a página e visualizar ausência de preços e destaque nos kits.
**Requisitos**: FR-001, FR-002, NFR-001

### 6. Cenários BDD de aceite

#### AC-001 — Ocultação da seção de vendas no Desktop

**Cobre**: US-001, FR-001

```gherkin
@US-001 @FR-001 @AC-001
Feature: Landing Page pós-inscrições

  Scenario: Visitante não visualiza elementos de venda
    Given que a landing page foi acessada num navegador desktop
    When eu rolar a página por completo
    Then eu não devo visualizar a tabela de preços
    And não devo visualizar nenhum botão de "Inscreva-se"
```

#### AC-002 — Exibição das informações provisórias de entrega de kit

**Cobre**: US-001, FR-002

```gherkin
@US-001 @FR-002 @AC-002
Feature: Informações da Entrega de Kit

  Scenario: Visitante visualiza regras de entrega atualizadas
    Given que a landing page foi acessada
    When eu visualizar as informações da entrega de kit
    Then o texto do dia 4 deve constar como "Pela tarde"
    And o texto do dia 5 deve constar como "O dia inteiro"
    And o local deve constar como "A definir (Centro da cidade)"
```

#### AC-003 — Destaque visual no topo

**Cobre**: US-001, NFR-001

```gherkin
@US-001 @NFR-001 @AC-003
Feature: Usabilidade da informação

  Scenario: Informações de entrega devem estar proeminentes
    Given que a landing page foi carregada no topo
    When a área hero (topo da página) ou logo abaixo dela for exibida
    Then as informações principais sobre o evento e entrega de kit devem ter forte destaque
```

#### AC-004 — Ocultação da seção de vendas no formato Mobile

**Cobre**: US-001, FR-001

```gherkin
@US-001 @FR-001 @AC-004
Feature: Landing Page pós-inscrições

  Scenario: Visitante mobile não visualiza elementos de venda
    Given que a landing page foi acessada via celular
    When eu navegar pela página
    Then as seções de preços e botões CTA devem estar indisponíveis
```

#### AC-005 — Tentativa de acesso à URL de checkout direta

**Cobre**: US-001, FR-001

```gherkin
@US-001 @FR-001 @AC-005
Feature: Acesso a links diretos antigos

  Scenario: Visitante tenta burlar visual usando link antigo
    Given que o visitante possui o link de checkout de inscrição
    When tenta carregar a página
    Then não deve haver caminhos lógicos na view pública que levem o fluxo adiante, além do bloqueio já existente do backend
```

#### AC-006 — Responsividade dos textos de entrega no Mobile

**Cobre**: US-001, FR-002

```gherkin
@US-001 @FR-002 @AC-006
Feature: Informações da Entrega de Kit

  Scenario: Visitante visualiza regras de entrega atualizadas via celular
    Given que a landing page foi acessada num dispositivo de tela pequena
    When as seções forem renderizadas
    Then os novos textos da entrega de kit devem estar perfeitamente legíveis e contidos no viewport
```

#### AC-007 — Acessibilidade do componente de texto de retirada de kit

**Cobre**: US-001, FR-002, NFR-001

```gherkin
@US-001 @FR-002 @NFR-001 @AC-007
Feature: Acessibilidade

  Scenario: Leitor de tela anuncia as novas informações provisórias
    Given que um visitante cego utiliza leitor de tela
    When ele focar na região da entrega de kits
    Then o leitor deve anunciar perfeitamente as informações do dia 4, dia 5 e o local a definir
```

#### AC-008 — Balanceamento do layout na remoção dos botões

**Cobre**: US-001, NFR-001

```gherkin
@US-001 @NFR-001 @AC-008
Feature: Experiência Visual e Estabilidade do Layout

  Scenario: O layout não quebra após remoção da tabela de preços
    Given que a seção Pricing foi omitida da renderização
    When as demais seções (Hero, Kit, Footer) forem renderizadas
    Then não deve haver grandes "buracos brancos" ou quebra de grid que prejudique o design geral
```

### 7. Requisitos

#### Funcionais

- **FR-001**: O sistema não deve exibir as tabelas de precificação de lotes ou botões de chamadas para checkout na landing page pública.
- **FR-002**: A interface deve exibir estaticamente as informações atualizadas e provisórias para a retirada dos kits (Dias 4/5 e local provisório).

#### Não funcionais

- **NFR-001**: Experiência do usuário (UX): O layout reorganizado no topo deve apresentar um visual equilibrado (balanceamento de espaços brancos) mesmo com a remoção dos antigos Call to Actions de venda. **Verificação**: Inspeção visual humana em Desktop e Mobile.

#### Erros e casos-limite

- Visitante tenta acessar URL de checkout salva anteriormente: Fora do escopo visual, porém o backend Supabase bloqueará qualquer venda de lote já fechado.

## Ato II — Projetar e provar

### 8. Plano técnico

#### Contexto existente

- Landing page React/Next.js focada em conversão.

#### Arquitetura e módulos

- Atualização nos componentes React para comentar/remover condicionalmente a renderização de componentes de Pricing e botões.

#### Migrations

- Não aplicável.

#### Models

- Não aplicável.

#### Controllers e casos de uso

- Não aplicável.

#### Views e experiência

- Ocultação dos elementos e realocação de dados de Kit.tsx para um espaço mais alto (hero ou imediatamente abaixo).

#### Queries e repositórios

- Não aplicável.

#### Jobs e processamento assíncrono

- Não aplicável.

#### Estrutura de arquivos

```text
specs/draft/0002-atualizacao-layout-pos-inscricoes/
  spec.md
```

### 9. Modelo de dados

#### Entidades

- Nenhuma entidade de banco é alterada nesta atualização.

#### Estados e transições

- Não aplicável.

#### Migração e retenção

- Não aplicável.

### 10. Interfaces e contratos

#### Interface para pessoas

- **Há interface para pessoas**: Sim

#### Stack e convenções de interface

- Next.js (React) e Tailwind CSS.

#### Telas e responsabilidades

- Landing Page. Responsabilidade de informar.

#### Fluxo de informação e navegação

- Scroll vertical na página única (One-pager).

#### Menus e navegação principal

- Não há menu principal pois trata-se de uma landing page (one-pager). A navegação é direta e fluida por rolagem, sendo o conteúdo completo exposto na view principal e única.

#### Formulários e ações

- Não haverá mais ação principal. A página será puramente informacional sem formulários.

#### Composição e disposição

- O componente Kit.tsx (criado na SPEC-0001) precisará ter seus textos atualizados.
- O componente de Pricing e Hero deverão ter seus botões/seções ocultos.

#### Blocos React e componentes selecionados

| Tela | Bloco React | Responsabilidade | Arquivo previsto | Componente ou composição | Origem | Reuso ou extensão |
| --- | --- | --- | --- | --- | --- | --- |
| Landing Page | Kit Section | Exibir textos novos | `src/components/sections/Kit.tsx` (ou similar) | Próprio | Projeto | Atualização de arquivo existente |
| Landing Page | Pricing Section | Não renderizar | `src/components/sections/Pricing.tsx` | Próprio | Projeto | Ocultação de arquivo existente |

#### Estados e acessibilidade

- Textos continuam usando propriedades corretas de semântica (headings).

#### APIs expostas

- Nenhuma.

#### APIs externas utilizadas

- Nenhuma.

#### Documentação das APIs consultadas

- Nenhuma.

#### Eventos e outros contratos

- Não aplicável.

### 11. Estratégia TDD

- **Unidade**: Testar se os textos da landing page correspondem aos novos textos.
- **Integração/contrato**: N/A
- **BDD/aceite**: AC-001 a AC-008.
- **Runner TDD**: Vitest.
- **E2E**: Inspeção visual manual (AC-003, AC-008).
- **Verificação manual**: Inspeção do layout e balanceamento de espaços.

#### Evidência RED-GREEN-REFACTOR

| IDs | BDD de referência | Teste TDD informado pelo BDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| US-001, FR-001, AC-001 | AC-001 | tests/components/LandingPage.test.tsx | FAIL (vitest run) | PASS (vitest run) | Pending |
| US-001, FR-001, AC-004 | AC-004 | tests/components/LandingPage.test.tsx | FAIL (vitest run) | PASS (vitest run) | Pending |
| US-001, FR-001, AC-005 | AC-005 | tests/components/LandingPage.test.tsx | FAIL (vitest run) | PASS (vitest run) | Pending |
| US-001, FR-002, AC-002 | AC-002 | tests/components/LandingPage.test.tsx | FAIL (vitest run) | PASS (vitest run) | Pending |
| US-001, FR-002, AC-006 | AC-006 | tests/components/LandingPage.test.tsx | FAIL (vitest run) | PASS (vitest run) | Pending |
| US-001, FR-002, NFR-001, AC-007 | AC-007 | tests/components/LandingPage.test.tsx | FAIL (vitest run) | PASS (vitest run) | Pending |
| US-001, NFR-001, AC-003 | AC-003 | tests/components/LandingPage.test.tsx | FAIL (vitest run) | PASS (vitest run) | Pending |
| US-001, NFR-001, AC-008 | AC-008 | tests/components/LandingPage.test.tsx | FAIL (vitest run) | PASS (vitest run) | Pending |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001 | AC-001 | Unidade | `tests/components/LandingPage.test.tsx` (ausência de preço) | Pending |
| FR-001 | AC-004 | Unidade | `tests/components/LandingPage.test.tsx` | Pending |
| FR-001 | AC-005 | Unidade | `tests/components/LandingPage.test.tsx` | Pending |
| FR-002 | AC-002 | Unidade | `tests/components/LandingPage.test.tsx` (texto novo) | Pending |
| FR-002 | AC-006 | Unidade | `tests/components/LandingPage.test.tsx` | Pending |
| FR-002 | AC-007 | Unidade | `tests/components/LandingPage.test.tsx` | Pending |
| NFR-001 | AC-007 | Unidade | `tests/components/LandingPage.test.tsx` | Pending |
| NFR-001 | AC-003 | E2E/Manual | Verificação manual no Browser | Pending |
| NFR-001 | AC-008 | E2E/Manual | Verificação manual no Browser | Pending |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: READY
- **Comando**: `node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs specs/draft/0002-atualizacao-layout-pos-inscricoes/spec.md`
- **Achados**: Nenhum erro estrutural e nenhuma falha bloqueante. Cobertura de cenários confirmada. Validado em 2026-09-01.

#### Gate do Ato II — Plano

- **Resultado**: Passed
- **Comando**: `node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs specs/defined/0002-atualizacao-layout-pos-inscricoes/spec.md`
- **Achados**: 8 testes TDD no vermelho, plano aprovado em 2026-09-01.

#### Gate do Ato III — Entrega

- **Resultado**: Passed
- **Comando**: `vitest run` e `monitor_context.mjs --check`
- **Achados**: Testes em verde e documentação reconstruída. Aprovado em 2026-09-01.

### 14. Tarefas

#### Fase 1 — RED TDD informado pelo BDD

- [x] T001 [TEST] [TDD] [US-001] Derivar do AC-001 um caso Vitest garantindo ausência visual de preço e botão em `tests/components/LandingPage.test.tsx` — Refs: US-001, FR-001, AC-001 — Depends: none
  - [x] **PREP**: Confirmar escopo, IDs, dependências e baseline.
  - [x] **EXECUTE**: Produzir a entrega no caminho declarado.
  - [x] **VERIFY**: Executar a verificação focal adequada.
  - [x] **EVIDENCE**: Registrar comando, resultado e IDs nas seções 11–13.
  - [x] **IMPROVE**: Registrar melhoria aplicada ou ausência justificada.

- [x] T002 [TEST] [TDD] [US-001] Derivar do AC-002 um caso Vitest para presença dos textos provisórios em `tests/components/LandingPage.test.tsx` — Refs: US-001, FR-002, AC-002 — Depends: none
  - [x] **PREP**: Confirmar escopo, IDs, dependências e baseline.
  - [x] **EXECUTE**: Produzir a entrega no caminho declarado.
  - [x] **VERIFY**: Executar a verificação focal adequada.
  - [x] **EVIDENCE**: Registrar comando, resultado e IDs nas seções 11–13.
  - [x] **IMPROVE**: Registrar melhoria aplicada ou ausência justificada.

- [x] T003 [TEST] [TDD] [US-001] Derivar do AC-003 um caso Vitest para destaque visual no topo em `tests/components/LandingPage.test.tsx` — Refs: US-001, NFR-001, AC-003 — Depends: none
  - [x] **PREP**: Confirmar escopo, IDs, dependências e baseline.
  - [x] **EXECUTE**: Produzir a entrega no caminho declarado.
  - [x] **VERIFY**: Executar a verificação focal adequada.
  - [x] **EVIDENCE**: Registrar comando, resultado e IDs nas seções 11–13.
  - [x] **IMPROVE**: Registrar melhoria aplicada ou ausência justificada.

- [x] T004 [TEST] [TDD] [US-001] Derivar do AC-004 um caso Vitest para ausência mobile em `tests/components/LandingPage.test.tsx` — Refs: US-001, FR-001, AC-004 — Depends: none
  - [x] **PREP**: Confirmar escopo, IDs, dependências e baseline.
  - [x] **EXECUTE**: Produzir a entrega no caminho declarado.
  - [x] **VERIFY**: Executar a verificação focal adequada.
  - [x] **EVIDENCE**: Registrar comando, resultado e IDs nas seções 11–13.
  - [x] **IMPROVE**: Registrar melhoria aplicada ou ausência justificada.

- [x] T005 [TEST] [TDD] [US-001] Derivar do AC-005 um caso Vitest para roteamento/links antigos em `tests/components/LandingPage.test.tsx` — Refs: US-001, FR-001, AC-005 — Depends: none
  - [x] **PREP**: Confirmar escopo, IDs, dependências e baseline.
  - [x] **EXECUTE**: Produzir a entrega no caminho declarado.
  - [x] **VERIFY**: Executar a verificação focal adequada.
  - [x] **EVIDENCE**: Registrar comando, resultado e IDs nas seções 11–13.
  - [x] **IMPROVE**: Registrar melhoria aplicada ou ausência justificada.

- [x] T006 [TEST] [TDD] [US-001] Derivar do AC-006 um caso Vitest para exibição mobile dos textos em `tests/components/LandingPage.test.tsx` — Refs: US-001, FR-002, AC-006 — Depends: none
  - [x] **PREP**: Confirmar escopo, IDs, dependências e baseline.
  - [x] **EXECUTE**: Produzir a entrega no caminho declarado.
  - [x] **VERIFY**: Executar a verificação focal adequada.
  - [x] **EVIDENCE**: Registrar comando, resultado e IDs nas seções 11–13.
  - [x] **IMPROVE**: Registrar melhoria aplicada ou ausência justificada.

- [x] T007 [TEST] [TDD] [US-001] Derivar do AC-007 um caso Vitest de acessibilidade para os novos textos em `tests/components/LandingPage.test.tsx` — Refs: US-001, FR-002, NFR-001, AC-007 — Depends: none
  - [x] **PREP**: Confirmar escopo, IDs, dependências e baseline.
  - [x] **EXECUTE**: Produzir a entrega no caminho declarado.
  - [x] **VERIFY**: Executar a verificação focal adequada.
  - [x] **EVIDENCE**: Registrar comando, resultado e IDs nas seções 11–13.
  - [x] **IMPROVE**: Registrar melhoria aplicada ou ausência justificada.

- [x] T008 [TEST] [TDD] [US-001] Derivar do AC-008 um caso Vitest garantindo que o layout não quebra em `tests/components/LandingPage.test.tsx` — Refs: US-001, NFR-001, AC-008 — Depends: none
  - [x] **PREP**: Confirmar escopo, IDs, dependências e baseline.
  - [x] **EXECUTE**: Produzir a entrega no caminho declarado.
  - [x] **VERIFY**: Executar a verificação focal adequada.
  - [x] **EVIDENCE**: Registrar comando, resultado e IDs nas seções 11–13.
  - [x] **IMPROVE**: Registrar melhoria aplicada ou ausência justificada.

#### Fase de interface

- [x] T009 [CODE] [US-001] Ocultar a seção de Lotes em `components/sections/Lotes.tsx` e Hero CTA em `components/sections/Hero.tsx` — Refs: US-001, FR-001, NFR-001, AC-001, AC-004, AC-005, AC-008 — Depends: T001, T004, T005, T008
  - [x] **PREP**: Confirmar escopo, IDs, dependências e baseline.
  - [x] **EXECUTE**: Produzir a entrega no caminho declarado.
  - [x] **VERIFY**: Executar a verificação focal adequada.
  - [x] **EVIDENCE**: Registrar comando, resultado e IDs nas seções 11–13.
  - [x] **IMPROVE**: Registrar melhoria aplicada ou ausência justificada.
<!-- specsfy:evidence {"task":"T009","refs":["US-001","FR-001","NFR-001","AC-001","AC-004","AC-005","AC-008"],"files":["components/sections/Lotes.tsx","components/sections/Hero.tsx","components/ui/StickyMobileCTA.tsx"],"commands":[{"run":"npm run test:tdd","exit":1}]} -->

- [x] T010 [CODE] [US-001] Atualizar textos provisórios de entrega em `components/sections/Kit.tsx` e reposicionar no topo em `app/page.tsx` — Refs: US-001, FR-002, NFR-001, AC-002, AC-003, AC-006, AC-007 — Depends: T002, T003, T006, T007
  - [x] **PREP**: Confirmar escopo, IDs, dependências e baseline.
  - [x] **EXECUTE**: Produzir a entrega no caminho declarado.
  - [x] **VERIFY**: Executar a verificação focal adequada.
  - [x] **EVIDENCE**: Registrar comando, resultado e IDs nas seções 11–13.
  - [x] **IMPROVE**: Registrar melhoria aplicada ou ausência justificada.
<!-- specsfy:evidence {"task":"T010","refs":["US-001","FR-002","NFR-001","AC-002","AC-003","AC-006","AC-007"],"files":["components/sections/Kit.tsx","app/page.tsx"],"commands":[{"run":"npm run test:tdd","exit":0}]} -->

- [x] T011 [DOC] Atualizar INTERFACE.md com blocos criados, alterados ou ocultados — Refs: US-001 — Depends: T009, T010
  - [x] **PREP**: Confirmar escopo, IDs, dependências e baseline.
  - [x] **EXECUTE**: Produzir a entrega no caminho declarado.
  - [x] **VERIFY**: Executar a verificação focal adequada.
  - [x] **EVIDENCE**: Registrar comando, resultado e IDs nas seções 11–13.
  - [x] **IMPROVE**: Registrar melhoria aplicada ou ausência justificada.
<!-- specsfy:evidence {"task":"T011","refs":["US-001"],"files":["INTERFACE.md"]} -->

### 15. Ordem de execução

- Caminho crítico: T001-T008 → T009, T010 → T011
- Estratégia de MVP: Toda a adequação de informações post-inscrição em um único commit.

## Ato III — Entregar e validar

### 16. Dependências, riscos e suposições

#### Dependências

- Nenhuma dependência externa.

#### Riscos

- O usuário perder o interesse de olhar os horários provisórios. Mitigação: Destaque visual total (AC-003).

#### Suposições

- O endereço exato e horários precisos da entrega dos kits serão providenciados posteriormente num novo ciclo quando a organização definir.

### 17. Decisões

- **DEC-001**: Ocultar os botões em vez de desabilitá-los — A landing page ficará com um visual mais limpo e amigável.
- **DEC-002**: Publicar imediatamente com as informações genéricas fornecidas.

### 18. Definition of Done

- [x] `Definition Gate` está `Passed`.
- [ ] `Plan Gate` está `Passed`.
- [ ] `Delivery Gate` está `Passed`.
- [ ] Todos os cenários `AC` aplicáveis passam.
- [ ] Todos os requisitos possuem evidência de verificação.
- [ ] Todas as tarefas na seção 14 estão concluídas.
- [ ] Testes e checks estáticos disponíveis passam.
