import { useState, useRef, useCallback } from 'react'
import { useAccueilStore, selectTotal } from './accueil.store'
import PortfolioTotal from './components/PortfolioTotal'
import IsometricChart from './components/IsometricChart'
import type { SvgPoint } from './components/IsometricChart'
import InvestmentModal from './components/InvestmentModal'
import type { Investment } from './accueil.types'
import Icon from '@/components/ui/Icon'

export default function AccueilView() {
  const investments = useAccueilStore((s) => s.investments)
  const total = selectTotal(investments)
  const [selected, setSelected] = useState<Investment | null>(null)

  // ── Zoom ────────────────────────────────────────────────────────────────────
  const [zoom, setZoom] = useState(1)
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 }) // percent

  // ── Drag ────────────────────────────────────────────────────────────────────
  const isDragging = useRef(false)
  const hasDragged = useRef(false)
  const pointerStart = useRef({ x: 0, y: 0 })
  const posStart = useRef({ x: 0, y: 0 })
  const [chartPos, setChartPos] = useState({ x: 0, y: 0 })
  const chartRef = useRef<HTMLDivElement>(null)
  const zoneRef  = useRef<HTMLDivElement>(null)
  const dragBounds = useRef({ minX: -Infinity, maxX: Infinity, minY: -Infinity, maxY: Infinity })

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    isDragging.current = true
    hasDragged.current = false
    pointerStart.current = { x: e.clientX, y: e.clientY }
    posStart.current = { ...chartPos }

    if (chartRef.current && zoneRef.current) {
      const cr = chartRef.current.getBoundingClientRect()
      const zr = zoneRef.current.getBoundingClientRect()
      // Natural (untranslated) chart edges
      const nl = cr.left   - chartPos.x
      const nr = cr.right  - chartPos.x
      const nt = cr.top    - chartPos.y
      const nb = cr.bottom - chartPos.y
      // Bounds: chart must stay fully within the zone container
      let minX = zr.left   - nl,  maxX = zr.right  - nr
      let minY = zr.top    - nt,  maxY = zr.bottom  - nb
      if (minX > maxX) { minX = maxX = 0 }
      if (minY > maxY) { minY = maxY = 0 }
      dragBounds.current = { minX, maxX, minY, maxY }
    }
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging.current) return
    const dx = e.clientX - pointerStart.current.x
    const dy = e.clientY - pointerStart.current.y
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasDragged.current = true
    const { minX, maxX, minY, maxY } = dragBounds.current
    setChartPos({
      x: Math.max(minX, Math.min(maxX, posStart.current.x + dx)),
      y: Math.max(minY, Math.min(maxY, posStart.current.y + dy)),
    })
  }

  function onPointerUp() {
    isDragging.current = false
  }

  const handleSelect = useCallback((inv: Investment, svgPoint: SvgPoint) => {
    if (hasDragged.current) return
    setSelected(inv)
    setZoomOrigin({
      x: (svgPoint.x / 392) * 100,
      y: (svgPoint.y / 480) * 100,
    })
    setZoom(2)
  }, [])

  function handleClose() {
    setSelected(null)
    setZoom(1)
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-surface" style={{ touchAction: 'none' }}>
      <PortfolioTotal total={total} monthlyChange={5.6} />

      {/* Zone graphique : flex-1, aligne le chart en haut */}
      <div ref={zoneRef} className="flex-1 flex items-start justify-center overflow-hidden pt-4 pb-40">
        {/* Drag wrapper */}
        <div
          ref={chartRef}
          className="w-[90%] select-none"
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
          {/* Zoom wrapper */}
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
