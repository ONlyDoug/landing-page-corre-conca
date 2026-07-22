import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { gerarCredencialPNG } from "@/lib/gerarImagemAtleta"

export const runtime = "nodejs"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const { data: inscricao } = await supabaseAdmin
    .from("inscricoes")
    .select("nome, modalidade, numero_bib, tamanho_camisa, status_pagamento, qr_code_token")
    .eq("qr_code_token", token)
    .maybeSingle()

  if (!inscricao) {
    return NextResponse.json({ error: "nao_encontrado" }, { status: 404 })
  }
  if (inscricao.status_pagamento !== "confirmado") {
    return NextResponse.json({ error: "pagamento_nao_confirmado" }, { status: 403 })
  }
  if (inscricao.numero_bib === null || !inscricao.qr_code_token) {
    return NextResponse.json({ error: "bib_nao_escolhido" }, { status: 400 })
  }

  const png = await gerarCredencialPNG({
    nome: inscricao.nome,
    numeroBib: inscricao.numero_bib,
    modalidade: inscricao.modalidade,
    tamanhoCamisa: inscricao.tamanho_camisa,
    qrCodeToken: inscricao.qr_code_token,
  })

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="credencial-corre-conca-${inscricao.numero_bib}.png"`,
      "Cache-Control": "private, max-age=3600",
    },
  })
}
