import { useAccueilStore, selectTotal } from './accueil.store'
import PortfolioTotal from './components/PortfolioTotal'
import Treemap from './components/Treemap'
import Button from '@/components/ui/Button'

export default function AccueilView() {
  const investments = useAccueilStore((s) => s.investments)
  const total = selectTotal(investments)

  return (
    <div className="flex flex-col h-full pb-28 lg:pb-8">
      <PortfolioTotal total={total} monthlyChange={5.2} />

      <div className="px-6 mb-3">
        <h2 className="text-sm font-semibold text-neutral-500">
          Répartition du portefeuille
        </h2>
      </div>

      <Treemap investments={investments} total={total} />

      <div className="px-6 mt-6">
        <Button variant="primary" className="w-full justify-center">
          Modifier mes placements
        </Button>
      </div>
    </div>
  )
}
