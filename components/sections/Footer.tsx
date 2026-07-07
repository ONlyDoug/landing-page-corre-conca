import Image from 'next/image'
import { Camera, MessageCircle } from 'lucide-react'
import {
  EVENTO,
  NAV_LINKS,
  REDES_SOCIAIS,
  ORGANIZACAO_REALIZACAO,
  LOGO_PATH,
} from '@/lib/constants'

const dataEventoFormatada = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
}).format(new Date(EVENTO.dataEvento))

export default function Footer() {
  return (
    <footer className="bg-roxo-dark px-6 py-12 text-branco">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
        <Image
          src={LOGO_PATH}
          alt={`Logo ${EVENTO.nome}`}
          width={90}
          height={66}
          className="h-auto w-[70px]"
        />

        <div>
          <p className="text-lg font-bold">{EVENTO.nome}</p>
          <p className="text-sm text-branco/80">{EVENTO.edicao}</p>
          <p className="mt-1 text-sm text-branco/80">
            {dataEventoFormatada} &middot; {EVENTO.local}
          </p>
        </div>

        <nav aria-label="Links de navegação do rodapé">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="hover:text-branco/70">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href={REDES_SOCIAIS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram do Corre Conça"
            className="rounded-full border border-branco/30 p-2 hover:bg-branco/10"
          >
            <Camera className="h-5 w-5" aria-hidden="true" />
          </a>
          <a
            href={REDES_SOCIAIS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp do Corre Conça"
            className="rounded-full border border-branco/30 p-2 hover:bg-branco/10"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>

        <div className="w-full border-t border-branco/20 pt-6 text-xs text-branco/70">
          <p>Realização: {ORGANIZACAO_REALIZACAO}</p>
          <p className="mt-2">© 2026 Corre Conça. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
