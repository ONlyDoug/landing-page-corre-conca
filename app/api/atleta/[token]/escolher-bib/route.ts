import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

const MAX_TENTATIVAS_ALEATORIO = 5

type EscolherBibBody = {
  numero?: number
}

function parseBody(body: unknown): EscolherBibBody {
  if (typeof body !== "object" || body === null) return {}
  const b = body as Record<string, unknown>
  return { numero: typeof b.numero === "number" ? b.numero : undefined }
}

async function reservarNumeroEspecifico(
  inscricaoId: string,
  numero: number
): Promise<number | null> {
  const { data, error } = await supabaseAdmin
    .from("bibs")
    .update({ inscricao_id: inscricaoId, reservado_em: new Date().toISOString() })
    .eq("numero", numero)
    .is("inscricao_id", null)
    .select("numero")
    .maybeSingle()

  if (error) {
    console.error("[escolher-bib] erro ao reservar número específico:", error)
    return null
  }
  return data?.numero ?? null
}

async function reservarNumeroAleatorio(inscricaoId: string): Promise<number | null> {
  for (let tentativa = 0; tentativa < MAX_TENTATIVAS_ALEATORIO; tentativa++) {
    const { data: disponiveis, error: erroBusca } = await supabaseAdmin
      .from("bibs")
      .select("numero")
      .is("inscricao_id", null)

    if (erroBusca) {
      console.error("[escolher-bib] erro ao buscar números disponíveis:", erroBusca)
      return null
    }
    if (!disponiveis || disponiveis.length === 0) {
      return null
    }

    const numeroSorteado = disponiveis[Math.floor(Math.random() * disponiveis.length)].numero
    const reservado = await reservarNumeroEspecifico(inscricaoId, numeroSorteado)
    if (reservado !== null) return reservado
    // outro atleta reservou esse número entre o SELECT e o UPDATE — tenta de novo
  }
  return null
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const { data: inscricao, error: erroBusca } = await supabaseAdmin
    .from("inscricoes")
    .select("id, status_pagamento, numero_bib")
    .eq("qr_code_token", token)
    .maybeSingle()

  if (erroBusca) {
    console.error("[escolher-bib] erro ao buscar inscrição:", erroBusca)
    return NextResponse.json({ error: "erro_interno" }, { status: 500 })
  }
  if (!inscricao) {
    return NextResponse.json({ error: "nao_encontrado" }, { status: 404 })
  }
  if (inscricao.status_pagamento !== "confirmado") {
    return NextResponse.json({ error: "pagamento_nao_confirmado" }, { status: 403 })
  }
  if (inscricao.numero_bib !== null) {
    return NextResponse.json({ numero: inscricao.numero_bib, jaEscolhido: true })
  }

  const { numero } = parseBody(await request.json().catch(() => ({})))

  if (numero !== undefined && (!Number.isInteger(numero) || numero < 0 || numero > 500)) {
    return NextResponse.json({ error: "numero_invalido" }, { status: 400 })
  }

  const numeroReservado =
    numero !== undefined
      ? await reservarNumeroEspecifico(inscricao.id, numero)
      : await reservarNumeroAleatorio(inscricao.id)

  if (numeroReservado === null) {
    return NextResponse.json(
      {
        error:
          numero !== undefined ? "numero_indisponivel" : "sem_numeros_disponiveis_no_momento",
      },
      { status: numero !== undefined ? 409 : 503 }
    )
  }

  const { error: erroUpdate } = await supabaseAdmin
    .from("inscricoes")
    .update({ numero_bib: numeroReservado, bib_escolhido_em: new Date().toISOString() })
    .eq("id", inscricao.id)

  if (erroUpdate) {
    console.error("[escolher-bib] erro ao salvar número na inscrição:", erroUpdate)
    // libera o número reservado para não perdê-lo permanentemente por uma falha transitória
    await supabaseAdmin
      .from("bibs")
      .update({ inscricao_id: null, reservado_em: null })
      .eq("numero", numeroReservado)
      .eq("inscricao_id", inscricao.id)
    return NextResponse.json({ error: "erro_interno" }, { status: 500 })
  }

  return NextResponse.json({ numero: numeroReservado, jaEscolhido: false })
}
