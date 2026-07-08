import { NextResponse } from "next/server"
import { createAuthClient } from "@/lib/supabase/auth-server"
import { supabaseAdmin } from "@/lib/supabase/server"

type StatusPagamento = "confirmado" | "cancelado"

function isStatusValido(value: unknown): value is StatusPagamento {
  return value === "confirmado" || value === "cancelado"
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabaseAuth = await createAuthClient()
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "nao_autenticado" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "status_invalido" }, { status: 400 })
  }

  const status =
    typeof body === "object" && body !== null ? (body as Record<string, unknown>).status : undefined

  if (!isStatusValido(status)) {
    return NextResponse.json({ error: "status_invalido" }, { status: 400 })
  }

  const { id } = await params

  const { data: inscricao, error: erroBusca } = await supabaseAdmin
    .from("inscricoes")
    .select("id")
    .eq("id", id)
    .maybeSingle()

  if (erroBusca) {
    console.error("Erro ao buscar inscrição:", erroBusca)
    return NextResponse.json({ error: "erro_ao_buscar_inscricao" }, { status: 500 })
  }
  if (!inscricao) {
    return NextResponse.json({ error: "inscricao_nao_encontrada" }, { status: 404 })
  }

  const { error: erroUpdate } = await supabaseAdmin
    .from("inscricoes")
    .update({ status_pagamento: status })
    .eq("id", id)

  if (erroUpdate) {
    console.error("Erro ao atualizar status de pagamento:", erroUpdate)
    return NextResponse.json({ error: "erro_ao_atualizar_status" }, { status: 500 })
  }

  return NextResponse.json({ success: true, id, status })
}
