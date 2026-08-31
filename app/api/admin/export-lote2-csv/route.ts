import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

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
      return NextResponse.json({ error: "Erro ao buscar", details: error }, { status: 500 })
    }

    const records = data && data.length > 0 ? data : []
    
    if (records.length === 0) {
      return new NextResponse("Nenhuma inscrição no lote 2 confirmada ainda.", { status: 200 })
    }
    
    // Pega as chaves
    const keys = Object.keys(records[0])
    
    // Converte pra CSV
    let csvString = keys.join(";") + "\n"
    for (const record of records) {
      csvString += keys.map(k => {
        let val = (record as any)[k]
        if (val === null || val === undefined) val = ""
        // Escapa aspas
        const str = String(val).replace(/"/g, '""')
        return `"${str}"`
      }).join(";") + "\n"
    }
    
    // Adiciona BOM para o Excel abrir UTF-8 perfeitamente
    const BOM = "\uFEFF";
    const csvWithBom = BOM + csvString;

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="Inscricoes_Lote2.csv"'
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: "Erro interno", details: err.message }, { status: 500 })
  }
}
