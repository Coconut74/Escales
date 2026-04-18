import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Investment } from './accueil.types'

const DEMO_INVESTMENTS: Investment[] = [
  { id: '1', label: 'ETF Monde',     category: 'etf',         value: 5200 },
  { id: '2', label: 'SCPI Pierre',   category: 'immo',        value: 3400 },
  { id: '3', label: 'Bitcoin',       category: 'crypto',      value: 2200 },
  { id: '4', label: 'Livret A',      category: 'epargne',     value: 1450 },
  { id: '5', label: 'Oblig. État',   category: 'obligations', value: 850  },
]

interface AccueilStore {
  investments: Investment[]
  setInvestments: (investments: Investment[]) => void
  updateInvestment: (id: string, patch: Partial<Investment>) => void
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
    }),
    { name: 'escales-accueil' }
  )
)

export function selectTotal(investments: Investment[]): number {
  return investments.reduce((sum, inv) => sum + inv.value, 0)
}
