import Hero from "@/components/sections/Hero"
import Sobre from "@/components/sections/Sobre"
import { Modalidades } from "@/components/sections/Modalidades"
import Premiacao from "@/components/sections/Premiacao"
import Kit from "@/components/sections/Kit"
import { Lotes } from "@/components/sections/Lotes"
import Formulario from "@/components/sections/Formulario"
import Regulamento from "@/components/sections/Regulamento"
import FAQ from "@/components/sections/FAQ"
import Footer from "@/components/sections/Footer"
import StickyMobileCTA from "@/components/ui/StickyMobileCTA"

// Reforço de ISR: o countdown e o status de lote são calculados client-side
// (client components próprios), então isso apenas evita que a página fique
// congelada indefinidamente em builds totalmente estáticos.
export const revalidate = 3600

export default function Home() {
  return (
    <>
      {/* pb-28 no mobile reserva espaço para o StickyMobileCTA (fixed, ~90px com o link de acompanhamento) não cobrir o rodapé/formulário */}
      <main className="pb-28 md:pb-0">
        <Hero />
        <Sobre />
        <Modalidades />
        <Premiacao />
        <Kit />
        <Lotes />
        <Formulario />
        <Regulamento />
        <FAQ />
        <Footer />
      </main>
      <StickyMobileCTA />
    </>
  )
}
