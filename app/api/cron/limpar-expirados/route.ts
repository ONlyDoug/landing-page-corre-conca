import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { data: deletados, error } = await supabaseAdmin
    .from("inscricoes")
    .delete()
    .eq("status_pagamento", "aguardando_pagamento")
    .lt("criado_em", new Date(Date.now() - 30 * 60 * 1000).toISOString())
    .select("id, nome")

  if (error) {
    console.error("[CRON] Erro ao limpar expirados:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log(`[CRON] ${deletados?.length ?? 0} inscrições expiradas removidas`)
  return NextResponse.json({
    removidos: deletados?.length ?? 0,
    ids: deletados?.map((d) => d.id) ?? [],
  })
}
