import { useState, useCallback } from 'react'
import { useAccueilStore, selectTotal, selectAverageChange } from './accueil.store'
import PortfolioTotal from './components/PortfolioTotal'
import IsometricChart from './components/IsometricChart'
import type { SvgPoint } from './components/IsometricChart'
import InvestmentModal from './components/InvestmentModal'
import EditInvestmentsPanel from './components/EditInvestmentsPanel'
import type { Investment } from './accueil.types'
import Icon from '@/components/ui/Icon'

// viewBox origin Y and height (must match IsometricChart viewBox "0 140 392 310")
const VB_Y = 140
const VB_H = 310

export default function AccueilView() {
  const investments = useAccueilStore((s) => s.investments)
  const total = selectTotal(investments)
  const avgChange = selectAverageChange(investments)
  const [selected, setSelected] = useState<Investment | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 })

  const handleSelect = useCallback((inv: Investment, svgPoint: SvgPoint) => {
    if (selected?.id === inv.id) {
      handleClose()
      return
    }
    setSelected(inv)
    setZoomOrigin({
      x: (svgPoint.x / 392) * 100,
      y: ((svgPoint.y - VB_Y) / VB_H) * 100,
    })
    setZoom(2)
  }, [selected])

  function handleClose() {
    setSelected(null)
    setZoom(1)
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-surface dark:bg-neutral-900">
      <PortfolioTotal total={total} monthlyChange={avgChange ?? undefined} />

      {/* Zone graphique */}
      <div className="flex-1 flex items-start justify-center pt-16 lg:pt-2">
        <div className="w-[90%] max-w-[480px] lg:max-w-[660px]">
          <div
            style={{
              transformOrigin: '0% 0%',
              transform: `translate(${zoomOrigin.x * (1 - zoom)}%, ${zoomOrigin.y * (1 - zoom)}%) scale(${zoom})`,
              transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <IsometricChart
              investments={investments}
              total={total}
              onSelect={handleSelect}
              selected={selected}
            />
          </div>
        </div>
      </div>

      {/* Bouton modifier */}
      <div className="fixed bottom-[120px] lg:bottom-8 left-1/2 lg:left-[calc(50vw+112px)] -translate-x-1/2 z-[45]">
        <button
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-base font-semibold shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 active:bg-neutral-100 dark:active:bg-neutral-600 transition-colors whitespace-nowrap"
          aria-label="Modifier mes investissements"
          onClick={() => setEditOpen(true)}
        >
          <Icon name="write" size={18} />
          Modifier mes investissements
        </button>
      </div>

      <EditInvestmentsPanel open={editOpen} onClose={() => setEditOpen(false)} />

      <InvestmentModal
        investment={selected}
        total={total}
        onClose={handleClose}
      />
    </div>
  )
}
