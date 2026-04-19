import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Investment } from './accueil.types'

const DEMO_INVESTMENTS: Investment[] = [
  { id: '1', label: 'ETF Monde',     category: 'etf',         value: 15200, change:  8.4 },
  { id: '2', label: 'SCPI Pierre',   category: 'immo',        value: 7400,  change:  3.1 },
  { id: '3', label: 'Bitcoin',       category: 'crypto',      value: 6200,  change: 15.2 },
  { id: '4', label: 'Livret A',      category: 'epargne',     value: 5200,  change:  3.0 },
  { id: '5', label: 'Oblig. État',   category: 'obligations', value: 5450,  change: -1.2 },
]

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
      investments: DEMO_INVESTMENTS,
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
      resetInvestments: () => set({ investments: DEMO_INVESTMENTS }),
    }),
    {
      name: 'escales-accueil',
      // Si la liste persiste vide (suppression accidentelle), restaure les démo
      onRehydrateStorage: () => (state) => {
        if (state && state.investments.length === 0) {
          state.investments = DEMO_INVESTMENTS
        }
      },
    }
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
