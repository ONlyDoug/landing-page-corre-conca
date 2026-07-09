import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import type { Json } from "@/lib/supabase/database.types"
import { INFINITEPAY_HANDLE, INFINITEPAY_PAYMENT_CHECK_URL } from "@/lib/constants"

type VerificarPagamentoBody = {
  order_nsu?: string
  transaction_nsu?: string
  slug?: string
}

function parseBody(body: unknown): VerificarPagamentoBody {
  if (typeof body !== "object" || body === null) return {}
  const b = body as Record<string, unknown>
  return {
    order_nsu: typeof b.order_nsu === "string" ? b.order_nsu : undefined,
    transaction_nsu: typeof b.transaction_nsu === "string" ? b.transaction_nsu : undefined,
    slug: typeof b.slug === "string" ? b.slug : undefined,
  }
}

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

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
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
  if (!inscricao) {
    return NextResponse.json({ error: "nao_encontrado" }, { status: 404 })
  }
  if (inscricao.status_pagamento === "confirmado") {
    return NextResponse.json({ jaConfirmado: true })
  }

  let requestBody: unknown
  try {
    requestBody = await request.json()
  } catch {
    requestBody = {}
  }
  const campos = parseBody(requestBody)

  const payload = {
    handle: INFINITEPAY_HANDLE,
    order_nsu: campos.order_nsu ?? inscricao.id,
    transaction_nsu: campos.transaction_nsu ?? "",
    slug: campos.slug ?? "",
  }

  let resposta: InfinitePayPaymentCheckResponse
  let respostaCompleta: Json
  try {
    const res = await fetch(INFINITEPAY_PAYMENT_CHECK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    })
    const json = (await res.json()) as unknown
    respostaCompleta = json as Json
    resposta = parsePaymentCheckResponse(json)
  } catch (err) {
    console.error("[verificar-pagamento] falha ao consultar payment_check:", err)
    return NextResponse.json({
      erro: true,
      mensagem: "Não foi possível verificar. Tente novamente.",
    })
  }

  if (resposta.success === false || resposta.paid !== true) {
    return NextResponse.json({ confirmado: false })
  }

  const paidAmount = resposta.paid_amount ?? 0
  const valorEsperadoCentavos = Math.round(inscricao.valor_pago * 100)
  if (paidAmount < valorEsperadoCentavos) {
    console.error(
      `[verificar-pagamento] paid_amount (${paidAmount}) não cobre o valor esperado (${valorEsperadoCentavos}) da inscricao ${inscricao.id} — não confirmado automaticamente`
    )
    return NextResponse.json({ confirmado: false })
  }

  const { error: erroUpdate } = await supabaseAdmin
    .from("inscricoes")
    .update({ status_pagamento: "confirmado" })
    .eq("id", inscricao.id)

  if (erroUpdate) {
    console.error("[verificar-pagamento] falha ao confirmar pagamento da inscricao:", erroUpdate)
    return NextResponse.json({
      erro: true,
      mensagem: "Não foi possível verificar. Tente novamente.",
    })
  }

  const { error: erroInsertPagamento } = await supabaseAdmin.from("pagamentos").insert({
    inscricao_id: inscricao.id,
    infinitepay_id: campos.transaction_nsu ?? null,
    status: "confirmado_payment_check",
    valor: paidAmount / 100,
    payload: respostaCompleta,
  })

  if (erroInsertPagamento) {
    console.error("[verificar-pagamento] falha ao registrar log de pagamento:", erroInsertPagamento)
  }

  return NextResponse.json({ confirmado: true, captureMethod: resposta.capture_method ?? null })
}
