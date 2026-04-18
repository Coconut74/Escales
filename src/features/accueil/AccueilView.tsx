import { useAccueilStore, selectTotal } from './accueil.store'
import PortfolioTotal from './components/PortfolioTotal'
import BarChart3D from './components/BarChart3D'
import Button from '@/components/ui/Button'

export default function AccueilView() {
  const investments = useAccueilStore((s) => s.investments)
  const total = selectTotal(investments)

  return (
    <div className="flex flex-col h-full pb-28 lg:pb-8">
      <PortfolioTotal total={total} monthlyChange={5.2} />

      <div className="px-6 mb-2">
        <h2 className="text-sm font-semibold text-neutral-400">
          Répartition du portefeuille
        </h2>
      </div>

      <BarChart3D investments={investments} />

      <div className="flex justify-center mt-6 px-6">
        <Button variant="grey-outline">
          Modifier mes placements
        </Button>
      </div>
    </div>
  )
}
