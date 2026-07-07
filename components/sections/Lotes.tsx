import { LOTES } from '@/lib/constants'
import { LoteCard } from '@/components/ui/LoteCard'

export function Lotes() {
  return (
    <section id="inscricao" className="bg-roxo-dark px-4 py-20 text-white">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-extrabold sm:text-4xl">Inscrições</h2>
        <p className="mt-3 text-center text-white/80">
          Garanta sua vaga na Corre Conça e escolha o lote atual.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {LOTES.map((lote) => (
            <LoteCard key={lote.numero} lote={lote} />
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-white/70">
          ⚠️ Não haverá reembolso, exceto conforme Art. 49 do CDC
        </p>
      </div>
    </section>
  )
}
