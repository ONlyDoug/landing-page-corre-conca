import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { finalizarCheckout } from "@/lib/confirmacaoCheckout"
import type { Json } from "@/lib/supabase/database.types"
import { INFINITEPAY_HANDLE, INFINITEPAY_PAYMENT_CHECK_URL } from "@/lib/constants"

type InfinitePayPaymentCheckResponse = {
  success?: boolean
  paid?: boolean
  paid_amount?: number
  capture_method?: string
}

function parsePaymentCheckResponse(body: unknown): InfinitePayPaymentCheckResponse {
  if (typeof body !== "object" || body === null) return {}
  const b = body as Record<string, unknown>
  return {
    success: typeof b.success === "boolean" ? b.success : undefined,
    paid: typeof b.paid === "boolean" ? b.paid : undefined,
    paid_amount: typeof b.paid_amount === "number" ? b.paid_amount : undefined,
    capture_method: typeof b.capture_method === "string" ? b.capture_method : undefined,
  }
}

async function consultarPaymentCheck(
  orderNsu: string
): Promise<{ resposta: InfinitePayPaymentCheckResponse; respostaCompleta: Json } | { erro: unknown }> {
  // order_nsu nunca vem do cliente: é sempre o id do próprio checkout (inscrição ou staging),
  // o mesmo valor registrado na InfinitePay na criação do link dinâmico. Aceitar um order_nsu
  // arbitrário do body permitiria confirmar um checkout não pago reaproveitando o order_nsu de
  // um pagamento real de outro checkout.
  const payload = {
    handle: INFINITEPAY_HANDLE,
    order_nsu: orderNsu,
    transaction_nsu: "",
    slug: "",
  }

  try {
    const res = await fetch(INFINITEPAY_PAYMENT_CHECK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    })
    const json = (await res.json()) as unknown
    return { resposta: parsePaymentCheckResponse(json), respostaCompleta: json as Json }
  } catch (err) {
    return { erro: err }
  }
}

const RESPOSTA_ERRO_GENERICO = NextResponse.json({
  erro: true,
  mensagem: "Não foi possível verificar. Tente novamente.",
})

export async function POST(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const { data: inscricao, error: erroBusca } = await supabaseAdmin
    .from("inscricoes")
    .select("id, status_pagamento, valor_pago")
    .eq("qr_code_token", token)
    .maybeSingle()

  if (erroBusca) {
    console.error("[verificar-pagamento] erro ao buscar inscricao:", erroBusca)
    return NextResponse.json({ error: "erro_interno" }, { status: 500 })
  }

  // Compatibilidade: cobre checkouts iniciados antes da migração para checkouts_pendentes,
  // cuja linha ainda existe em `inscricoes` no estado antigo (pendente/aguardando_pagamento).
  if (inscricao) {
    if (inscricao.status_pagamento === "confirmado") {
      return NextResponse.json({ jaConfirmado: true })
    }

    const consulta = await consultarPaymentCheck(inscricao.id)
    if ("erro" in consulta) {
      console.error("[verificar-pagamento] falha ao consultar payment_check:", consulta.erro)
      return RESPOSTA_ERRO_GENERICO
    }
    const { resposta, respostaCompleta } = consulta

    if (resposta.success === false || resposta.paid !== true) {
      return NextResponse.json({ confirmado: false })
    }

    const paidAmount = resposta.paid_amount ?? 0
    const valorEsperadoCentavos = Math.round(inscricao.valor_pago * 100)
    if (paidAmount < valorEsperadoCentavos) {
      console.error(
        `[verificar-pagamento] paid_amount (${paidAmount}) não cobre o valor esperado (${valorEsperadoCentavos}) da inscricao legada ${inscricao.id}`
      )
      return NextResponse.json({ confirmado: false })
    }

    const { error: erroUpdate } = await supabaseAdmin
      .from("inscricoes")
      .update({ status_pagamento: "confirmado" })
      .eq("id", inscricao.id)

    if (erroUpdate) {
      console.error("[verificar-pagamento] falha ao confirmar pagamento da inscricao legada:", erroUpdate)
      return RESPOSTA_ERRO_GENERICO
    }

    const { error: erroInsertPagamento } = await supabaseAdmin.from("pagamentos").insert({
      inscricao_id: inscricao.id,
      infinitepay_id: null,
      status: "confirmado_payment_check",
      valor: paidAmount / 100,
      payload: respostaCompleta,
    })

    if (erroInsertPagamento) {
      console.error("[verificar-pagamento] falha ao registrar log de pagamento:", erroInsertPagamento)
    }

    return NextResponse.json({ confirmado: true, captureMethod: resposta.capture_method ?? null })
  }

  const { data: staged, error: erroBuscaStaged } = await supabaseAdmin
    .from("checkouts_pendentes")
    .select("id, valor_pago")
    .eq("qr_code_token", token)
    .maybeSingle()

  if (erroBuscaStaged) {
    console.error("[verificar-pagamento] erro ao buscar checkout pendente:", erroBuscaStaged)
    return NextResponse.json({ error: "erro_interno" }, { status: 500 })
  }
  if (!staged) {
    return NextResponse.json({ error: "nao_encontrado" }, { status: 404 })
  }

  const consulta = await consultarPaymentCheck(staged.id)
  if ("erro" in consulta) {
    console.error("[verificar-pagamento] falha ao consultar payment_check:", consulta.erro)
    return RESPOSTA_ERRO_GENERICO
  }
  const { resposta, respostaCompleta } = consulta

  if (resposta.success === false || resposta.paid !== true) {
    return NextResponse.json({ confirmado: false })
  }

  const paidAmount = resposta.paid_amount ?? 0
  const valorEsperadoCentavos = Math.round(staged.valor_pago * 100)
  if (paidAmount < valorEsperadoCentavos) {
    console.error(
      `[verificar-pagamento] paid_amount (${paidAmount}) não cobre o valor esperado (${valorEsperadoCentavos}) do checkout ${staged.id} — não confirmado automaticamente`
    )
    return NextResponse.json({ confirmado: false })
  }

  const resultado = await finalizarCheckout({
    checkoutId: staged.id,
    statusFinal: "confirmado",
    valorRecebidoCentavos: paidAmount,
  })

  if (resultado.status !== "confirmado") {
    console.error("[verificar-pagamento] falha ao finalizar checkout:", resultado)
    return RESPOSTA_ERRO_GENERICO
  }

  const { error: erroInsertPagamento } = await supabaseAdmin.from("pagamentos").insert({
    inscricao_id: resultado.inscricaoId,
    infinitepay_id: null,
    status: "confirmado_payment_check",
    valor: paidAmount / 100,
    payload: respostaCompleta,
  })

  if (erroInsertPagamento) {
    console.error("[verificar-pagamento] falha ao registrar log de pagamento:", erroInsertPagamento)
  }

  return NextResponse.json({ confirmado: true, captureMethod: resposta.capture_method ?? null })
}
