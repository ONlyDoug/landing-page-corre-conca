# Backlog: Atualização de Layout para Pós-Inscrições e Entrega de Kits

| Metainformação | Valor |
| --- | --- |
| ID | BACKLOG-0002 |
| Status | Promoted |
| Produto | Landing Page |
| Épico | Evento Pós-Inscrições |
| Funcionalidade | Atualização de Layout de Informações |
| Tipo | Melhoria de Interface |
| Prioridade | Alta |
| Milestones | |
| Criado em | 2026-09-01 |
| Spec promovida | specs/draft/0002-atualizacao-layout-pos-inscricoes/spec.md |

## Ideia original

Objetivo: Mudar o layout atual para a versão de 'Pós-Inscrições', pois o período de inscrições foi encerrado. Ação: Reorganizar as informações que já temos na página para se adequar a este novo momento do evento. Novas Informações para Adicionar (Entrega dos Kits): Dia 4: Pela tarde, Dia 5: O dia todo, Local: A ser definido ('Centro da cidade')

## Problema percebido

O período de inscrições foi encerrado, tornando o layout atual focado em vendas desatualizado. É preciso adaptar a landing page para o momento 'pós-inscrições' e informar as datas e local provisório de entrega dos kits.

## Pessoa afetada ou beneficiada

Participantes inscritos no evento que buscam informações sobre a retirada dos kits.

## Resultado ou valor esperado

Landing page focada nas informações pós-inscrição, com os dados da entrega dos kits visíveis (top da página), reduzindo dúvidas de suporte.

## Contexto

Essa alteração substitui as informações anteriores de entrega de kits definidas na SPEC-0001 e altera significativamente o design atual. As novas datas de entrega são "Dia 4 pela tarde" e "Dia 5 o dia todo" em local "A definir (Centro da cidade)". A página irá ao ar com esses textos provisórios.

## Referências relacionadas

- `specs/completed/0001-novo-lote-e-informacoes-de-retirada-de-kit/spec.md` (relação: spec sobrepor ou modificar conteúdo prévio)
- `specs/inbox/2026-09-01-201354-atualizacao-de-layout-para-pos-inscricoes-e-adicao-de-entrega-de-kits.md` (relação: fonte da ideia original)

## Comportamento esperado

- A seção de preços será totalmente ocultada.
- Todos os botões "Inscreva-se" serão ocultados.
- As informações do evento e entrega de kits ganharão destaque total no topo da página (área Hero/logo abaixo dela).
- Os textos da entrega de kit exibirão exatamente: "Dia 4: Pela tarde", "Dia 5: O dia todo", e "Local: A definir (Centro da cidade)".

## Regras de negócio

- Inscrições online estão encerradas (botões e preços escondidos).

## Critérios de aceitação

- **Given** que a página foi carregada, **When** o usuário olhar o topo, **Then** as informações de retirada dos kits e detalhes do evento devem estar visíveis com destaque.
- **Given** que o usuário navegue pela página, **When** tentar encontrar preços ou inscrições, **Then** não deve haver nenhuma tabela de preço nem botão "Inscreva-se" disponível.

## Qualidades e operação

- Acessibilidade: O texto de entrega de kits continuará devidamente legível e estruturado por leitores de tela.
- Segurança: Não aplicável (conteúdo estático público).
- Privacidade: Não aplicável.
- Desempenho e volume: Redução de botões e links de vendas (mesmo peso leve).

## Dependências

- Nenhuma dependência bloqueante; as informações provisórias estão liberadas para publicação imediata.

## Situações de erro

- Visitante tenta acessar links diretos antigos de inscrição: A rota da landing page deve esconder essa UI visualmente, o Supabase impedirá a compra de lote esgotado de qualquer forma (já garantido por SPEC-0001).

## Escopo

- **Dentro**:
  - Ocultar seção de preços e botões de inscrição da Landing Page.
  - Ajustar visual (Hero e áreas principais) para dar destaque às informações do evento e entrega de kits.
  - Atualizar os textos estáticos do componente de Kits.
- **Fora**:
  - Implementar qualquer mecânica de reserva de horários para a retirada dos kits.
  - Mudar o endereço exato ou os horários precisos da entrega nesta entrega inicial.

## Dúvidas, decisões e riscos

- **Decisão**: Ocultar os botões de inscrição e a tabela de preços, e elevar as informações de entrega ao destaque principal.
- **Decisão**: Publicar o conteúdo agora mesmo com o texto provisório, sem aguardar o endereço exato.
- **Riscos**: Nenhuma objeção; se o usuário solicitar o endereço exato depois, uma nova spec ou atualização rápida lidará com isso.

## Pronto para desenvolvimento

- [x] O problema e a pessoa beneficiada estão claros.
- [x] O evento inicial e o resultado esperado estão claros.
- [x] Permissões, regras e exceções relevantes estão claras.
- [x] O resultado pode ser verificado objetivamente.
- [x] Segurança, privacidade e desempenho foram avaliados conforme o risco.
- [x] Fora de escopo, dependências e decisões pendentes estão registrados.

## Próximo passo

O brief está pronto. Aguardando comando para `$specsfy-update-spec` (visto que isso altera a SPEC-0001 de forma material e o estado atual) ou `$specsfy-03-specify` para criar uma SPEC-0002 nova.
