import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Investment } from './accueil.types'

const DEMO_INVESTMENTS: Investment[] = [
  { id: '1', label: 'ETF Monde',     category: 'etf',         value: 15200 },
  { id: '2', label: 'SCPI Pierre',   category: 'immo',        value: 7400 },
  { id: '3', label: 'Bitcoin',       category: 'crypto',      value: 6200 },
  { id: '4', label: 'Livret A',      category: 'epargne',     value: 5200 },
  { id: '5', label: 'Oblig. État',   category: 'obligations', value: 5450  },
]

interface AccueilStore {
  investments: Investment[]
  setInvestments: (investments: Investment[]) => void
  updateInvestment: (id: string, patch: Partial<Investment>) => void
  addInvestment: (inv: Investment) => void
  removeInvestment: (id: string) => void
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
