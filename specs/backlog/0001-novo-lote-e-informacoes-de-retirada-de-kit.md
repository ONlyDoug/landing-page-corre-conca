# Backlog: Novo lote e informacoes de retirada de kit

| Metainformação | Valor |
| --- | --- |
| ID | BACKLOG-0001 |
| Status | Ready for specification |
| Produto | Landing Page Corre Conca |
| Épico | Inscrições |
| Funcionalidade | Controle de Lotes e Interface Pública |
| Tipo | História |
| Prioridade | Alta |
| Milestones | |
| Criado em | 2026-08-27 |
| Spec promovida | Nenhuma |

## Ideia original

precisamos abrir um lote novo com 70 vagas a 49,90 vamos adicionar também a informação que as entregasdos kits vao ser feita no dia 3/09 e 04/09 e lembrando que todo participante deverá levae 2kg de alimento na retirada para fazer a retirada dos kits local proximo a prefeitura

## Problema percebido

Necessidade de vender mais inscrições abrindo um novo lote com limite de vagas (70 vagas) e de comunicar com clareza aos participantes as regras para a retirada de kits na interface pública, para evitar dúvidas.

## Pessoa afetada ou beneficiada

Participantes do evento (atletas) e Administrador (equipe de organização).

## Resultado ou valor esperado

Venda de novas vagas no valor atualizado (R$ 49,90), aumento de arrecadação de alimentos (2kg de alimento não perecível por participante) e redução de dúvidas de suporte sobre as datas e local de entrega dos kits.

## Contexto

Inbox capturada em 2026-08-27-053049-novo-lote-de-70-vagas-e-informacoes-de-retirada-de-kits.md

## Referências relacionadas

- Nenhuma referência relevante encontrada.

## Comportamento esperado

O sistema deve encerrar imediatamente o lote atual e abrir um novo lote com limite de 70 vagas ao preço de R$ 49,90. Na landing page pública, a área de informações sobre o evento deve ser atualizada para destacar as datas de entrega dos kits (03/09 e 04/09), o endereço (Rua Castro Alves, Conceição da Feira, Bahia) e o requisito solidário (2kg de alimento não perecível).

## Regras de negócio

- A ativação do novo lote substitui imediatamente qualquer lote em andamento.
- O limite máximo para o novo lote é de 70 vendas.
- O local de retirada dos kits é "Rua Castro Alves, Conceição da Feira, Bahia".
- A doação exigida é estritamente de alimento não perecível.

## Critérios de aceitação

- **Given** que sou um visitante acessando a página, **When** eu navego até as informações da corrida, **Then** vejo que a entrega dos kits ocorrerá em 03 e 04/09 na Rua Castro Alves, Conceição da Feira, Bahia, e requer a doação de 2kg de alimento não perecível.
- **Given** que o novo lote está ativo, **When** um participante inicia sua inscrição, **Then** o valor exibido e cobrado deve ser de R$ 49,90.
- **Given** que as 70 vagas deste lote foram vendidas, **When** um visitante tenta se inscrever, **Then** o sistema informa que as vagas estão esgotadas ou bloqueia a compra.

## Qualidades e operação

- Segurança: O limite de vagas deve ser protegido no backend/banco de dados para evitar inscrições além de 70 vagas no momento do checkout concorrente.
- Restrição técnica: Alterações visuais devem manter a consistência com o design system atual da landing page.

## Dependências

- Possível configuração prévia da estrutura de controle de lotes no banco de dados e no checkout.

## Situações de erro

- Tentativa de compra simultânea além das 70 vagas (estoque) deve falhar graciosamente com aviso de esgotado.

## Escopo

- **Dentro**: Abertura do lote (70 vagas a R$ 49,90), atualização de textos informativos (datas, endereço, e doação de alimento) na landing page.
- **Fora**: Modificações no provedor de pagamento, criação de outras interfaces ou regras além do escopo descrito.

## Dúvidas, decisões e riscos

- **Suposição**: O sistema de gestão atual suporta limitação de vagas por lote sem requerer grande refatoração estrutural no checkout.
- **Inferência confirmada**: "Alimento" refere-se a não perecível.
- **Decisão confirmada**: A transição para o novo lote deve ser executada imediatamente sem agendamento futuro.

## Pronto para desenvolvimento

- [x] O problema e a pessoa beneficiada estão claros.
- [x] O evento inicial e o resultado esperado estão claros.
- [x] Permissões, regras e exceções relevantes estão claras.
- [x] O resultado pode ser verificado objetivamente.
- [x] Segurança, privacidade e desempenho foram avaliados conforme o risco.
- [x] Fora de escopo, dependências e decisões pendentes estão registrados.

## Próximo passo

Promover o backlog via transição para `$specsfy-03-specify`.
