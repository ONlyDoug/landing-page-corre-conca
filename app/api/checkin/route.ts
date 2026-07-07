import { NextResponse } from "next/server"
import { createAuthClient } from "@/lib/supabase/auth-server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function POST(request: Request) {
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
    return NextResponse.json({ error: "token_obrigatorio" }, { status: 400 })
  }

  const token =
    typeof body === "object" && body !== null && typeof (body as Record<string, unknown>).token === "string"
      ? ((body as Record<string, unknown>).token as string)
      : null

  if (!token) {
    return NextResponse.json({ error: "token_obrigatorio" }, { status: 400 })
  }

  const { data: inscricao, error: erroBusca } = await supabaseAdmin
    .from("inscricoes")
    .select("id, nome, modalidade, status_pagamento, tamanho_camisa, presenca_confirmada, checkin_em")
    .eq("qr_code_token", token)
    .maybeSingle()

  if (erroBusca) {
    return NextResponse.json({ error: "erro_ao_buscar_inscricao" }, { status: 500 })
  }
  if (!inscricao) {
    return NextResponse.json({ error: "inscricao_nao_encontrada" }, { status: 404 })
  }

  if (inscricao.presenca_confirmada === true) {
    return NextResponse.json({
      jaRegistrado: true,
      checkinEm: inscricao.checkin_em,
      atleta: {
        nome: inscricao.nome,
        modalidade: inscricao.modalidade,
        status_pagamento: inscricao.status_pagamento,
      },
    })
  }

  const alerta =
    inscricao.status_pagamento === "pendente"
      ? "pagamento_pendente"
      : inscricao.status_pagamento === "cancelado"
        ? "pagamento_cancelado"
        : null

  const checkinEm = new Date().toISOString()
  const { error: erroUpdate } = await supabaseAdmin
    .from("inscricoes")
    .update({ presenca_confirmada: true, checkin_em: checkinEm })
    .eq("id", inscricao.id)

  if (erroUpdate) {
    return NextResponse.json({ error: "erro_ao_confirmar_checkin" }, { status: 500 })
  }

  return NextResponse.json({
    sucesso: true,
    alerta,
    atleta: {
      nome: inscricao.nome,
      modalidade: inscricao.modalidade,
      status_pagamento: inscricao.status_pagamento,
      tamanho_camisa: inscricao.tamanho_camisa,
      checkin_em: checkinEm,
    },
  })
}
