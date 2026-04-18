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

      {/* Carte isométrique — 80% largeur, centrée */}
      <div className="w-4/5 mx-auto mt-0">
        <IsometricChart
          investments={investments}
          total={total}
          onSelect={setSelected}
          selected={selected}
        />
      </div>

      {/* Bouton modifier — fixé au-dessus de la nav, centré dans la zone contenu */}
      <div className="fixed bottom-[120px] left-1/2 lg:left-[calc(50vw+112px)] -translate-x-1/2 z-[45]">
        <button
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-neutral-300 bg-white text-neutral-700 text-base font-semibold shadow-sm hover:bg-neutral-50 active:bg-neutral-100 transition-colors whitespace-nowrap"
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
