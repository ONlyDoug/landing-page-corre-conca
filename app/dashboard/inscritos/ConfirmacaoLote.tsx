"use client"

import { useState } from "react"
import { CheckSquare, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { formatBRL } from "@/lib/utils"

type InscritoPendente = {
  id: string
  nome: string
  valor_pago: number
}

interface ConfirmacaoLoteProps {
  inscritosPendentes: InscritoPendente[]
}

export default function ConfirmacaoLote({ inscritosPendentes }: ConfirmacaoLoteProps) {
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<{ atualizados: number } | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const toggleTodos = () => {
    if (selecionados.size === inscritosPendentes.length) {
      setSelecionados(new Set())
    } else {
      setSelecionados(new Set(inscritosPendentes.map((i) => i.id)))
    }
  }

  const toggleUm = (id: string) => {
    setSelecionados((atual) => {
      const novo = new Set(atual)
      if (novo.has(id)) {
        novo.delete(id)
      } else {
        novo.add(id)
      }
      return novo
    })
  }

  const confirmarLote = async () => {
    if (selecionados.size === 0) return
    setLoading(true)
    setErro(null)
    try {
      const res = await fetch("/api/admin/confirmar-lote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selecionados) }),
      })
      const data = await res.json()
      if (res.ok) {
        setResultado(data)
        setSelecionados(new Set())
        setTimeout(() => window.location.reload(), 2000)
      } else {
        setErro("Erro ao confirmar pagamentos. Tente novamente.")
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-6 overflow-hidden rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 p-5">
        <div className="flex items-center gap-2">
          <CheckSquare className="text-purple-600" size={20} aria-hidden="true" />
          <span className="font-semibold text-gray-800">Confirmação em Lote</span>
        </div>
        <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800">
          {inscritosPendentes.length} pendentes
        </span>
      </div>

      {inscritosPendentes.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">
          <CheckCircle className="mx-auto mb-2 text-green-400" size={24} aria-hidden="true" />
          Nenhum pagamento pendente
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-5 py-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={selecionados.size === inscritosPendentes.length}
                onChange={toggleTodos}
              />
              Selecionar todos
            </label>
            <span className="text-sm text-gray-500">{selecionados.size} selecionados</span>
            {selecionados.size > 0 && (
              <button
                type="button"
                onClick={confirmarLote}
                disabled={loading}
                className="ml-auto flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-70"
              >
                {loading && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
                {loading ? "Confirmando..." : `Confirmar pagamento (${selecionados.size})`}
              </button>
            )}
          </div>

          <div className="max-h-80 divide-y divide-gray-100 overflow-y-auto">
            {inscritosPendentes.map((inscrito) => (
              <div key={inscrito.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selecionados.has(inscrito.id)}
                  onChange={() => toggleUm(inscrito.id)}
                />
                <span className="text-sm font-medium text-gray-800">{inscrito.nome}</span>
                <span className="ml-auto text-sm text-gray-500">{formatBRL(inscrito.valor_pago)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {resultado && (
        <div className="m-5 rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle className="mr-2 inline text-green-600" size={20} aria-hidden="true" />
          <span className="text-green-800">
            {resultado.atualizados} pagamentos confirmados com sucesso! Atualizando...
          </span>
        </div>
      )}

      {erro && (
        <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mr-2 inline text-red-600" size={20} aria-hidden="true" />
          <span className="text-red-700">{erro}</span>
        </div>
      )}
    </div>
  )
}
