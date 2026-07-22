import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  // ATENÇÃO: rota pública — nunca adicionar cpf, data_nascimento, telefone ou id neste select.
  const { data: inscricao, error } = await supabaseAdmin
    .from("inscricoes")
    .select(
      "nome, modalidade, numero_bib, valor_pago, status_pagamento, presenca_confirmada, criado_em, tamanho_camisa, cidade, checkout_url"
    )
    .eq("qr_code_token", token)
    .maybeSingle()

  if (error) {
    console.error("[atleta/token] erro ao buscar inscricao:", error)
    return NextResponse.json({ error: "erro_interno" }, { status: 500 })
  }
  if (!inscricao) {
    return NextResponse.json({ error: "nao_encontrado" }, { status: 404 })
  }

  return NextResponse.json({ inscricao })
}
