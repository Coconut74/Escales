import { useAccueilStore, selectTotal } from './accueil.store'
import PortfolioTotal from './components/PortfolioTotal'
import IsometricChart from './components/IsometricChart'
import Icon from '@/components/ui/Icon'

export default function AccueilView() {
  const investments = useAccueilStore((s) => s.investments)
  const total = selectTotal(investments)

  return (
    <div className="flex flex-col items-center min-h-full pb-32 bg-surface">
      {/* Total */}
      <PortfolioTotal total={total} monthlyChange={5.6} />

      {/* Carte isométrique */}
      <div className="w-full max-w-xs px-2 mt-2">
        <IsometricChart investments={investments} total={total} />
      </div>

      {/* Bouton modifier */}
      <div className="mt-8">
        <button
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-neutral-300 bg-white text-neutral-700 text-base font-semibold shadow-sm hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
          aria-label="Modifier mes investissements"
        >
          <Icon name="write" size={18} />
          Modifier mes investissements
        </button>
      </div>
    </div>
  )
}
