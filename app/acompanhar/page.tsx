"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2 } from "lucide-react"
import { maskCPF } from "@/lib/utils"
import { LOCALSTORAGE_QR_TOKEN_KEY } from "@/lib/constants"

const CAMPO_CPF =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-center text-lg tracking-widest text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-roxo/50"

export default function AcompanharPage() {
  const router = useRouter()
  const [cpf, setCpf] = useState("")
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    const tokenSalvo = window.localStorage.getItem(LOCALSTORAGE_QR_TOKEN_KEY)
    if (tokenSalvo) router.replace(`/acompanhar/${tokenSalvo}`)
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro(null)
    try {
      const res = await fetch("/api/atleta/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf }),
      })
      const data = (await res.json()) as { qrCodeToken?: string }
      if (res.ok && data.qrCodeToken) {
        window.localStorage.setItem(LOCALSTORAGE_QR_TOKEN_KEY, data.qrCodeToken)
        router.push(`/acompanhar/${data.qrCodeToken}`)
      } else {
        setErro("CPF não encontrado. Verifique se você já realizou sua inscrição.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-roxo to-roxo-dark p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <Search className="mx-auto mb-2 h-8 w-8 text-roxo" aria-hidden="true" />
        <h1 className="text-center text-xl font-bold text-roxo-dark">Acompanhar Inscrição</h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          Digite seu CPF para acessar sua inscrição
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="cpf" className="mb-1 block text-sm font-medium text-gray-700">
              CPF
            </label>
            <input
              id="cpf"
              type="text"
              inputMode="numeric"
              placeholder="000.000.000-00"
              className={CAMPO_CPF}
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
              required
            />
          </div>

          {erro && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-roxo py-3 font-medium text-white transition-colors hover:bg-roxo-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
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
