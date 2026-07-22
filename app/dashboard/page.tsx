import { supabaseAdmin } from "@/lib/supabase/server"
import { Users, CheckCircle, Hash, HelpCircle } from "lucide-react"
import { statusPagamentoLabel, statusPagamentoBadgeClasses } from "@/lib/utils"

function modalidadeLabel(modalidade: string) {
  return modalidade === "caminhada_3km" ? "Caminhada 3KM" : "Corrida 6KM"
}

export default async function DashboardPage() {
  const [
    { count: total },
    { count: confirmados },
    { count: comBib },
    { count: semBib },
    { data: ultimas },
  ] = await Promise.all([
    supabaseAdmin.from("inscricoes").select("*", { count: "exact", head: true }),
    supabaseAdmin
      .from("inscricoes")
      .select("*", { count: "exact", head: true })
      .eq("status_pagamento", "confirmado"),
    supabaseAdmin
      .from("inscricoes")
      .select("*", { count: "exact", head: true })
      .not("numero_bib", "is", null),
    supabaseAdmin
      .from("inscricoes")
      .select("*", { count: "exact", head: true })
      .is("numero_bib", null),
    supabaseAdmin
      .from("inscricoes")
      .select("nome, modalidade, status_pagamento, criado_em")
      .order("criado_em", { ascending: false })
      .limit(10),
  ])

  return (
    <div>
      {/* VISUAL: cards-resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* VISUAL: card-total */}
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="bg-purple-50 rounded-lg p-2.5 text-roxo">
            <Users />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{total ?? 0}</p>
            <p className="text-sm text-gray-500">Total Inscritos</p>
          </div>
        </div>

        {/* VISUAL: card-confirmados */}
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="bg-green-50 rounded-lg p-2.5 text-green-600">
            <CheckCircle />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{confirmados ?? 0}</p>
            <p className="text-sm text-gray-500">Confirmados</p>
          </div>
        </div>

        {/* VISUAL: card-com-bib */}
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="bg-purple-50 rounded-lg p-2.5 text-roxo">
            <Hash />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{comBib ?? 0}</p>
            <p className="text-sm text-gray-500">Com Bib</p>
          </div>
        </div>

        {/* VISUAL: card-sem-bib */}
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="bg-gray-100 rounded-lg p-2.5 text-gray-500">
            <HelpCircle />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{semBib ?? 0}</p>
            <p className="text-sm text-gray-500">Sem Bib</p>
          </div>
        </div>
      </div>

      {/* VISUAL: tabela-ultimas-inscricoes */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <p className="text-base font-semibold text-gray-800 p-5 border-b border-gray-100">Últimas Inscrições</p>

        <table className="w-full">
          <thead>
            <tr>
              <th className="text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3 text-left bg-gray-50">
                Nome
              </th>
              <th className="text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3 text-left bg-gray-50">
                Modalidade
              </th>
              <th className="text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3 text-left bg-gray-50">
                Status
              </th>
              <th className="text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3 text-left bg-gray-50">
                Data
              </th>
            </tr>
          </thead>
          <tbody>
            {(ultimas ?? []).map((row, index) => (
              // VISUAL: linha-tabela
              <tr key={`${row.nome}-${index}`} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-3.5 text-sm text-gray-700">{row.nome}</td>
                <td className="px-5 py-3.5 text-sm text-gray-700">{modalidadeLabel(row.modalidade)}</td>
                <td className="px-5 py-3.5 text-sm text-gray-700">
                  {/* VISUAL: status-badge */}
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusPagamentoBadgeClasses(row.status_pagamento)}`}>
                    {statusPagamentoLabel(row.status_pagamento)}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-700">
                  {row.criado_em ? new Date(row.criado_em).toLocaleDateString("pt-BR") : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
