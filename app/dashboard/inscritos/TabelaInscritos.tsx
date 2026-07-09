"use client"

import { useMemo, useState } from "react"
import { Loader2, CheckCircle } from "lucide-react"
import { mascararCPF, modalidadeLabel, formatBRL } from "@/lib/utils"

export interface InscricaoRow {
  id: string
  nome: string
  cpf: string
  cidade: string
  modalidade: "caminhada_3km" | "corrida_6km"
  lote: number
  valor_pago: number
  status_pagamento: "pendente" | "confirmado" | "cancelado"
  presenca_confirmada: boolean | null
  criado_em: string | null
  qr_code_token: string | null
}

interface TabelaInscritosProps {
  inscritos: InscricaoRow[]
}

export default function TabelaInscritos({ inscritos }: TabelaInscritosProps) {
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [filtroModalidade, setFiltroModalidade] = useState<string>("todos")
  const [filtroPresenca, setFiltroPresenca] = useState<string>("todos")
  const [busca, setBusca] = useState("")
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [dados, setDados] = useState(inscritos)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [loadingLote, setLoadingLote] = useState(false)
  const [resultadoLote, setResultadoLote] = useState<string | null>(null)

  const filtrados = useMemo(() => {
    return dados.filter((i) => {
      if (filtroStatus !== "todos" && i.status_pagamento !== filtroStatus) return false
      if (filtroModalidade !== "todos" && i.modalidade !== filtroModalidade) return false
      if (filtroPresenca === "presente" && !i.presenca_confirmada) return false
      if (filtroPresenca === "ausente" && i.presenca_confirmada) return false
      if (busca) {
        const b = busca.toLowerCase()
        const cpfLimpo = i.cpf.replace(/\D/g, "")
        if (!i.nome.toLowerCase().includes(b) && !cpfLimpo.includes(b)) return false
      }
      return true
    })
  }, [dados, filtroStatus, filtroModalidade, filtroPresenca, busca])

  const pendentesFiltrados = useMemo(
    () => filtrados.filter((i) => i.status_pagamento === "pendente"),
    [filtrados]
  )
  const todosPendentesSelecionados =
    pendentesFiltrados.length > 0 && pendentesFiltrados.every((i) => selecionados.has(i.id))
  const algunsPendentesSelecionados =
    pendentesFiltrados.some((i) => selecionados.has(i.id)) && !todosPendentesSelecionados

  const confirmarPagamento = async (id: string, novoStatus: "confirmado" | "cancelado") => {
    setLoading((prev) => ({ ...prev, [id]: true }))
    try {
      const res = await fetch(`/api/inscricao/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      })
      if (res.ok) {
        setDados((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status_pagamento: novoStatus } : i))
        )
      }
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }))
    }
  }

  const toggleSelecionado = (id: string) => {
    setSelecionados((prev) => {
      const novo = new Set(prev)
      if (novo.has(id)) {
        novo.delete(id)
      } else {
        novo.add(id)
      }
      return novo
    })
  }

  const toggleTodosFiltrados = () => {
    setSelecionados((prev) => {
      const novo = new Set(prev)
      if (todosPendentesSelecionados) {
        pendentesFiltrados.forEach((i) => novo.delete(i.id))
      } else {
        pendentesFiltrados.forEach((i) => novo.add(i.id))
      }
      return novo
    })
  }

  const confirmarLote = async () => {
    if (selecionados.size === 0) return
    setLoadingLote(true)
    try {
      const res = await fetch("/api/admin/confirmar-lote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selecionados) }),
      })
      const data = await res.json()
      if (res.ok) {
        setDados((prev) =>
          prev.map((i) =>
            selecionados.has(i.id) ? { ...i, status_pagamento: "confirmado" as const } : i
          )
        )
        setResultadoLote(`${data.atualizados} pagamentos confirmados`)
        setSelecionados(new Set())
        setTimeout(() => setResultadoLote(null), 4000)
      }
    } finally {
      setLoadingLote(false)
    }
  }

  return (
    <div>
      {/* VISUAL: barra-filtros */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por nome ou CPF..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full md:w-64 bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="todos">Todos os status</option>
          <option value="confirmado">Confirmado</option>
          <option value="pendente">Pendente</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <select
          value={filtroModalidade}
          onChange={(e) => setFiltroModalidade(e.target.value)}
          className="bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="todos">Todas</option>
          <option value="caminhada_3km">Caminhada 3KM</option>
          <option value="corrida_6km">Corrida 6KM</option>
        </select>
        <select
          value={filtroPresenca}
          onChange={(e) => setFiltroPresenca(e.target.value)}
          className="bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="todos">Todos</option>
          <option value="presente">Presentes</option>
          <option value="ausente">Ausentes</option>
        </select>
        <span className="text-sm text-gray-500 ml-auto self-center">
          {filtrados.length} inscritos encontrados
        </span>
      </div>

      {/* VISUAL: tabela-inscritos */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="w-10 px-4 py-3 text-left bg-gray-50 border-b">
                <input
                  type="checkbox"
                  checked={todosPendentesSelecionados}
                  ref={(el) => {
                    if (el) el.indeterminate = algunsPendentesSelecionados
                  }}
                  onChange={toggleTodosFiltrados}
                  disabled={pendentesFiltrados.length === 0}
                  aria-label="Selecionar todos os pendentes"
                />
              </th>
              <th className="text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 text-left bg-gray-50 border-b">
                Nome
              </th>
              <th className="text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 text-left bg-gray-50 border-b">
                CPF
              </th>
              <th className="text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 text-left bg-gray-50 border-b">
                Cidade
              </th>
              <th className="text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 text-left bg-gray-50 border-b">
                Modalidade
              </th>
              <th className="text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 text-left bg-gray-50 border-b">
                Lote
              </th>
              <th className="text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 text-left bg-gray-50 border-b">
                Valor
              </th>
              <th className="text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 text-left bg-gray-50 border-b">
                Status
              </th>
              <th className="text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 text-left bg-gray-50 border-b">
                Presença
              </th>
              <th className="text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 text-left bg-gray-50 border-b">
                Data
              </th>
              <th className="text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 text-left bg-gray-50 border-b">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((row) => (
              <tr
                key={row.id}
                className={`border-t border-gray-100 transition-colors ${
                  selecionados.has(row.id) ? "bg-purple-50 hover:bg-purple-50" : "hover:bg-gray-50"
                }`}
              >
                <td className="px-4 py-3">
                  {row.status_pagamento === "pendente" ? (
                    <input
                      type="checkbox"
                      checked={selecionados.has(row.id)}
                      onChange={() => toggleSelecionado(row.id)}
                      className="accent-purple-600"
                      aria-label={`Selecionar ${row.nome}`}
                    />
                  ) : (
                    <span className="inline-block h-4 w-4" />
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{row.nome}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{mascararCPF(row.cpf)}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{row.cidade}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {modalidadeLabel(row.modalidade)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">Lote {row.lote}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatBRL(row.valor_pago)}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {/* VISUAL: status-badge */}
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      row.status_pagamento === "confirmado"
                        ? "bg-green-100 text-green-800"
                        : row.status_pagamento === "pendente"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {row.status_pagamento}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {/* VISUAL: presenca-badge */}
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      row.presenca_confirmada ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {row.presenca_confirmada ? "✓ Presente" : "Ausente"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {row.criado_em ? new Date(row.criado_em).toLocaleDateString("pt-BR") : "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {/* VISUAL: acoes */}
                  <div className="flex gap-2">
                    {row.status_pagamento !== "confirmado" && (
                      <button
                        onClick={() => confirmarPagamento(row.id, "confirmado")}
                        disabled={loading[row.id]}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg"
                      >
                        {loading[row.id] ? <Loader2 size={14} className="animate-spin" /> : "Confirmar"}
                      </button>
                    )}
                    {row.status_pagamento !== "cancelado" && (
                      <button
                        onClick={() => confirmarPagamento(row.id, "cancelado")}
                        disabled={loading[row.id]}
                        className="bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-700 text-xs px-3 py-1.5 rounded-lg"
                      >
                        {loading[row.id] ? <Loader2 size={14} className="animate-spin" /> : "Cancelar"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VISUAL: barra-flutuante-lote */}
      {selecionados.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex min-w-80 items-center gap-4 rounded-2xl bg-gray-900 px-6 py-3 text-white shadow-2xl">
          <span className="text-sm font-medium text-gray-300">
            {selecionados.size} selecionado{selecionados.size > 1 ? "s" : ""}
          </span>
          <button
            onClick={confirmarLote}
            disabled={loadingLote}
            className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-400 disabled:opacity-50"
          >
            {loadingLote ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Confirmando...
              </>
            ) : (
              <>
                <CheckCircle size={15} />
                Confirmar pagamento
              </>
            )}
          </button>
          <button
            onClick={() => setSelecionados(new Set())}
            className="ml-auto text-sm text-gray-400 transition-colors hover:text-white"
          >
            Limpar
          </button>
        </div>
      )}

      {/* VISUAL: toast-resultado-lote */}
      {resultadoLote && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-green-600 px-5 py-3 text-white shadow-xl">
          <CheckCircle size={18} />
          <span className="text-sm font-medium">{resultadoLote}</span>
        </div>
      )}
    </div>
  )
}
