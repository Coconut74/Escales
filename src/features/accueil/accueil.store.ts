import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Investment } from './accueil.types'


interface AccueilStore {
  investments: Investment[]
  setInvestments: (investments: Investment[]) => void
  updateInvestment: (id: string, patch: Partial<Investment>) => void
  addInvestment: (inv: Investment) => void
  removeInvestment: (id: string) => void
  resetInvestments: () => void
}

export const useAccueilStore = create<AccueilStore>()(
  persist(
    (set) => ({
      investments: [],
      setInvestments: (investments) => set({ investments }),
      updateInvestment: (id, patch) =>
        set((s) => ({
          investments: s.investments.map((inv) =>
            inv.id === id ? { ...inv, ...patch } : inv
          ),
        })),
      addInvestment: (inv) =>
        set((s) => ({ investments: [...s.investments, inv] })),
      removeInvestment: (id) =>
        set((s) => ({ investments: s.investments.filter((i) => i.id !== id) })),
      resetInvestments: () => set({ investments: [] }),
    }),
    { name: 'escales-accueil' }
  )
)

export function selectTotal(investments: Investment[]): number {
  return investments.reduce((sum, inv) => sum + inv.value, 0)
}

export function selectAverageChange(investments: Investment[]): number | null {
  const withChange = investments.filter((inv) => inv.change !== undefined)
  if (withChange.length === 0) return null
  return withChange.reduce((sum, inv) => sum + inv.change!, 0) / withChange.length
}
