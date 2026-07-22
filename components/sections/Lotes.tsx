import { VALOR_INSCRICAO, CONDICAO_INSCRICAO } from '@/lib/constants'
import { formatBRL } from '@/lib/utils'

export function Lotes() {
  return (
    <section id="inscricao" className="bg-roxo-dark px-4 py-20 text-white">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-extrabold sm:text-4xl">Inscrições</h2>
        <p className="mt-3 text-center text-white/80">
          Garanta sua vaga na Corre Conça.
        </p>

        <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-lg">
          <p className="text-4xl font-extrabold">{formatBRL(VALOR_INSCRICAO)}</p>
          <p className="mt-2 text-sm text-white/80">{CONDICAO_INSCRICAO}</p>

          <a
            href="#formulario"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-yellow-400 px-6 py-3 text-sm font-bold uppercase tracking-wide text-roxo-dark transition-colors hover:bg-yellow-300"
          >
            Inscrever-se &rarr;
          </a>
        </div>

        <p className="mt-8 text-center text-sm text-white/70">
          ⚠️ Não haverá reembolso, exceto conforme Art. 49 do CDC
        </p>
      </div>
    </section>
  )
}
