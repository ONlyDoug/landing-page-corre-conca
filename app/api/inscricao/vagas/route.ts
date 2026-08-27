import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { PRAZO_ENCERRAMENTO_INSCRICOES, LIMITE_INSCRICOES } from "@/lib/constants"

export const dynamic = 'force-dynamic'

export async function GET() {
  const headers = { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' }

  if (new Date() > new Date(PRAZO_ENCERRAMENTO_INSCRICOES)) {
    return NextResponse.json({ esgotadas: true, motivo: 'prazo' }, { headers })
  }

  const { count } = await supabaseAdmin
    .from("inscricoes")
    .select("*", { count: "exact", head: true })
    .eq("status_pagamento", "confirmado")

  if (count !== null && count >= LIMITE_INSCRICOES) {
    return NextResponse.json({ esgotadas: true, motivo: 'limite' }, { headers })
  }

  return NextResponse.json({ esgotadas: false }, { headers })
}
