import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import * as xlsx from "xlsx"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { data, error } = await supabaseAdmin
      .from("inscricoes")
      .select("*")
      .eq("lote", 2)
      .eq("status_pagamento", "confirmado")
      .order("criado_em", { ascending: true })

    if (error) {
      return NextResponse.json({ error: "Erro ao buscar inscrições", details: error }, { status: 500 })
    }

    // Se não houver dados, retorna um aviso ou um Excel vazio.
    const records = data && data.length > 0 ? data : [{ mensagem: "Nenhuma inscrição no lote 2 confirmada ainda." }]

    const worksheet = xlsx.utils.json_to_sheet(records)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, "Lote 2")
    
    // Gera o buffer do Excel via base64 para evitar erros em ambientes serverless
    const excelBase64 = xlsx.write(workbook, { bookType: "xlsx", type: "base64" })
    const excelBuffer = Buffer.from(excelBase64, "base64")

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="Inscricoes_Lote2.xlsx"'
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: "Erro interno", details: err.message }, { status: 500 })
  }
}
