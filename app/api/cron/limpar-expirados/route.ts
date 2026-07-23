import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const limite = new Date(Date.now() - 30 * 60 * 1000).toISOString()

  const { data: checkoutsExpirados, error: erroCheckouts } = await supabaseAdmin
    .from("checkouts_pendentes")
    .delete()
    .lt("criado_em", limite)
    .select("id, nome")

  if (erroCheckouts) {
    console.error("[CRON] Erro ao limpar checkouts pendentes expirados:", erroCheckouts)
    return NextResponse.json({ error: erroCheckouts.message }, { status: 500 })
  }

  // Branch transitória: varre linhas legadas de `inscricoes` gravadas antes da migração para
  // checkouts_pendentes (status 'pendente' pré-Fase 11, ou 'aguardando_pagamento' anterior a este
  // deploy). Remover depois que a contagem desses status em `inscricoes` chegar a zero.
  const { data: inscricoesLegadas, error: erroInscricoes } = await supabaseAdmin
    .from("inscricoes")
    .delete()
    .in("status_pagamento", ["pendente", "aguardando_pagamento"])
    .lt("criado_em", limite)
    .select("id, nome")

  if (erroInscricoes) {
    console.error("[CRON] Erro ao limpar inscrições legadas expiradas:", erroInscricoes)
    return NextResponse.json({ error: erroInscricoes.message }, { status: 500 })
  }

  const totalRemovidos = (checkoutsExpirados?.length ?? 0) + (inscricoesLegadas?.length ?? 0)
  console.log(
    `[CRON] ${checkoutsExpirados?.length ?? 0} checkouts pendentes + ${inscricoesLegadas?.length ?? 0} inscrições legadas removidas`
  )
  return NextResponse.json({
    removidos: totalRemovidos,
    checkoutsPendentes: checkoutsExpirados?.map((d) => d.id) ?? [],
    inscricoesLegadas: inscricoesLegadas?.map((d) => d.id) ?? [],
  })
}
