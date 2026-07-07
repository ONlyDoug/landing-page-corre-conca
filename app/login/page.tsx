"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/supabase/database.types"
import { LOGO_PATH } from "@/lib/constants"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoading(true)

    const supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError("E-mail ou senha inválidos")
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    // VISUAL: container
    <div className="min-h-screen bg-roxo flex items-center justify-center p-4">
      {/* VISUAL: card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* VISUAL: titulo */}
        <div className="flex justify-center">
          <Image src={LOGO_PATH} alt="Corre Conça" width={140} height={102} priority className="h-auto w-[120px]" />
        </div>
        {/* VISUAL: subtitulo */}
        <p className="text-sm text-gray-500 text-center mb-8">Painel do Organizador</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            {/* VISUAL: label */}
            <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-1">
              E-mail
            </label>
            {/* VISUAL: input */}
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-roxo focus:border-transparent"
            />
          </div>

          <div className="mb-4">
            {/* VISUAL: label */}
            <label htmlFor="password" className="text-sm font-medium text-gray-700 block mb-1">
              Senha
            </label>
            {/* VISUAL: input */}
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-roxo focus:border-transparent"
            />
          </div>

          {/* VISUAL: botao */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-roxo hover:bg-roxo-dark text-white font-medium py-2.5 rounded-lg transition-colors mt-2 ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {error ? (
            // VISUAL: erro
            <p role="alert" className="text-red-600 text-sm mt-2 text-center">
              {error}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  )
}
