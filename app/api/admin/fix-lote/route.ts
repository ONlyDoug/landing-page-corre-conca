import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Buscar todas inscrições lote 1 a partir de 27 de agosto
    const { data, error } = await supabaseAdmin
      .from("inscricoes")
      .select("id, nome, criado_em")
      .eq("lote", 1)
      .gte("criado_em", "2026-08-27T00:00:00Z")

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    if (data && data.length > 0) {
      // Atualizar para lote 2
      const ids = data.map(d => d.id)
      const { error: updateError } = await supabaseAdmin
        .from("inscricoes")
        .update({ lote: 2 })
        .in("id", ids)

      if (updateError) {
         return NextResponse.json({ error: updateError }, { status: 500 })
      }
      return NextResponse.json({ message: `Corrigidas ${data.length} inscrições para lote 2`, inscricoes: data })
    }

    return NextResponse.json({ message: "Nenhuma inscrição pra corrigir." })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
