import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import * as xlsx from "xlsx"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { data, error } = await supabaseAdmin
    .from("inscricoes")
    .select("*")
    .eq("lote", 2)
    .eq("status_pagamento", "confirmado")
    .order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: "Erro ao buscar inscrições" }, { status: 500 })
  }

  // Se não houver dados, retorna um aviso ou um Excel vazio.
  const records = data && data.length > 0 ? data : [{ mensagem: "Nenhuma inscrição no lote 2 confirmada ainda." }]

  const worksheet = xlsx.utils.json_to_sheet(records)
  const workbook = xlsx.utils.book_new()
  xlsx.utils.book_append_sheet(workbook, worksheet, "Lote 2")
  
  // Gera o buffer do Excel
  const excelBuffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" })

  return new NextResponse(excelBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="Inscricoes_Lote2.xlsx"'
    }
  })
}
