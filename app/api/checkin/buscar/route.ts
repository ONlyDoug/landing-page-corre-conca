import { NextResponse } from "next/server"
import { createAuthClient } from "@/lib/supabase/auth-server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { normalizarNome } from "@/lib/validations"
import { mascararCPF } from "@/lib/utils"

const LIMITE_RESULTADOS = 10

type ResultadoBusca = {
  id: string
  nome: string
  cpfMascarado: string
  modalidade: string
  numero_bib: number | null
  presenca_confirmada: boolean | null
  qr_code_token: string | null
}

export async function GET(request: Request) {
  const supabaseAuth = await createAuthClient()
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "nao_autenticado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const termoBruto = (searchParams.get("q") ?? "").trim()

  if (termoBruto.length < 2) {
    return NextResponse.json({ error: "termo_muito_curto" }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("inscricoes")
    .select("id, nome, cpf, modalidade, numero_bib, status_pagamento, presenca_confirmada, qr_code_token")
    .eq("status_pagamento", "confirmado")

  if (error) {
    return NextResponse.json({ error: "erro_ao_buscar" }, { status: 500 })
  }

  const nomeAlvo = normalizarNome(termoBruto)
  const digitosAlvo = termoBruto.replace(/\D/g, "")
  const bibAlvo = /^\d{1,3}$/.test(termoBruto) ? parseInt(termoBruto, 10) : null

  const filtrados = (data ?? []).filter((row) => {
    if (normalizarNome(row.nome).includes(nomeAlvo)) return true
    if (digitosAlvo.length >= 3 && row.cpf.replace(/\D/g, "").includes(digitosAlvo)) return true
    if (bibAlvo !== null && row.numero_bib === bibAlvo) return true
    return false
  })

  const resultados: ResultadoBusca[] = filtrados
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
    .slice(0, LIMITE_RESULTADOS)
    .map((row) => ({
      id: row.id,
      nome: row.nome,
      cpfMascarado: mascararCPF(row.cpf),
      modalidade: row.modalidade,
      numero_bib: row.numero_bib,
      presenca_confirmada: row.presenca_confirmada,
      qr_code_token: row.qr_code_token,
    }))

  return NextResponse.json({ resultados })
}
