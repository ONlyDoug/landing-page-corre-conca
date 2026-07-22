import { DATA_EVENTO_ISO } from './constants'

export function getCountdownTarget(): { target: Date; label: string } {
  return { target: new Date(DATA_EVENTO_ISO), label: 'O evento começa em:' }
}

/** 'pendente' é o valor legado (pré-Fase 11) equivalente a 'aguardando_pagamento' — nunca gravar 'pendente' em registros novos. */
export function isStatusAguardando(status: string | null | undefined): boolean {
  return status === 'pendente' || status === 'aguardando_pagamento'
}

export function statusPagamentoLabel(status: string): string {
  if (status === 'confirmado') return 'Confirmado'
  if (status === 'cancelado') return 'Cancelado'
  return 'Aguardando pagamento'
}

export function statusPagamentoBadgeClasses(status: string): string {
  if (status === 'confirmado') return 'bg-green-100 text-green-800'
  if (status === 'cancelado') return 'bg-red-100 text-red-800'
  return 'bg-yellow-100 text-yellow-800'
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
