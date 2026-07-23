import { NextResponse } from "next/server"
import { createAuthClient } from "@/lib/supabase/auth-server"
import { finalizarCheckout } from "@/lib/confirmacaoCheckout"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_IDS = 100

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
    return NextResponse.json({ error: "ids_invalido" }, { status: 400 })
  }

  const ids = typeof body === "object" && body !== null ? (body as Record<string, unknown>).ids : undefined

  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: "ids_invalido" }, { status: 400 })
  }
  if (ids.length === 0) {
    return NextResponse.json({ error: "ids_vazio" }, { status: 400 })
  }
  if (ids.length > MAX_IDS) {
    return NextResponse.json({ error: "ids_excede_limite" }, { status: 400 })
  }

  const idsValidos = ids.filter((id): id is string => typeof id === "string" && UUID_REGEX.test(id))
  const idsInvalidos = ids.filter((id) => !idsValidos.includes(id as string))

  if (idsInvalidos.length > 0) {
    console.warn("[confirmar-lote] IDs inválidos descartados:", idsInvalidos)
  }
  if (idsValidos.length === 0) {
    return NextResponse.json({ error: "ids_invalido" }, { status: 400 })
  }

  // `idsValidos` são ids de `checkouts_pendentes` — cada um precisa do próprio DELETE+INSERT via
  // finalizarCheckout, não dá mais pra confirmar em um único UPDATE em massa.
  const idsAtualizados: string[] = []
  for (const id of idsValidos) {
    try {
      const resultado = await finalizarCheckout({ checkoutId: id, statusFinal: "confirmado", forcar: true })
      if (resultado.status === "confirmado") {
        idsAtualizados.push(resultado.inscricaoId)
      } else {
        console.error(`[confirmar-lote] falha ao confirmar checkout ${id}:`, resultado)
      }
    } catch (err) {
      console.error(`[confirmar-lote] erro inesperado ao confirmar checkout ${id}:`, err)
    }
  }

  return NextResponse.json({
    atualizados: idsAtualizados.length,
    ids_atualizados: idsAtualizados,
  })
}
