# Referência do Repositório GitHub — Corre Conça
> DOCUMENTO INTERNO DO CLAUDE CHAT — não enviar ao Claude Code nem ao Claude Design.
> 
> Este documento serve ao Claude Chat como fonte de consulta para:
> - Garantir que os prompts gerados para o Claude Code sigam os padrões do repositório
> - Embasar decisões de arquitetura e engenharia com base nos exemplos do repositório
> - Auditar se os agentes criados estão consistentes com o padrão Coordinator-Led
> 
> O Claude Code recebe apenas prompts já prontos com os padrões embutidos — não tem acesso ao repositório.

---

## Visão Geral do Repositório

O repositório é um curso de **Prompt Engineering e Engenharia de Software com IA**, organizado em módulos progressivos. Para o projeto Corre Conça, os módulos mais relevantes são:

| Módulo | Pasta | Relevância para o projeto |
|---|---|---|
| Tipos de Prompts | `1-tipos-de-prompts/` | Como estruturar os prompts dos agentes |
| Workflow de Agentes | `4-prompts-e-workflow-de-agentes/` | **Padrão central**: como orquestrar agentes no Claude Code |
| Gerenciamento de Prompts | `5-gerenciamento-e-versionamento-de-prompts/` | Versionamento e estrutura dos prompts |
| Design Docs / PRD | `8-design-docs/` | Padrão do PRD já seguido neste projeto |

---

## Módulo 1 — Técnicas de Prompt Engineering
**Pasta:** `1-tipos-de-prompts/`

O repositório demonstra 9 técnicas que devem ser aplicadas ao escrever os prompts dos agentes deste projeto:

### Técnicas e quando usar em cada agente

| Técnica | Descrição | Aplicação no projeto |
|---|---|---|
| **Role Prompting** | Atribuir persona específica ao LLM | Todo agente começa com "Você é o Agente de X" — define tom e expertise |
| **Zero-shot** | Instrução direta sem exemplos | Tarefas bem definidas como "crie o arquivo constants.ts" |
| **Few-shot** | Fornecer exemplos antes da tarefa | Ao especificar formato de output (ex: estrutura do schema SQL) |
| **Chain of Thought (CoT)** | Raciocínio passo a passo | Agentes de QA: "verifique X, depois Y, depois Z" |
| **CoT Self-Consistency** | Múltiplos caminhos de raciocínio | Decisões críticas de arquitetura com trade-offs |
| **Tree of Thoughts (ToT)** | Explorar múltiplas alternativas | Quando há mais de uma solução possível (ex: integração InfinitePay) |
| **Skeleton of Thought (SoT)** | Outline primeiro, depois detalhar | Agentes que geram documentos (HANDOFF.md, relatórios) |
| **ReAct** | Raciocínio + ação intercalados | Agentes que precisam ler arquivo → decidir → escrever |
| **Prompt Chaining** | Output de um vira input do próximo | Pipeline de fases: Setup → Componentes → Integração → QA |
| **Least-to-Most** | Decompor do simples ao complexo | Fase de Setup: ambiente primeiro, depois estrutura, depois código |

### Regra de ouro do repositório
> **"Start Simple: Begin with zero-shot, add complexity only when needed"**

Nos agentes do projeto: instrução direta primeiro. Só adicionar CoT, exemplos ou decomposição se a tarefa for genuinamente complexa.

---

## Módulo 2 — Padrão Central: Coordinator-Led Multi-Agent
**Pasta:** `4-prompts-e-workflow-de-agentes/`

Este é o padrão arquitetural que fundamenta TODO o Orquestrador do Claude Code deste projeto.

### Como funciona

```
Claude Code (Master Coordinator)
    │
    ├── Task(agente-setup)           ← Fase 1
    │
    ├── Task(agente-hero)            ← Fase 2A (paralelo)
    ├── Task(agente-secoes)          ← Fase 2B (paralelo)
    ├── Task(agente-formulario)      ← Fase 2C (paralelo)
    │
    ├── Task(agente-integracao)      ← Fase 3
    │   ...
```

### Regras críticas do padrão (extraídas do repositório)

