"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, CheckCircle, X } from "lucide-react"
import { maskCPF, maskTelefone, maskDataNascimento } from "@/lib/utils"
import { VALOR_INSCRICAO, MODALIDADES, TAMANHOS_CAMISA } from "@/lib/constants"

type FormState = {
  nome: string
  cpf: string
  cidade: string
  dataNascimento: string
  telefone: string
  tamanhoCamisa: string
  modalidade: string
  valorPago: string
  observacao: string
}

const FORM_INICIAL: FormState = {
  nome: "",
  cpf: "",
  cidade: "",
  dataNascimento: "",
  telefone: "",
  tamanhoCamisa: "",
  modalidade: "",
  valorPago: String(VALOR_INSCRICAO.toFixed(2)),
  observacao: "",
}

type ErroCampos = Partial<Record<keyof FormState, string>>

type InscricaoManualResponse = {
  success?: boolean
  error?: string
  errors?: { fieldErrors?: Record<string, string[] | undefined> }
}

interface NovaInscricaoManualProps {
  isOpen: boolean
  onClose: () => void
  onCriada: () => void
}

export default function NovaInscricaoManual({ isOpen, onClose, onCriada }: NovaInscricaoManualProps) {
  const [form, setForm] = useState<FormState>(FORM_INICIAL)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [errosCampos, setErrosCampos] = useState<ErroCampos>({})
  const [sucesso, setSucesso] = useState(false)

  function fechar() {
    setForm(FORM_INICIAL)
    setErro(null)
    setErrosCampos({})
    setSucesso(false)
    onClose()
  }

  async function salvar() {
    setSalvando(true)
    setErro(null)
    setErrosCampos({})
    try {
      const res = await fetch("/api/admin/inscricao-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = (await res.json()) as InscricaoManualResponse

      if (res.ok) {
        setSucesso(true)
        setTimeout(() => {
          setForm(FORM_INICIAL)
          setSucesso(false)
          onCriada()
        }, 1200)
        return
      }

      if (data.error === "cpf_ja_cadastrado") {
        setErrosCampos({ cpf: "Este CPF já está cadastrado no sistema." })
        return
      }

      if (data.errors?.fieldErrors) {
        const campos: ErroCampos = {}
        for (const [campo, mensagens] of Object.entries(data.errors.fieldErrors)) {
          if (mensagens && mensagens.length > 0) campos[campo as keyof FormState] = mensagens[0]
        }
        setErrosCampos(campos)
        return
      }

      setErro("Erro ao criar inscrição. Verifique os dados.")
    } catch {
      setErro("Erro ao criar inscrição. Tente novamente.")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-roxo-dark/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nova-inscricao-manual-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="nova-inscricao-manual-title" className="text-lg font-bold text-gray-800">
                Nova Inscrição Manual
              </h2>
              <button
                type="button"
                onClick={fechar}
                aria-label="Fechar"
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" aria-hidden="true" />
              <p className="text-xs text-amber-800">
                Use apenas para pagamentos recebidos fora do checkout (Pix manual).
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="nim-nome">
                  Nome completo
                </label>
                <input
                  id="nim-nome"
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                />
                {errosCampos.nome && <p className="mt-1 text-xs text-red-600">{errosCampos.nome}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="nim-cpf">
                  CPF
                </label>
                <input
                  id="nim-cpf"
                  type="text"
                  value={form.cpf}
                  onChange={(e) => setForm((f) => ({ ...f, cpf: maskCPF(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                />
                {errosCampos.cpf && <p className="mt-1 text-xs text-red-600">{errosCampos.cpf}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="nim-cidade">
                  Cidade
                </label>
                <input
                  id="nim-cidade"
                  type="text"
                  value={form.cidade}
                  onChange={(e) => setForm((f) => ({ ...f, cidade: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                />
                {errosCampos.cidade && <p className="mt-1 text-xs text-red-600">{errosCampos.cidade}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="nim-nascimento">
                  Data de Nascimento
                </label>
                <input
                  id="nim-nascimento"
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={form.dataNascimento}
                  onChange={(e) => setForm((f) => ({ ...f, dataNascimento: maskDataNascimento(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                />
                {errosCampos.dataNascimento && (
                  <p className="mt-1 text-xs text-red-600">{errosCampos.dataNascimento}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="nim-telefone">
                  Telefone
                </label>
                <input
                  id="nim-telefone"
                  type="text"
                  placeholder="(75) 99999-9999"
                  value={form.telefone}
                  onChange={(e) => setForm((f) => ({ ...f, telefone: maskTelefone(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                />
                {errosCampos.telefone && <p className="mt-1 text-xs text-red-600">{errosCampos.telefone}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="nim-camisa">
                  Tamanho da Camiseta
                </label>
                <select
                  id="nim-camisa"
                  value={form.tamanhoCamisa}
                  onChange={(e) => setForm((f) => ({ ...f, tamanhoCamisa: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                >
                  <option value="">Selecione...</option>
                  {TAMANHOS_CAMISA.map((tamanho) => (
                    <option key={tamanho} value={tamanho}>
                      {tamanho}
                    </option>
                  ))}
                </select>
                {errosCampos.tamanhoCamisa && (
                  <p className="mt-1 text-xs text-red-600">{errosCampos.tamanhoCamisa}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="nim-modalidade">
                  Modalidade
                </label>
                <select
                  id="nim-modalidade"
                  value={form.modalidade}
                  onChange={(e) => setForm((f) => ({ ...f, modalidade: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                >
                  <option value="">Selecione...</option>
                  {MODALIDADES.map((m) => (
                    <option key={m.slug} value={m.slug}>
                      {m.nome} {m.distancia}
                    </option>
                  ))}
                </select>
                {errosCampos.modalidade && <p className="mt-1 text-xs text-red-600">{errosCampos.modalidade}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="nim-valor">
                  Valor Pago
                </label>
                <input
                  id="nim-valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.valorPago}
                  onChange={(e) => setForm((f) => ({ ...f, valorPago: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="nim-observacao">
                  Observação
                </label>
                <textarea
                  id="nim-observacao"
                  placeholder='Ex: "Pix recebido dia 10/08, comprovante enviado no WhatsApp"'
                  value={form.observacao}
                  onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                />
              </div>
            </div>

            {erro && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {erro}
              </div>
            )}

            {sucesso && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                <CheckCircle size={16} aria-hidden="true" />
                Inscrição criada com sucesso!
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={fechar}
                className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm text-gray-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvar}
                disabled={salvando}
                className="flex-1 rounded-lg bg-roxo py-2.5 text-sm font-medium text-white hover:bg-roxo-dark disabled:opacity-50"
              >
                {salvando ? "Salvando..." : "Criar Inscrição Confirmada"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
