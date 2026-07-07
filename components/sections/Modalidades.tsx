import { PersonStanding, Footprints, Trophy } from 'lucide-react'
import { MODALIDADES } from '@/lib/constants'

export function Modalidades() {
  return (
    <section id="modalidades" className="bg-white px-4 py-20 text-roxo-dark">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-extrabold sm:text-4xl">Modalidades</h2>
        <p className="mt-3 text-center text-roxo-dark/70">
          Escolha entre caminhada e corrida — ambas com o mesmo espírito solidário.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {MODALIDADES.map((modalidade) => {
            const ehCorrida = modalidade.slug === 'corrida_6km'

            return (
              <div
                key={modalidade.slug}
                className={`flex flex-col gap-4 rounded-2xl p-8 text-white shadow-lg ${
                  ehCorrida ? 'bg-roxo-dark' : 'bg-roxo-light'
                }`}
              >
                <div className="flex items-center justify-between">
                  {ehCorrida ? (
                    <Footprints className="h-10 w-10" aria-hidden="true" />
                  ) : (
                    <PersonStanding className="h-10 w-10" aria-hidden="true" />
                  )}
                  {ehCorrida ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-roxo-dark">
                      <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                      Premiação
                    </span>
                  ) : null}
                </div>

                <h3 className="text-2xl font-bold">{modalidade.nome}</h3>
                <p className="text-lg font-semibold text-white/90">{modalidade.distancia}</p>

                <a
                  href="#formulario"
                  className="mt-2 inline-flex items-center justify-center rounded-full bg-yellow-400 px-6 py-3 text-sm font-bold uppercase tracking-wide text-roxo-dark transition-colors hover:bg-yellow-300"
                >
                  Inscrever nesta modalidade
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
