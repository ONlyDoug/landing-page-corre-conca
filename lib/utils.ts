import { VIRADA_LOTE, DATA_EVENTO_ISO, LOTES, type LoteInfo } from './constants'

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

/** Lote vigente no momento informado — nunca confiar em lote/valor enviados pelo cliente. */
export function getLoteAtivo(now: Date = new Date()): LoteInfo {
  return LOTES.find((lote) => getLoteStatus(lote.numero, now) === 'ativo') ?? LOTES[LOTES.length - 1]
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

/** Mascara CPF já gravado (sem máscara) para exibição: '12345678901' -> '123.456.***-**' */
export function mascararCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.***-**')
}

export function modalidadeLabel(modalidade: string): string {
  return modalidade === 'caminhada_3km' ? 'Caminhada 3KM' : 'Corrida 6KM'
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
