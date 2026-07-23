import { supabaseAdmin } from "@/lib/supabase/server"
import TabelaInscritos, { type InscricaoRow } from "./TabelaInscritos"

export default async function InscritosPage() {
  const [{ data: inscritos }, { data: pendentes }] = await Promise.all([
    supabaseAdmin
      .from("inscricoes")
      .select(
        "id, nome, cpf, cidade, modalidade, numero_bib, valor_pago, status_pagamento, presenca_confirmada, criado_em, qr_code_token"
      )
      .order("criado_em", { ascending: false }),
    supabaseAdmin
      .from("checkouts_pendentes")
      .select("id, nome, cpf, cidade, modalidade, valor_pago, criado_em, qr_code_token")
      .order("criado_em", { ascending: false }),
  ])

  const linhasReais = (inscritos ?? []).map((i) => ({ ...i, origem: "inscricao" as const })) as InscricaoRow[]
  const linhasPendentes = (pendentes ?? []).map((p) => ({
    ...p,
    numero_bib: null,
    status_pagamento: "aguardando_pagamento" as const,
    presenca_confirmada: null,
    origem: "checkout_pendente" as const,
  })) as InscricaoRow[]

  const todas = [...linhasReais, ...linhasPendentes].sort((a, b) => {
    const dataA = a.criado_em ? new Date(a.criado_em).getTime() : 0
    const dataB = b.criado_em ? new Date(b.criado_em).getTime() : 0
    return dataB - dataA
  })

  return <TabelaInscritos inscritos={todas} />
}
