import { NextResponse } from "next/server"
import { inscricaoSchema } from "@/lib/validations"
import { PRAZO_EDICAO_INSCRICAO } from "@/lib/constants"
import { supabaseAdmin } from "@/lib/supabase/server"

const editarSchema = inscricaoSchema.pick({ modalidade: true, tamanhoCamisa: true }).partial()

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  if (new Date() > new Date(PRAZO_EDICAO_INSCRICAO)) {
    return NextResponse.json({ error: "prazo_encerrado" }, { status: 403 })
  }

  const { token } = await params

  const { data: inscricao, error: erroBusca } = await supabaseAdmin
    .from("inscricoes")
    .select("id, status_pagamento")
    .eq("qr_code_token", token)
    .maybeSingle()

  if (erroBusca) {
    console.error("[atleta/editar] erro ao buscar inscrição:", erroBusca)
    return NextResponse.json({ error: "erro_interno" }, { status: 500 })
  }
  if (!inscricao) {
    return NextResponse.json({ error: "nao_encontrado" }, { status: 404 })
  }
  if (inscricao.status_pagamento !== "confirmado") {
    return NextResponse.json({ error: "nao_confirmado" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "corpo_invalido" }, { status: 400 })
  }

  const parsed = editarSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "dados_invalidos", errors: parsed.error.flatten() }, { status: 400 })
  }
  if (parsed.data.modalidade === undefined && parsed.data.tamanhoCamisa === undefined) {
    return NextResponse.json({ error: "corpo_vazio" }, { status: 400 })
  }

  const atualizacao: { modalidade?: string; tamanho_camisa?: string } = {}
  if (parsed.data.modalidade !== undefined) atualizacao.modalidade = parsed.data.modalidade
  if (parsed.data.tamanhoCamisa !== undefined) atualizacao.tamanho_camisa = parsed.data.tamanhoCamisa

  const { data: atualizada, error: erroUpdate } = await supabaseAdmin
    .from("inscricoes")
    .update(atualizacao)
    .eq("id", inscricao.id)
    .select("modalidade, tamanho_camisa")
    .single()

  if (erroUpdate) {
    console.error("[atleta/editar] erro ao atualizar inscrição:", erroUpdate)
    return NextResponse.json({ error: "erro_interno" }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    modalidade: atualizada.modalidade,
    tamanhoCamisa: atualizada.tamanho_camisa,
  })
}
