import { useState, useCallback } from 'react'
import { useAccueilStore, selectTotal } from './accueil.store'
import PortfolioTotal from './components/PortfolioTotal'
import IsometricChart from './components/IsometricChart'
import type { SvgPoint } from './components/IsometricChart'
import InvestmentModal from './components/InvestmentModal'
import type { Investment } from './accueil.types'
import Icon from '@/components/ui/Icon'

// viewBox origin Y and height (must match IsometricChart viewBox "0 140 392 310")
const VB_Y = 140
const VB_H = 310

export default function AccueilView() {
  const investments = useAccueilStore((s) => s.investments)
  const total = selectTotal(investments)
  const [selected, setSelected] = useState<Investment | null>(null)

  const [zoom, setZoom] = useState(1)
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 })

  const handleSelect = useCallback((inv: Investment, svgPoint: SvgPoint) => {
    setSelected(inv)
    setZoomOrigin({
      x: (svgPoint.x / 392) * 100,
      y: ((svgPoint.y - VB_Y) / VB_H) * 100,
    })
    setZoom(2)
  }, [])

  function handleClose() {
    setSelected(null)
    setZoom(1)
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-surface">
      <PortfolioTotal total={total} monthlyChange={5.6} />

      {/* Zone graphique */}
      <div className="flex-1 flex items-start justify-center overflow-hidden pt-16 lg:pt-2">
        <div className="w-[90%] max-w-[480px] lg:max-w-[660px]">
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
              transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
      <div className="fixed bottom-[120px] left-1/2 lg:left-[calc(50vw+112px)] -translate-x-1/2 z-[45]">
        <button
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-neutral-300 bg-white text-neutral-700 text-base font-semibold shadow-sm hover:bg-neutral-50 active:bg-neutral-100 transition-colors whitespace-nowrap"
          aria-label="Modifier mes investissements"
        >
          <Icon name="write" size={18} />
          Modifier mes investissements
        </button>
      </div>

      <InvestmentModal
        investment={selected}
        total={total}
        onClose={handleClose}
      />
    </div>
  )
}
