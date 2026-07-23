import { NextResponse } from "next/server"
import { createAuthClient } from "@/lib/supabase/auth-server"
import { finalizarCheckout } from "@/lib/confirmacaoCheckout"

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabaseAuth = await createAuthClient()
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "nao_autenticado" }, { status: 401 })
  }

  const { id } = await params

  const resultado = await finalizarCheckout({ checkoutId: id, statusFinal: "confirmado", forcar: true })

  if (resultado.status === "nao_encontrado") {
    return NextResponse.json({ error: "checkout_nao_encontrado" }, { status: 404 })
  }
  if (resultado.status !== "confirmado") {
    console.error(`[checkouts-pendentes/confirmar] falha ao confirmar checkout ${id}:`, resultado)
    return NextResponse.json({ error: "erro_ao_confirmar" }, { status: 500 })
  }

  return NextResponse.json({ success: true, inscricaoId: resultado.inscricaoId })
}
