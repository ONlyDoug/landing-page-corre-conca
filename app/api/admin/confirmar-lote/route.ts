import { NextResponse } from "next/server"
import { createAuthClient } from "@/lib/supabase/auth-server"
import { supabaseAdmin } from "@/lib/supabase/server"

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

  const { data, error } = await supabaseAdmin
    .from("inscricoes")
    .update({ status_pagamento: "confirmado" })
    .in("id", idsValidos)
    .eq("status_pagamento", "pendente")
    .select("id, nome, status_pagamento")

  if (error) {
    console.error("[confirmar-lote] Erro ao atualizar em lote:", error)
    return NextResponse.json({ error: "erro_ao_atualizar" }, { status: 500 })
  }

  return NextResponse.json({
    atualizados: data.length,
    ids_atualizados: data.map((inscricao) => inscricao.id),
  })
}
