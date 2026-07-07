import { NextResponse } from "next/server"
import { inscricaoSchema, parseDataNascimentoISO } from "@/lib/validations"
import { getLoteAtivo } from "@/lib/utils"
import { LINK_INFINITEPAY } from "@/lib/constants"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function POST(request: Request) {
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

  const lote = getLoteAtivo(new Date())
  const cpfLimpo = parsed.data.cpf.replace(/\D/g, "")

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
      lote: lote.numero,
      valor_pago: lote.valor,
    })
    .select("qr_code_token")
    .single()

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { success: false, errors: { formErrors: ["Este CPF já possui uma inscrição."], fieldErrors: {} } },
        { status: 409 }
      )
    }
    console.error("[inscricao] erro ao gravar no Supabase:", error)
    return NextResponse.json(
      {
        success: false,
        errors: { formErrors: ["Não foi possível processar sua inscrição. Tente novamente."], fieldErrors: {} },
      },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    qrCodeToken: data.qr_code_token,
    linkPagamento: LINK_INFINITEPAY,
  })
}
