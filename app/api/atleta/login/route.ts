import { NextResponse } from "next/server"
import { validarCPF } from "@/lib/validations"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "dados_invalidos" }, { status: 400 })
  }

  const b = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {}
  const cpf = typeof b.cpf === "string" ? b.cpf : null

  if (!cpf) {
    return NextResponse.json({ error: "dados_invalidos" }, { status: 400 })
  }

  const cpfLimpo = cpf.replace(/\D/g, "")
  if (!validarCPF(cpfLimpo)) {
    return NextResponse.json({ error: "dados_invalidos" }, { status: 400 })
  }

  const { data: inscricao, error } = await supabaseAdmin
    .from("inscricoes")
    .select("qr_code_token, nome")
    .eq("cpf", cpfLimpo)
    .maybeSingle()

  if (error) {
    console.error("[atleta/login] erro ao buscar inscricao:", error)
    return NextResponse.json({ error: "erro_interno" }, { status: 500 })
  }
  if (!inscricao) {
    return NextResponse.json({ error: "nao_encontrado" }, { status: 404 })
  }

  return NextResponse.json({ qrCodeToken: inscricao.qr_code_token, nome: inscricao.nome })
}
