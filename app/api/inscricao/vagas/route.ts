import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { PRAZO_ENCERRAMENTO_INSCRICOES, LIMITE_INSCRICOES } from "@/lib/constants"

export const dynamic = 'force-dynamic'

export async function GET() {
  if (new Date() > new Date(PRAZO_ENCERRAMENTO_INSCRICOES)) {
    return NextResponse.json({ esgotadas: true, motivo: 'prazo' })
  }

  const { count } = await supabaseAdmin
    .from("inscricoes")
    .select("*", { count: "exact", head: true })
    .eq("status_pagamento", "confirmado")

  if (count !== null && count >= LIMITE_INSCRICOES) {
    return NextResponse.json({ esgotadas: true, motivo: 'limite' })
  }

  return NextResponse.json({ esgotadas: false })
}
