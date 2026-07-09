import { supabaseAdmin } from "@/lib/supabase/server"
import TabelaInscritos, { type InscricaoRow } from "./TabelaInscritos"
import ConfirmacaoLote from "./ConfirmacaoLote"

export default async function InscritosPage() {
  const [{ data: inscritos }, { data: pendentesParaLote }] = await Promise.all([
    supabaseAdmin
      .from("inscricoes")
      .select(
        "id, nome, cpf, cidade, modalidade, lote, valor_pago, status_pagamento, presenca_confirmada, criado_em, qr_code_token"
      )
      .order("criado_em", { ascending: false }),
    supabaseAdmin
      .from("inscricoes")
      .select("id, nome, valor_pago")
      .eq("status_pagamento", "pendente")
      .order("criado_em", { ascending: true }),
  ])

  return (
    <>
      <ConfirmacaoLote inscritosPendentes={pendentesParaLote ?? []} />
      <TabelaInscritos inscritos={(inscritos ?? []) as InscricaoRow[]} />
    </>
  )
}
