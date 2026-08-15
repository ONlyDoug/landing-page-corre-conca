import { NextResponse } from "next/server"
import { inscricaoSchema, parseDataNascimentoISO } from "@/lib/validations"
import { VALOR_INSCRICAO } from "@/lib/constants"
import { supabaseAdmin } from "@/lib/supabase/server"
import { createAuthClient } from "@/lib/supabase/auth-server"

type InscricaoExistente = {
  id: string
  qrCodeToken: string | null
  statusPagamento: string
}

async function buscarInscricaoPorCpf(cpfLimpo: string): Promise<InscricaoExistente | null> {
  const { data, error } = await supabaseAdmin
    .from("inscricoes")
    .select("id, qr_code_token, status_pagamento")
    .eq("cpf", cpfLimpo)
    .maybeSingle()

  if (error) {
    console.error("[inscricao-manual] falha ao verificar CPF existente:", error)
    return null
  }
  if (!data) return null

  return { id: data.id, qrCodeToken: data.qr_code_token, statusPagamento: data.status_pagamento }
}

function respostaCpfDuplicado(inscricaoExistente: InscricaoExistente) {
  return NextResponse.json(
    { error: "cpf_ja_cadastrado", inscricaoExistente },
    { status: 409 }
  )
}

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
    return NextResponse.json(
      { success: false, errors: { formErrors: ["JSON inválido"], fieldErrors: {} } },
      { status: 400 }
    )
  }

  const parsed = inscricaoSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, errors: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const dataNascimentoISO = parseDataNascimentoISO(parsed.data.dataNascimento)
  if (!dataNascimentoISO) {
    return NextResponse.json(
      {
        success: false,
        errors: { formErrors: [], fieldErrors: { dataNascimento: ["Data de nascimento inválida"] } },
      },
      { status: 400 }
    )
  }

  const bodyRecord = body as Record<string, unknown>

  let valorPago = VALOR_INSCRICAO
  if (bodyRecord.valorPago !== undefined && bodyRecord.valorPago !== null && bodyRecord.valorPago !== "") {
    const valorNumerico = Number(bodyRecord.valorPago)
    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      return NextResponse.json({ error: "valor_pago_invalido" }, { status: 400 })
    }
    valorPago = valorNumerico
  }

  let observacao: string | null = null
  if (bodyRecord.observacao !== undefined && bodyRecord.observacao !== null) {
    if (typeof bodyRecord.observacao !== "string") {
      return NextResponse.json({ error: "observacao_invalida" }, { status: 400 })
    }
    observacao = bodyRecord.observacao.trim() || null
  }

  const cpfLimpo = parsed.data.cpf.replace(/\D/g, "")

  const inscricaoExistente = await buscarInscricaoPorCpf(cpfLimpo)
  if (inscricaoExistente) {
    return respostaCpfDuplicado(inscricaoExistente)
  }

  const { data, error } = await supabaseAdmin
    .from("inscricoes")
    .insert({
      nome: parsed.data.nome,
      cpf: cpfLimpo,
      cidade: parsed.data.cidade,
      data_nascimento: dataNascimentoISO,
      telefone: parsed.data.telefone,
      tamanho_camisa: parsed.data.tamanhoCamisa,
      modalidade: parsed.data.modalidade,
      lote: 1,
      valor_pago: valorPago,
      status_pagamento: "confirmado",
    })
    .select("id, qr_code_token")
    .single()

  if (error) {
    if (error.code === "23505") {
      const inscricaoConcorrente = await buscarInscricaoPorCpf(cpfLimpo)
      if (inscricaoConcorrente) {
        return respostaCpfDuplicado(inscricaoConcorrente)
      }
    }
    console.error("[inscricao-manual] erro ao gravar inscrição:", error)
    return NextResponse.json({ error: "erro_ao_criar_inscricao" }, { status: 500 })
  }

  // A inscrição já foi gravada com sucesso — nada a partir daqui pode virar erro 5xx.

  const { error: erroPagamento } = await supabaseAdmin.from("pagamentos").insert({
    inscricao_id: data.id,
    status: "manual_admin",
    valor: valorPago,
    payload: {
      origem: "inscricao_manual_painel",
      observacao,
      criado_por: user.email,
    },
  })

  if (erroPagamento) {
    console.error("[inscricao-manual] falha ao gravar log de pagamento manual:", erroPagamento)
  }

  return NextResponse.json(
    { success: true, qrCodeToken: data.qr_code_token, id: data.id },
    { status: 201 }
  )
}
