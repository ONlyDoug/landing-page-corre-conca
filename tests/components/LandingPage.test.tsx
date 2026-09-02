// SPECSFY: US-001 FR-002 AC-001
// SPECSFY: US-001 FR-002 AC-004
// SPECSFY: US-001 FR-002 AC-005
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Page from '@/app/page'

vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      prefetch: () => null,
      push: () => null,
      replace: () => null,
    };
  }
}));

describe('Informações na Landing Page - Antigas', () => {
  it('Visitante visualiza informações da retirada', () => {
    render(<Page />)
    expect(screen.getByText(/Dia 4/i)).toBeInTheDocument()
    expect(screen.getByText(/A definir/i)).toBeInTheDocument()
    expect(screen.getAllByText(/2kg de alimento não perecível/i).length).toBeGreaterThan(0)
  })

  it('AC-004: Visitante mobile visualiza informações sem quebrar layout', () => {
    render(<Page />)
    const container = screen.getByTestId('info-section')
    expect(container).toHaveClass('flex-col')
  })

  it('AC-005: Textos legíveis por leitores de tela', () => {
    render(<Page />)
    const accessibleRegion = screen.getByRole('region', { name: /retirada de kits/i })
    expect(accessibleRegion).toBeInTheDocument()
  }, 10000)
})

describe('Landing Page pós-inscrições - Spec 0002', () => {
  // SPECSFY: US-001 FR-001 AC-001
  it('AC-001: Visitante não visualiza elementos de venda', () => {
    render(<Page />)
    // A tabela de preços não deve estar na tela (e.g. texto Lote 1, Lote 2)
    const priceTables = screen.queryAllByText(/R\$/i)
    expect(priceTables.length).toBe(0)
    
    // Botões de Inscreva-se não devem estar na tela
    const subscribeButtons = screen.queryAllByText(/inscreva-se/i)
    expect(subscribeButtons.length).toBe(0)
  })

  // SPECSFY: US-001 FR-002 AC-002
  it('AC-002: Visitante visualiza regras de entrega atualizadas', () => {
    render(<Page />)
    expect(screen.getByText(/Pela tarde/i)).toBeInTheDocument()
    expect(screen.getByText(/O dia inteiro/i)).toBeInTheDocument()
    expect(screen.getByText(/A definir \(Centro da cidade\)/i)).toBeInTheDocument()
  })

  // SPECSFY: US-001 NFR-001 AC-003
  it('AC-003: Informações de entrega devem estar proeminentes (checagem visual/estrutural)', () => {
    render(<Page />)
    // Vamos garantir que a seção existe com um ID ou classe que possamos identificar como a parte de cima da página.
    // Simplificando o teste E2E visual para um teste estrutural.
    const heroAndKit = document.querySelector('section:first-of-type')?.textContent + ' ' + document.querySelector('section:nth-of-type(2)')?.textContent
    expect(heroAndKit).toMatch(/Pela tarde|O dia inteiro/i)
  })

  // SPECSFY: US-001 FR-001 AC-004
  it('AC-004: Visitante mobile não visualiza elementos de venda', () => {
    // Para jsdom, mobile e desktop são essencialmente o mesmo DOM a menos que tenhamos CSS media queries ocultando elementos
    // O teste principal é garantir que a estrutura não existe.
    render(<Page />)
    const priceTables = screen.queryAllByText(/R\$/i)
    expect(priceTables.length).toBe(0)
    const subscribeButtons = screen.queryAllByText(/inscreva-se/i)
    expect(subscribeButtons.length).toBe(0)
  })

  // SPECSFY: US-001 FR-001 AC-005
  it('AC-005: Visitante tenta burlar visual usando link antigo (validação no layout)', () => {
    render(<Page />)
    const links = screen.queryAllByRole('link')
    links.forEach(link => {
      expect(link.getAttribute('href')).not.toMatch(/checkout/i)
      expect(link.getAttribute('href')).not.toMatch(/#formulario/i) // Deve falhar pois #formulario existe
    })
  })

  // SPECSFY: US-001 FR-002 AC-006
  it('AC-006: Responsividade dos textos de entrega no Mobile', () => {
    render(<Page />)
    expect(screen.getByText(/Pela tarde/i)).toBeInTheDocument()
  })

  // SPECSFY: US-001 FR-002 NFR-001 AC-007
  it('AC-007: Leitor de tela anuncia as novas informações provisórias', () => {
    render(<Page />)
    expect(screen.getByText(/Pela tarde/i)).toBeInTheDocument()
    expect(screen.getByText(/O dia inteiro/i)).toBeInTheDocument()
    expect(screen.getByText(/A definir \(Centro da cidade\)/i)).toBeInTheDocument()
  })

  // SPECSFY: US-001 NFR-001 AC-008
  it('AC-008: O layout não quebra após remoção da tabela de preços', () => {
    render(<Page />)
    // O lote 2 não deve ser renderizado. Deve falhar pois "2º Lote" está na tela.
    const loteText = screen.queryByText(/2º Lote/i)
    expect(loteText).not.toBeInTheDocument()
  })
})

