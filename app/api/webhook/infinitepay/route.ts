import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import type { Json } from "@/lib/supabase/database.types"

type InfinitePayWebhookPayload = {
  invoice_slug?: string
  amount?: number
  paid_amount?: number
  installments?: number
  capture_method?: string
  transaction_nsu?: string
  order_nsu?: string
  receipt_url?: string
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function parseWebhookPayload(body: unknown): InfinitePayWebhookPayload {
  if (typeof body !== "object" || body === null) return {}
  const b = body as Record<string, unknown>
  return {
    invoice_slug: typeof b.invoice_slug === "string" ? b.invoice_slug : undefined,
    amount: typeof b.amount === "number" ? b.amount : undefined,
    paid_amount: typeof b.paid_amount === "number" ? b.paid_amount : undefined,
    installments: typeof b.installments === "number" ? b.installments : undefined,
    capture_method: typeof b.capture_method === "string" ? b.capture_method : undefined,
    transaction_nsu: typeof b.transaction_nsu === "string" ? b.transaction_nsu : undefined,
    order_nsu: typeof b.order_nsu === "string" ? b.order_nsu : undefined,
    receipt_url: typeof b.receipt_url === "string" ? b.receipt_url : undefined,
  }
}

// A InfinitePay não envia secret/token no header. A segurança vem de gravar o
// log completo do payload sempre, e só confirmar o pagamento na inscrição
// quando order_nsu bater com um UUID de inscrição real.
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ received: false }, { status: 400 })
  }

  const payload = body as Json
  const campos = parseWebhookPayload(body)

  const { data: pagamentoInserido, error: erroInsertPagamento } = await supabaseAdmin
    .from("pagamentos")
    .insert({
      inscricao_id: null,
      infinitepay_id: campos.invoice_slug ?? null,
      status: "recebido",
      valor: campos.paid_amount != null ? campos.paid_amount / 100 : null,
      payload,
    })
    .select("id")
    .single()

  if (erroInsertPagamento) {
    console.error("[webhook/infinitepay] falha ao registrar pagamento", erroInsertPagamento)
  }

  const orderNsu = campos.order_nsu
  if (orderNsu && UUID_REGEX.test(orderNsu)) {
    const { data: inscricao, error: erroBuscaInscricao } = await supabaseAdmin
      .from("inscricoes")
      .select("id, valor_pago")
      .eq("id", orderNsu)
      .maybeSingle()

    if (erroBuscaInscricao) {
      console.error("[webhook/infinitepay] falha ao buscar inscricao", erroBuscaInscricao)
    } else if (inscricao) {
      if (pagamentoInserido) {
        const { error: erroUpdatePagamento } = await supabaseAdmin
          .from("pagamentos")
          .update({ inscricao_id: orderNsu })
          .eq("id", pagamentoInserido.id)

        if (erroUpdatePagamento) {
          console.error("[webhook/infinitepay] falha ao vincular pagamento à inscricao", erroUpdatePagamento)
        }
      }

      const valorRecebido = campos.paid_amount != null ? campos.paid_amount / 100 : null
      if (valorRecebido != null && valorRecebido >= inscricao.valor_pago) {
        const { error: erroUpdateInscricao } = await supabaseAdmin
          .from("inscricoes")
          .update({ status_pagamento: "confirmado" })
          .eq("id", orderNsu)

        if (erroUpdateInscricao) {
          console.error("[webhook/infinitepay] falha ao confirmar pagamento da inscricao", erroUpdateInscricao)
        }
      } else {
        console.error(
          `[webhook/infinitepay] valor recebido (${String(valorRecebido)}) não cobre o valor esperado (${inscricao.valor_pago}) da inscricao ${orderNsu} — pagamento registrado, mas não confirmado automaticamente`
        )
      }
    }
  }

  return NextResponse.json({ received: true })
}
