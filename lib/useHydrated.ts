import { useSyncExternalStore } from 'react'

function subscribeNoop(): () => void {
  return () => {}
}

/** True somente após a hidratação no cliente — evita mismatch ao calcular datas/contadores. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribeNoop, () => true, () => false)
}
