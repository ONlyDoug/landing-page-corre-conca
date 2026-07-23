import { supabaseAdmin } from "@/lib/supabase/server"
import { Users, DollarSign, Hash, CheckCircle } from "lucide-react"
import { modalidadeLabel, formatBRL, statusPagamentoLabel, statusPagamentoBadgeClasses } from "@/lib/utils"
import { TOTAL_BIBS, CAPACIDADE_TOTAL_VAGAS } from "@/lib/constants"

export default async function DashboardPage() {
  const [
    { data: confirmadosDados },
    { count: bibsEscolhidos },
    { count: checkinsFeitos },
    { data: ultimasInscricoes },
    { data: ultimosCheckins },
    { data: ultimosBibs },
  ] = await Promise.all([
    supabaseAdmin.from("inscricoes").select("valor_pago, modalidade").eq("status_pagamento", "confirmado"),
    supabaseAdmin
      .from("inscricoes")
      .select("*", { count: "exact", head: true })
      .eq("status_pagamento", "confirmado")
      .not("numero_bib", "is", null),
    supabaseAdmin
      .from("inscricoes")
      .select("*", { count: "exact", head: true })
      .eq("status_pagamento", "confirmado")
      .eq("presenca_confirmada", true),
    supabaseAdmin
      .from("inscricoes")
      .select("nome, modalidade, numero_bib, status_pagamento, criado_em")
      .eq("status_pagamento", "confirmado")
      .order("criado_em", { ascending: false })
      .limit(10),
    supabaseAdmin
      .from("inscricoes")
      .select("nome, modalidade, numero_bib, checkin_em")
      .eq("status_pagamento", "confirmado")
      .eq("presenca_confirmada", true)
      .order("checkin_em", { ascending: false })
      .limit(10),
    supabaseAdmin
      .from("inscricoes")
      .select("nome, numero_bib, modalidade, bib_escolhido_em")
      .eq("status_pagamento", "confirmado")
      .not("numero_bib", "is", null)
      .order("bib_escolhido_em", { ascending: false })
      .limit(5),
  ])

  const confirmados = confirmadosDados?.length ?? 0
  const arrecadado = (confirmadosDados ?? []).reduce((soma, r) => soma + Number(r.valor_pago), 0)
  const caminhadaCount = (confirmadosDados ?? []).filter((r) => r.modalidade === "caminhada_3km").length
  const corridaCount = (confirmadosDados ?? []).filter((r) => r.modalidade === "corrida_6km").length

  const bibsEscolhidosSeguro = bibsEscolhidos ?? 0
  const checkinsFeitosSeguro = checkinsFeitos ?? 0
  const bibsDisponiveis = TOTAL_BIBS - bibsEscolhidosSeguro
  const pctBibsDisponiveis = Math.round((bibsDisponiveis / TOTAL_BIBS) * 100)
  const pctBibsEscolhidos = Math.round((bibsEscolhidosSeguro / CAPACIDADE_TOTAL_VAGAS) * 100)
  const pctCheckins = Math.round((checkinsFeitosSeguro / CAPACIDADE_TOTAL_VAGAS) * 100)
  const maiorModalidade = Math.max(caminhadaCount, corridaCount, 1)

  return (
    <div>
      {/* Linha 1 — cards principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="bg-purple-50 rounded-lg p-2.5 text-roxo">
            <Users />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{confirmados}</p>
            <p className="text-sm text-gray-500">Confirmados</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="bg-green-50 rounded-lg p-2.5 text-green-600">
            <DollarSign />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{formatBRL(arrecadado)}</p>
            <p className="text-sm text-gray-500">Arrecadado</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="bg-blue-50 rounded-lg p-2.5 text-blue-600">
            <Hash />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {bibsEscolhidosSeguro}/{CAPACIDADE_TOTAL_VAGAS}
            </p>
            <p className="text-sm text-gray-500">Bibs Escolhidos</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="bg-emerald-50 rounded-lg p-2.5 text-emerald-600">
            <CheckCircle />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {checkinsFeitosSeguro}/{CAPACIDADE_TOTAL_VAGAS}
            </p>
            <p className="text-sm text-gray-500">Check-ins</p>
          </div>
        </div>
      </div>

      {/* Linha 2 — bibs, progresso, modalidade */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-800 mb-3">Bibs Disponíveis</p>
          <p className="text-2xl font-bold text-gray-800 mb-1">
            {bibsDisponiveis} <span className="text-sm font-normal text-gray-400">de {TOTAL_BIBS}</span>
          </p>
          <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
            <div className="bg-roxo h-3 rounded-full" style={{ width: `${pctBibsDisponiveis}%` }} />
          </div>
          <p className="text-sm text-gray-500 mt-2">{bibsDisponiveis} números disponíveis</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-800 mb-3">Progresso de Preparação</p>
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Bibs escolhidos</span>
              <span>{pctBibsEscolhidos}%</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-roxo h-2.5 rounded-full" style={{ width: `${pctBibsEscolhidos}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Check-ins feitos</span>
              <span>{pctCheckins}%</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${pctCheckins}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-800 mb-3">Por Modalidade</p>
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{modalidadeLabel("caminhada_3km")}</span>
              <span>{caminhadaCount}</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(caminhadaCount / maiorModalidade) * 100}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{modalidadeLabel("corrida_6km")}</span>
              <span>{corridaCount}</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-roxo h-2.5 rounded-full" style={{ width: `${(corridaCount / maiorModalidade) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Linha 3 — últimas inscrições e check-ins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-800 mb-2">Últimas Inscrições</p>
          {(ultimasInscricoes ?? []).length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Nenhuma inscrição ainda</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {(ultimasInscricoes ?? []).map((row, index) => (
                <div key={`${row.nome}-${index}`} className="py-2.5 flex items-center justify-between text-sm">
                  <div>
                    <p className="text-gray-800">{row.nome}</p>
                    <p className="text-xs text-gray-400">
                      {modalidadeLabel(row.modalidade)}
                      {row.numero_bib !== null ? ` · Nº ${row.numero_bib}` : ""}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusPagamentoBadgeClasses(row.status_pagamento)}`}>
                    {statusPagamentoLabel(row.status_pagamento)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* VISUAL: ultimos-bibs */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-800 mb-3">Últimos Bibs Gerados</p>
            {(ultimosBibs ?? []).length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Nenhum bib gerado ainda</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {(ultimosBibs ?? []).map((row, index) => (
                  <div key={`${row.nome}-${index}`} className="py-2.5 flex items-center justify-between text-sm">
                    <div>
                      <p className="text-gray-700">{row.nome}</p>
                      <p className="text-xs text-gray-400">{modalidadeLabel(row.modalidade)}</p>
                    </div>
                    <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      Nº {row.numero_bib}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-800 mb-2">Últimos Check-ins</p>
            {(ultimosCheckins ?? []).length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Nenhum check-in ainda</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {(ultimosCheckins ?? []).map((row, index) => (
                  <div key={`${row.nome}-${index}`} className="py-2.5 flex items-center justify-between text-sm">
                    <div>
                      <p className="text-gray-800">{row.nome}</p>
                      <p className="text-xs text-gray-400">{row.numero_bib !== null ? `Nº ${row.numero_bib}` : ""}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {row.checkin_em ? new Date(row.checkin_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "-"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
