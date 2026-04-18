import { useState } from 'react'
import { useAccueilStore, selectTotal } from './accueil.store'
import PortfolioTotal from './components/PortfolioTotal'
import IsometricChart from './components/IsometricChart'
import InvestmentModal from './components/InvestmentModal'
import type { Investment } from './accueil.types'
import Icon from '@/components/ui/Icon'

export default function AccueilView() {
  const investments = useAccueilStore((s) => s.investments)
  const total = selectTotal(investments)
  const [selected, setSelected] = useState<Investment | null>(null)

  return (
    <div className="flex flex-col items-center w-full bg-surface" style={{ minHeight: '100%' }}>
      {/* Total */}
      <PortfolioTotal total={total} monthlyChange={5.6} />

      {/* Carte isométrique — pleine largeur, pas de max-width */}
      <div className="w-full px-0 mt-0">
        <IsometricChart
          investments={investments}
          total={total}
          onSelect={setSelected}
          selected={selected}
        />
      </div>

      {/* Bouton modifier */}
      <div className="mt-4 mb-32">
        <button
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-neutral-300 bg-white text-neutral-700 text-base font-semibold shadow-sm hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
          aria-label="Modifier mes investissements"
        >
          <Icon name="write" size={18} />
          Modifier mes investissements
        </button>
      </div>

      {/* Modale glissante */}
      <InvestmentModal
        investment={selected}
        total={total}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
