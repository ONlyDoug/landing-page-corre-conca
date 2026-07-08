"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2 } from "lucide-react"
import { maskCPF, maskDataNascimento } from "@/lib/utils"
import { LOCALSTORAGE_QR_TOKEN_KEY } from "@/lib/constants"

const CAMPO_BASE =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-roxo/50"

export default function AcompanharPage() {
  const router = useRouter()
  const [cpf, setCpf] = useState("")
  const [nome, setNome] = useState("")
  const [dataNascimento, setDataNascimento] = useState("")
  const [erro, setErro] = useState(false)
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    const tokenSalvo = window.localStorage.getItem(LOCALSTORAGE_QR_TOKEN_KEY)
    if (tokenSalvo) router.replace(`/acompanhar/${tokenSalvo}`)
  }, [router])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(false)
    setCarregando(true)
    try {
      const resposta = await fetch("/api/atleta/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf, nome, dataNascimento }),
      })

      if (!resposta.ok) {
        setErro(true)
        return
      }

      const { qrCodeToken } = (await resposta.json()) as { qrCodeToken: string }
      window.localStorage.setItem(LOCALSTORAGE_QR_TOKEN_KEY, qrCodeToken)
      router.push(`/acompanhar/${qrCodeToken}`)
    } catch {
      setErro(true)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-roxo to-roxo-dark p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <Search className="mx-auto mb-2 h-8 w-8 text-roxo" aria-hidden="true" />
        <h1 className="text-center text-xl font-bold text-roxo-dark">Acompanhar Inscrição</h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          Digite seus dados para encontrar sua inscrição
        </p>

        <form onSubmit={onSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="nome" className="mb-1 block text-sm font-medium text-gray-700">
              Nome Completo
            </label>
            <input
              id="nome"
              type="text"
              placeholder="Seu nome completo"
              className={CAMPO_BASE}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="cpf" className="mb-1 block text-sm font-medium text-gray-700">
              CPF
            </label>
            <input
              id="cpf"
              type="text"
              inputMode="numeric"
              placeholder="000.000.000-00"
              className={CAMPO_BASE}
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="dataNascimento" className="mb-1 block text-sm font-medium text-gray-700">
              Data de Nascimento
            </label>
            <input
              id="dataNascimento"
              type="text"
              inputMode="numeric"
              placeholder="00/00/0000"
              className={CAMPO_BASE}
              value={dataNascimento}
              onChange={(e) => setDataNascimento(maskDataNascimento(e.target.value))}
              required
            />
          </div>

          {erro && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Não encontramos uma inscrição com esses dados. Verifique e tente novamente.
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-roxo py-3 font-medium text-white transition-colors hover:bg-roxo-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {carregando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Buscando...
              </>
            ) : (
              "Buscar Inscrição"
            )}
          </button>
        </form>

        <a
          href="/#inscricao"
          className="mt-6 block text-center text-sm text-roxo hover:underline"
        >
          Ainda não se inscreveu?
        </a>
      </div>
    </main>
  )
}
