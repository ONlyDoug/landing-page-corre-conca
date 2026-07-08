import { NextResponse } from "next/server"
import { validarCPF, parseDataNascimentoISO } from "@/lib/validations"
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
  const nome = typeof b.nome === "string" ? b.nome : null
  const dataNascimento = typeof b.dataNascimento === "string" ? b.dataNascimento : null

  if (!cpf || !nome || !dataNascimento) {
    return NextResponse.json({ error: "dados_invalidos" }, { status: 400 })
  }

  const cpfLimpo = cpf.replace(/\D/g, "")
  if (!validarCPF(cpfLimpo)) {
    return NextResponse.json({ error: "nao_encontrado" }, { status: 404 })
  }

  const dataNascimentoISO = parseDataNascimentoISO(dataNascimento)
  if (!dataNascimentoISO) {
    return NextResponse.json({ error: "nao_encontrado" }, { status: 404 })
  }

  const { data: inscricao, error } = await supabaseAdmin
    .from("inscricoes")
    .select("nome, data_nascimento, qr_code_token")
    .eq("cpf", cpfLimpo)
    .maybeSingle()

  if (error) {
    console.error("[atleta/login] erro ao buscar inscricao:", error)
    return NextResponse.json({ error: "erro_interno" }, { status: 500 })
  }

  const nomeConfere = inscricao?.nome.trim().toLowerCase() === nome.trim().toLowerCase()
  const dataConfere = inscricao?.data_nascimento === dataNascimentoISO

  if (!inscricao || !nomeConfere || !dataConfere) {
    // Mensagem genérica sempre igual — nunca revelar qual critério falhou.
    return NextResponse.json({ error: "nao_encontrado" }, { status: 404 })
  }

  return NextResponse.json({ qrCodeToken: inscricao.qr_code_token })
}
