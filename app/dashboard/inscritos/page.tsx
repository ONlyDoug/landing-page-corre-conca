import { supabaseAdmin } from "@/lib/supabase/server"
import TabelaInscritos, { type InscricaoRow } from "./TabelaInscritos"

export default async function InscritosPage() {
  const { data: inscritos } = await supabaseAdmin
    .from("inscricoes")
    .select(
      "id, nome, cpf, cidade, modalidade, numero_bib, valor_pago, status_pagamento, presenca_confirmada, criado_em, qr_code_token"
    )
    .order("criado_em", { ascending: false })

  return <TabelaInscritos inscritos={(inscritos ?? []) as InscricaoRow[]} />
}
