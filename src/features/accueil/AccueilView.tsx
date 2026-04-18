import { useState, useRef, useCallback } from 'react'
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

  // Drag state for the chart card
  const isDragging = useRef(false)
  const hasDragged = useRef(false)
  const pointerStart = useRef({ x: 0, y: 0 })
  const posStart = useRef({ x: 0, y: 0 })
  const [chartPos, setChartPos] = useState({ x: 0, y: 0 })

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    isDragging.current = true
    hasDragged.current = false
    pointerStart.current = { x: e.clientX, y: e.clientY }
    posStart.current = { ...chartPos }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging.current) return
    const dx = e.clientX - pointerStart.current.x
    const dy = e.clientY - pointerStart.current.y
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasDragged.current = true
    setChartPos({ x: posStart.current.x + dx, y: posStart.current.y + dy })
  }

  function onPointerUp() {
    isDragging.current = false
  }

  const handleSelect = useCallback((inv: Investment) => {
    if (!hasDragged.current) setSelected(inv)
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden bg-surface" style={{ touchAction: 'none' }}>
      {/* Total */}
      <PortfolioTotal total={total} monthlyChange={5.6} />

      {/* Carte isométrique — draggable */}
      <div
        className="w-4/5 mx-auto select-none"
        style={{
          transform: `translate(${chartPos.x}px, ${chartPos.y}px)`,
          cursor: isDragging.current ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <IsometricChart
          investments={investments}
          total={total}
          onSelect={handleSelect}
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
