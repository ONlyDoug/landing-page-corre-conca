import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { gerarBibPNG } from "@/lib/gerarImagemAtleta"

export const runtime = "nodejs"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const { data: inscricao } = await supabaseAdmin
    .from("inscricoes")
    .select("nome, modalidade, numero_bib, status_pagamento")
    .eq("qr_code_token", token)
    .maybeSingle()

  if (!inscricao) {
    return NextResponse.json({ error: "nao_encontrado" }, { status: 404 })
  }
  if (inscricao.status_pagamento !== "confirmado") {
    return NextResponse.json({ error: "pagamento_nao_confirmado" }, { status: 403 })
  }
  if (inscricao.numero_bib === null) {
    return NextResponse.json({ error: "bib_nao_escolhido" }, { status: 400 })
  }

  const png = await gerarBibPNG({
    nome: inscricao.nome,
    numeroBib: inscricao.numero_bib,
    modalidade: inscricao.modalidade,
  })

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="bib-corre-conca-${inscricao.numero_bib}.png"`,
      "Cache-Control": "private, max-age=3600",
    },
  })
}
