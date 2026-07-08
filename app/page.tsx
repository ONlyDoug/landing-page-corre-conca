import { Wrench } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-roxo px-6 py-12 text-center">
      <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
        Corre Conça
      </h1>

      <Wrench className="my-8 h-16 w-16 text-white" strokeWidth={1.5} />

      <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
        Site em Manutenção
      </h2>

      <p className="mt-4 max-w-md text-white/90">
        Estamos melhorando sua experiência. As inscrições voltam em breve!
      </p>

      <p className="mt-2 text-sm font-semibold text-white/80">
        06 de setembro de 2026 — Conceição da Feira – BA
      </p>

      <a
        href="https://wa.me/5575981937220"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 rounded-full bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600"
      >
        Dúvidas? Fale conosco pelo WhatsApp
      </a>
    </main>
  )
}
