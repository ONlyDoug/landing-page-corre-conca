import { useSyncExternalStore } from 'react'
import { VIRADA_LOTE, DATA_EVENTO_ISO } from './constants'

function subscribeNoop(): () => void {
  return () => {}
}

/** True somente após a hidratação no cliente — evita mismatch ao calcular datas/contadores. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribeNoop, () => true, () => false)
}

export type LoteStatus = 'ativo' | 'em_breve' | 'encerrado'

export function getLoteStatus(numero: 1 | 2, now: Date): LoteStatus {
  const virada = new Date(VIRADA_LOTE)
  if (numero === 1) return now <= virada ? 'ativo' : 'encerrado'
  return now <= virada ? 'em_breve' : 'ativo'
}

export function getCountdownTarget(now: Date): { target: Date; label: string } {
  const virada = new Date(VIRADA_LOTE)
  if (now < virada) return { target: virada, label: 'Virada de lote em:' }
  return { target: new Date(DATA_EVENTO_ISO), label: 'O evento começa em:' }
}

export function maskCPF(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function maskTelefone(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4,5})(\d{4})$/, '$1-$2')
}

export function maskDataNascimento(value: string): string {
  return value.replace(/\D/g, '').slice(0, 8)
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d{1,4})$/, '$1/$2')
}
