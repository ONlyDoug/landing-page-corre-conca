import { supabaseAdmin } from "@/lib/supabase/server"

type StatusFinal = "confirmado" | "cancelado"

type FinalizarCheckoutParams = {
  checkoutId: string
  statusFinal: StatusFinal
  /** Obrigatório a menos que `forcar` seja true — valida contra o valor esperado do checkout. */
  valorRecebidoCentavos?: number
  /** Pula a validação de valor — usado pelos fluxos administrativos. */
  forcar?: boolean
  transactionNsu?: string
  invoiceSlug?: string
}

type FinalizarCheckoutResultado =
  | { status: StatusFinal; inscricaoId: string; novo: boolean }
  | { status: "valor_insuficiente" }
  | { status: "nao_encontrado" }
  | { status: "erro"; erro: unknown }

function aguardar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function buscarInscricaoPorCheckoutOrigem(checkoutId: string): Promise<{ id: string } | null> {
  const { data } = await supabaseAdmin
    .from("inscricoes")
    .select("id")
    .eq("checkout_origem_id", checkoutId)
    .maybeSingle()
  return data
}

async function buscarInscricaoPorCpf(cpf: string): Promise<{ id: string } | null> {
  const { data } = await supabaseAdmin.from("inscricoes").select("id").eq("cpf", cpf).maybeSingle()
  return data
}

/**
 * Reivindica um checkout pendente e grava a inscrição definitiva em `inscricoes`.
 * Único ponto que faz essa transição — usado pelo webhook, pela verificação manual de pagamento
 * e pelos endpoints administrativos, para que a lógica de concorrência exista em um só lugar.
 *
 * Idempotência: um `checkoutId` só produz uma `inscricoes` row porque a reivindicação é um
 * `DELETE ... RETURNING` atômico na staging row — chamadas concorrentes para o mesmo id nunca
 * recebem a linha de volta mais de uma vez. A perdedora dessa corrida (ou um retry do mesmo
 * evento) resolve via `checkout_origem_id`, com um pequeno retry/backoff caso ainda esteja em
 * andamento o INSERT da vencedora. `cpf` UNIQUE em `inscricoes` é a última rede de segurança.
 */
export async function finalizarCheckout(params: FinalizarCheckoutParams): Promise<FinalizarCheckoutResultado> {
  const { checkoutId, statusFinal, valorRecebidoCentavos, forcar, transactionNsu, invoiceSlug } = params

  const { data: staged, error: erroStaged } = await supabaseAdmin
    .from("checkouts_pendentes")
    .select("*")
    .eq("id", checkoutId)
    .maybeSingle()

  if (erroStaged) {
    console.error("[finalizarCheckout] erro ao ler checkout pendente:", erroStaged)
    return { status: "erro", erro: erroStaged }
  }

  if (!staged) {
    for (const delay of [0, 250, 750]) {
      if (delay > 0) await aguardar(delay)
      const existente = await buscarInscricaoPorCheckoutOrigem(checkoutId)
      if (existente) return { status: statusFinal, inscricaoId: existente.id, novo: false }
    }
    return { status: "nao_encontrado" }
  }

  if (!forcar) {
    const valorEsperadoCentavos = Math.round(Number(staged.valor_pago) * 100)
    if ((valorRecebidoCentavos ?? 0) < valorEsperadoCentavos) {
      return { status: "valor_insuficiente" }
    }
  }

  const { data: reivindicada, error: erroDelete } = await supabaseAdmin
    .from("checkouts_pendentes")
    .delete()
    .eq("id", checkoutId)
    .select("*")
    .maybeSingle()

  if (erroDelete) {
    console.error("[finalizarCheckout] erro ao reivindicar checkout pendente:", erroDelete)
    return { status: "erro", erro: erroDelete }
  }

  if (!reivindicada) {
    for (const delay of [100, 300, 600]) {
      await aguardar(delay)
      const existente = await buscarInscricaoPorCheckoutOrigem(checkoutId)
      if (existente) return { status: statusFinal, inscricaoId: existente.id, novo: false }
    }
    return { status: "nao_encontrado" }
  }

  const { data: inserida, error: erroInsert } = await supabaseAdmin
    .from("inscricoes")
    .insert({
      nome: reivindicada.nome,
      cpf: reivindicada.cpf,
      cidade: reivindicada.cidade,
      data_nascimento: reivindicada.data_nascimento,
      telefone: reivindicada.telefone,
      tamanho_camisa: reivindicada.tamanho_camisa,
      modalidade: reivindicada.modalidade,
      lote: reivindicada.lote,
      valor_pago: reivindicada.valor_pago,
      status_pagamento: statusFinal,
      qr_code_token: reivindicada.qr_code_token,
      checkout_url: reivindicada.checkout_url,
      checkout_origem_id: checkoutId,
      transaction_nsu: transactionNsu ?? null,
      invoice_slug: invoiceSlug ?? null,
    })
    .select("id")
    .single()

  if (erroInsert) {
    if (erroInsert.code === "23505") {
      console.error(
        "[finalizarCheckout] colisão ao gravar inscrição (possível pagamento duplicado) — cpf:",
        reivindicada.cpf,
        "checkoutId:",
        checkoutId
      )
      const existente = await buscarInscricaoPorCpf(reivindicada.cpf)
      if (existente) return { status: statusFinal, inscricaoId: existente.id, novo: false }
    }
    console.error("[finalizarCheckout] erro ao gravar inscrição definitiva:", erroInsert)
    return { status: "erro", erro: erroInsert }
  }

  return { status: statusFinal, inscricaoId: inserida.id, novo: true }
}
