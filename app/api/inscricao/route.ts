import { NextResponse } from "next/server"
import { inscricaoSchema, parseDataNascimentoISO } from "@/lib/validations"
import { modalidadeLabel } from "@/lib/utils"
import {
  LINK_INFINITEPAY,
  INFINITEPAY_HANDLE,
  INFINITEPAY_API_URL,
  SITE_URL,
  WEBHOOK_URL,
  VALOR_INSCRICAO,
} from "@/lib/constants"
import { supabaseAdmin } from "@/lib/supabase/server"

type InfinitePayLinkResponse = {
  url: string
}

function normalizarTelefoneE164(telefoneMascarado: string): string {
  return `+55${telefoneMascarado.replace(/\D/g, "")}`
}

type InscricaoExistente = {
  qrCodeToken: string | null
  statusPagamento: string
}

/**
 * Busca inscrição existente por CPF; retorna null tanto se não encontrar quanto se a busca falhar.
 * Checa primeiro `inscricoes` (pagamento já confirmado/cancelado) e depois `checkouts_pendentes`
 * (checkout em andamento) — isso preserva o comportamento de reaproveitar o mesmo link de checkout
 * se a pessoa reenviar o formulário antes de terminar de pagar, em vez de gerar um segundo link.
 */
async function buscarInscricaoPorCpf(cpfLimpo: string): Promise<InscricaoExistente | null> {
  const { data: real, error: erroReal } = await supabaseAdmin
    .from("inscricoes")
    .select("qr_code_token, status_pagamento")
    .eq("cpf", cpfLimpo)
    .maybeSingle()

  if (erroReal) {
    console.error("[inscricao] falha ao verificar CPF existente:", erroReal)
    return null
  }
  if (real) return { qrCodeToken: real.qr_code_token, statusPagamento: real.status_pagamento }

  const { data: pendente, error: erroPendente } = await supabaseAdmin
    .from("checkouts_pendentes")
    .select("qr_code_token")
    .eq("cpf", cpfLimpo)
    .maybeSingle()

  if (erroPendente) {
    console.error("[inscricao] falha ao verificar checkout pendente por CPF:", erroPendente)
    return null
  }
  if (!pendente) return null

  return { qrCodeToken: pendente.qr_code_token, statusPagamento: "aguardando_pagamento" }
}

function respostaJaInscrito(inscricaoExistente: InscricaoExistente) {
  return NextResponse.json(
    {
      success: false,
      jaInscrito: true,
      qrCodeToken: inscricaoExistente.qrCodeToken,
      statusPagamento: inscricaoExistente.statusPagamento,
    },
    { status: 409 }
  )
}

/** Gera o link de checkout dinâmico na InfinitePay; nunca lança — falhas caem no fallback estático. */
async function gerarCheckoutDinamico(params: {
  checkoutId: string
  qrCodeToken: string
  nome: string
  telefone: string
  modalidade: string
  valor: number
}): Promise<string> {
  const payload = {
    handle: INFINITEPAY_HANDLE,
    order_nsu: params.checkoutId,
    redirect_url: `${SITE_URL}/acompanhar/${params.qrCodeToken}`,
    webhook_url: WEBHOOK_URL,
    items: [
      {
        description: `Corre Conça – ${modalidadeLabel(params.modalidade)}`,
        quantity: 1,
        price: Math.round(params.valor * 100),
      },
    ],
    customer: {
      name: params.nome,
      phone_number: normalizarTelefoneE164(params.telefone),
    },
  }

  try {
    const resposta = await fetch(INFINITEPAY_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    })

    if (!resposta.ok) {
      const corpo = await resposta.text().catch(() => "<sem corpo>")
      console.error("[inscricao] InfinitePay retornou status", resposta.status, corpo)
      return LINK_INFINITEPAY
    }

    const json = (await resposta.json()) as InfinitePayLinkResponse
    if (!json.url) {
      console.error("[inscricao] resposta da InfinitePay sem url:", json)
      return LINK_INFINITEPAY
    }

    return json.url
  } catch (err) {
    console.error("[inscricao] falha ao gerar link de checkout dinâmico:", err)
    return LINK_INFINITEPAY
  }
}

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

  const cpfLimpo = parsed.data.cpf.replace(/\D/g, "")

  const inscricaoExistente = await buscarInscricaoPorCpf(cpfLimpo)
  if (inscricaoExistente) {
    return respostaJaInscrito(inscricaoExistente)
  }

  const { data, error } = await supabaseAdmin
    .from("checkouts_pendentes")
    .insert({
      nome: parsed.data.nome,
      cpf: cpfLimpo,
      cidade: parsed.data.cidade,
      data_nascimento: dataNascimentoISO,
      telefone: parsed.data.telefone,
      tamanho_camisa: parsed.data.tamanhoCamisa,
      modalidade: parsed.data.modalidade,
      lote: 1,
      valor_pago: VALOR_INSCRICAO,
    })
    .select("id, qr_code_token")
    .single()

  if (error) {
    if (error.code === "23505") {
      const inscricaoConcorrente = await buscarInscricaoPorCpf(cpfLimpo)
      if (inscricaoConcorrente) {
        return respostaJaInscrito(inscricaoConcorrente)
      }
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

  // O checkout já foi gravado com sucesso — nada a partir daqui pode virar erro 5xx.
  const checkoutUrl = await gerarCheckoutDinamico({
    checkoutId: data.id,
    qrCodeToken: data.qr_code_token ?? "",
    nome: parsed.data.nome,
    telefone: parsed.data.telefone,
    modalidade: parsed.data.modalidade,
    valor: VALOR_INSCRICAO,
  })

  if (checkoutUrl !== LINK_INFINITEPAY) {
    const { error: erroUpdateCheckout } = await supabaseAdmin
      .from("checkouts_pendentes")
      .update({ checkout_url: checkoutUrl })
      .eq("id", data.id)

    if (erroUpdateCheckout) {
      console.error("[inscricao] falha ao salvar checkout_url:", erroUpdateCheckout)
    }
  }

  return NextResponse.json({
    success: true,
    qrCodeToken: data.qr_code_token,
    checkoutUrl,
  })
}