**✅ SEMPRE:**
- Claude Code (você) = Master Coordinator — sequencia fases e gerencia paralelismo
- Cada agente é invocado com `Task()` separado
- Toda comunicação flui através do coordinator
- Usar caminhos absolutos em todos os relatórios e artefatos
- Verificar 100% de cobertura das tarefas antes de avançar de fase
- Atualizar o registro de status após cada agente completar

**❌ NUNCA:**
- Orquestrador invocar outros agentes (só o Master Coordinator faz isso)
- Agentes comunicarem entre si diretamente
- Criar pastas não autorizadas (`reports/`, `output/`, `tmp/` ad-hoc)
- Modificar código sem instrução explícita
- Usar linguagem vaga ("provavelmente funciona", "deve estar ok")
- Duplicar artefatos — editar o existente se precisar mudar

### MANIFEST como fonte da verdade

O repositório usa `MANIFEST.md` como registro central de todos os artefatos produzidos. No projeto Corre Conça, o equivalente é o `HANDOFF.md` gerado na Fase 11, que deve:
- Listar todos os arquivos criados com caminhos absolutos
- Registrar decisões técnicas tomadas em cada fase
- Documentar itens pendentes com instrução de como resolver
- Ser atualizado pelo coordinator após cada fase concluída

### Template de agente (padrão do repositório)

```markdown
---
name: nome-do-agente
description: Use este agente quando [condição específica].
---
# Role Specification — [Nome do Agente]

Você é o [Nome] operando em um ambiente coordinator-led onde
o Master Coordinator (Claude Code) controla o sequenciamento.

# Responsabilidades Principais
1. [responsabilidade 1]
2. [responsabilidade 2]

# O que NUNCA fazer
- Invocar outros agentes
- Criar arquivos fora do diretório designado
- Usar linguagem vaga

# Output
- Localização: [caminho absoluto]
- Formato: [especificação]
- Validação: [como verificar que está correto]
```

---

## Módulo 3 — Versionamento e Estrutura de Prompts
**Pasta:** `5-gerenciamento-e-versionamento-de-prompts/`

### Estrutura de prompt versionado (YAML)

O repositório usa arquivos YAML estruturados para versionar prompts. Para o projeto Corre Conça, cada prompt de agente deve seguir este padrão na documentação:

```yaml
# Exemplo do padrão do repositório
_type: prompt
id: agente-setup
version: 1.0.0
input_variables:
  - project_name
  - stack
  - data_evento
template: |
  Você é o Agente de Setup...
  Projeto: {project_name}
  Stack: {stack}
```

### Padrão de agente especializado (do repositório)

O `agent-code-reviewer` e `agent-pull-request-creator` mostram como estruturar agentes com:

**Variáveis de entrada claramente definidas** — nunca hardcode dentro do prompt, sempre parametrizar:
```
input_variables: [code_diff, language, repo_rules, security_level]
```

**No projeto Corre Conça, equivale a:**
```
input_variables: [dados_evento, link_infinitepay, email_organizador, lote_ativo]
```

**Formato de saída estruturado** — o agente sempre devolve em formato previsível:

```
RESUMO: [o que foi feito]
ARQUIVOS CRIADOS: [lista com caminhos absolutos]
VERIFICAÇÃO: [como testar que funcionou]
PENDÊNCIAS: [o que ficou faltando]
```

### Testes de prompts (padrão do repositório)

O repositório usa `pytest` para validar prompts automaticamente. Para o Claude Code, o equivalente é o checklist de QA da Fase 11 — cada item deve ser verificável e binário (passa/falha), nunca subjetivo.

---

## Módulo 4 — Padrão de PRD e Design Docs
**Pasta:** `8-design-docs/`

### O que o repositório demonstra

Dois exemplos completos de PRD que estabelecem o padrão seguido no PRD deste projeto:
- **Rate Limiter** — sistema técnico com SDK em Go
- **Catálogo de eCommerce** — plataforma com API e painel interno

### Padrões aplicados ao PRD do Corre Conça

**1. Resumo executivo em uma frase** — o PRD sempre começa com o que é, quem usa e qual o objetivo. Aplicado no PRD v2.0 do projeto.

**2. Objetivos → Métrica → Meta** — nunca objetivo sem métrica mensurável. Aplicado nas 4 métricas do projeto (conversão, controle, check-in, visibilidade).

