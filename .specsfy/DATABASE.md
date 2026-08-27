# Banco de dados

Mapa de persistência do sistema. Modelo inicial sugerido para
**Next.js**.

Para Next.js, explicite App Router, Server Components, Client Components e fronteiras entre servidor e navegador.

## Fontes de dados

<!-- specsfy:database:start -->
| Fonte | Tecnologia | Configuração segura | Evidência |
| --- | --- | --- | --- |
| Principal | A confirmar | Nome de variável, nunca o valor | A confirmar |

## Estruturas

| Estrutura | Tipo | Campos | Relações | Fonte |
| --- | --- | --- | --- | --- |
| `lots` | Tabela | `id`, `name`, `price`, `total_spots`, `available_spots`, `is_active` | N/A | `supabase/seed.sql` |
<!-- specsfy:database:end -->

## Decisões, ownership e retenção

Registre finalidade, ownership, classificação, retenção, constraints e decisões
que não estejam explícitas nos schemas.
