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

describe('Informações na Landing Page', () => {
  it('Visitante visualiza informações da retirada', () => {
    render(<Page />)
    expect(screen.getByText(/03 e 04\/09/i)).toBeInTheDocument()
    expect(screen.getByText(/Rua Castro Alves \(próximo à Prefeitura\), Conceição da Feira, Bahia/i)).toBeInTheDocument()
    expect(screen.getAllByText(/2kg de alimento não perecível/i).length).toBeGreaterThan(0)
  })

  it('AC-004: Visitante mobile visualiza informações sem quebrar layout', () => {
    render(<Page />)
    const container = screen.getByTestId('info-section') // Falhará pois não tem data-testid
    expect(container).toHaveClass('flex-col') // ou algo mobile
  })

  it('AC-005: Textos legíveis por leitores de tela', () => {
    render(<Page />)
    const accessibleRegion = screen.getByRole('region', { name: /retirada de kits/i }) // Falhará se não tiver role="region"
    expect(accessibleRegion).toBeInTheDocument()
  }, 10000)
})
