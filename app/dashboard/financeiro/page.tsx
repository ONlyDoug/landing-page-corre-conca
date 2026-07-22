import { supabaseAdmin } from "@/lib/supabase/server"
import { formatBRL } from "@/lib/utils"
import { TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react"
import GraficoEvolucao from "./GraficoEvolucao"

export default async function FinanceiroPage() {
  const [
    { count: confirmados },
    { count: pendentes },
    { count: caminhada },
    { count: corrida },
    { data: arrecadadoData },
    { data: pendenteData },
    { data: evolucao },
  ] = await Promise.all([
    supabaseAdmin.from("inscricoes").select("*", { count: "exact", head: true }).eq("status_pagamento", "confirmado"),
    supabaseAdmin.from("inscricoes").select("*", { count: "exact", head: true }).in("status_pagamento", ["pendente", "aguardando_pagamento"]),
    supabaseAdmin.from("inscricoes").select("*", { count: "exact", head: true }).eq("modalidade", "caminhada_3km"),
    supabaseAdmin.from("inscricoes").select("*", { count: "exact", head: true }).eq("modalidade", "corrida_6km"),
    supabaseAdmin.from("inscricoes").select("valor_pago").eq("status_pagamento", "confirmado"),
    supabaseAdmin.from("inscricoes").select("valor_pago").in("status_pagamento", ["pendente", "aguardando_pagamento"]),
    supabaseAdmin.from("inscricoes").select("criado_em").order("criado_em", { ascending: true }),
  ])

  const totalArrecadado = (arrecadadoData ?? []).reduce((s, r) => s + Number(r.valor_pago), 0)
  const totalPendente = (pendenteData ?? []).reduce((s, r) => s + Number(r.valor_pago), 0)

  const porDia = (evolucao ?? []).reduce<Record<string, number>>((acc, r) => {
    if (!r.criado_em) return acc
    const dia = new Date(r.criado_em).toLocaleDateString("pt-BR")
    acc[dia] = (acc[dia] ?? 0) + 1
    return acc
  }, {})
  const evolucaoGrafico = Object.entries(porDia).map(([data, total]) => ({ data, total }))

  const totalModalidade = (caminhada ?? 0) + (corrida ?? 0)

  return (
    <div>
      {/* VISUAL: cards-financeiros */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="bg-green-50 rounded-lg p-2.5 text-green-600">
            <TrendingUp />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{formatBRL(totalArrecadado)}</p>
            <p className="text-sm text-gray-500">Total Arrecadado</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="bg-yellow-50 rounded-lg p-2.5 text-yellow-600">
            <Clock />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{formatBRL(totalPendente)}</p>
            <p className="text-sm text-gray-500">A Confirmar</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="bg-green-50 rounded-lg p-2.5 text-green-600">
            <CheckCircle />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{confirmados ?? 0}</p>
            <p className="text-sm text-gray-500">Confirmados</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="bg-yellow-50 rounded-lg p-2.5 text-yellow-600">
            <AlertCircle />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{pendentes ?? 0}</p>
            <p className="text-sm text-gray-500">Pendentes</p>
          </div>
        </div>
      </div>

      {/* VISUAL: bloco-modalidade */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-base font-semibold text-gray-800 mb-4">Por Modalidade</p>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <p>Caminhada 3KM</p>
              <span>{caminhada ?? 0}</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2">
              <div
                className="bg-purple-600 rounded-full h-2"
                style={{ width: totalModalidade ? `${((caminhada ?? 0) / totalModalidade) * 100}%` : "0%" }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <p>Corrida 6KM</p>
              <span>{corrida ?? 0}</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2">
              <div
                className="bg-purple-600 rounded-full h-2"
                style={{ width: totalModalidade ? `${((corrida ?? 0) / totalModalidade) * 100}%` : "0%" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* VISUAL: grafico-evolucao */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <p className="text-base font-semibold text-gray-800 mb-4">Inscrições por Dia</p>
        <GraficoEvolucao dados={evolucaoGrafico} />
      </div>
    </div>
  )
}