**3. Fora de escopo explícito** — tão importante quanto o escopo. Evita scope creep. Aplicado no PRD com 6 itens fora de escopo.

**4. Requisitos funcionais com fluxo principal** — cada RF tem: descrição, fluxo passo a passo, erros previstos, prioridade. Aplicado nos RF01-RF08.

**5. Decisões com trade-off documentado** — nunca "decidimos X" sem "porque Y e o trade-off é Z". Aplicado no log de decisões do Orquestrador.

**6. Critérios de aceitação binários** — cada critério é verificável com sim/não. "Funciona bem" é inválido. Aplicado nos 20 critérios do projeto.

### Processo de entrevista para PRD (do repositório)

O repositório tem um prompt de entrevista estruturado em 12 etapas. Para mudanças de escopo futuras no projeto Corre Conça, seguir esta sequência:

```
1. Contexto e visão → 2. Problema → 3. Métricas → 4. Escopo
→ 5. RF → 6. RNF → 7. Arquitetura → 8. Decisões
→ 9. Dependências → 10. Riscos → 11. Critérios → 12. Testes
```

---

## Aplicação Prática no Projeto

### Como o Claude Code deve usar este documento

**Antes de cada fase**, verificar:

| Pergunta | Referência no repositório |
|---|---|
| O prompt do agente tem papel claro? | Módulo 1: Role Prompting |
| A instrução é simples e direta? | Módulo 1: "Start simple" |
| O agente sabe o que NÃO fazer? | Módulo 2: Negative Instructions |
| O output tem formato previsível? | Módulo 3: Formato estruturado |
| O agente tem caminho absoluto de output? | Módulo 2: Path Policy |
| A verificação é binária (passou/falhou)? | Módulo 4: Critérios de aceitação |

### Técnica de prompt por tipo de agente do projeto

| Agente | Técnica principal | Justificativa |
|---|---|---|
| agente-setup | Least-to-Most | Decompõe: ambiente → estrutura → configuração |
| agente-hero | Few-shot | Especifica componentes visuais com exemplos de código |
| agente-secoes | Skeleton of Thought | Outline das seções primeiro, depois implementa cada uma |
| agente-formulario | Chain of Thought | Validação CPF requer raciocínio passo a passo |
| agente-integracao | ReAct | Lê arquivos existentes → decide → escreve page.tsx |
| agente-supabase-setup | Least-to-Most | Instalação → schema → RLS → API Route |
| agente-webhook | Zero-shot + CoT | Tarefa clara, mas fluxo de mapeamento de status requer raciocínio |
| agente-dashboard-* | Prompt Chaining | Output de cada página vira contexto da próxima |
| agente-qa-final | CoT Self-Consistency | QA verifica cada item de forma independente e consistente |

### Paralelismo recomendado (padrão do repositório)

```
FASE 1 (sequencial): Setup — precisa estar pronto para todas as outras
FASE 2 (paralelo):   2A + 2B + 2C — componentes independentes
FASE 3 (sequencial): Integração — depende da Fase 2 completa
FASE 4 (sequencial): Estilo — depende da Fase 3
FASE 5 (sequencial): QA LP — depende da Fase 4
FASE 6 (pode iniciar junto com Fase 3): Supabase Setup
FASE 7 (sequencial após 6): Webhook
FASES 8-10 (paralelo entre si): Dashboard pages independentes
FASE 11 (sequencial): QA Final — depende de tudo
```

---

## Checklist de Conformidade com o Repositório

Antes de submeter cada fase como concluída, verificar:

- [ ] O agente tem papel explícito no cabeçalho do prompt?
- [ ] As instruções seguem a técnica de prompt adequada para o tipo de tarefa?
- [ ] O agente lista explicitamente o que NÃO deve fazer?
- [ ] O output tem localização com caminho absoluto?
- [ ] O formato de entrega é estruturado e previsível?
- [ ] A verificação de conclusão é binária (passa/falha)?
- [ ] O Master Coordinator atualizou o registro de status após a fase?
- [ ] `npm run build` passou sem erros antes de marcar a fase como concluída?
- [ ] Nenhum dado foi hardcodado (tudo via `constants.ts`)?
- [ ] TypeScript strict: sem `any`, sem `@ts-ignore`?
