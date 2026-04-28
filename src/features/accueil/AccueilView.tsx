import { useState, useCallback, useMemo, useRef } from 'react'
import Button from '@/components/ui/Button'
import { useAccueilStore, selectTotal, selectAverageChange, selectEffectiveChange } from './accueil.store'
import PortfolioTotal from './components/PortfolioTotal'
import IsometricChart from './components/IsometricChart'
import CategoryChart from './components/CategoryChart'
import type { SvgPoint, IsometricChartHandle } from './components/IsometricChart'
import InvestmentModal from './components/InvestmentModal'
import EditInvestmentsPanel from './components/EditInvestmentsPanel'
import type { Investment } from './accueil.types'
import Icon from '@/components/ui/Icon'
import { useStockPrices } from '@/hooks/useStockPrices'
import { useT } from '@/lib/i18n'

const SWIPE_THRESHOLD = 60

const VB_Y = 140
const VB_H = 310

export default function AccueilView() {
  const t = useT()
  const investments = useAccueilStore((s) => s.investments)
  const snapshots = useAccueilStore((s) => s.snapshots)
  const { prices } = useStockPrices(investments, import.meta.env.VITE_FINNHUB_KEY ?? '')

  // Investissements avec prix live injectés + change calculé depuis snapshots
  const effectiveInvestments = useMemo(() =>
    investments.map(inv => {
      const live = prices[inv.id]
      if (live && inv.ticker && inv.shares) {
        return { ...inv, value: Math.round(live.price * inv.shares * 100) / 100, change: live.changePercent }
      }
      const computedChange = selectEffectiveChange(inv, snapshots)
      return computedChange !== null ? { ...inv, change: computedChange } : inv
    }), [investments, prices, snapshots])

  const total = selectTotal(effectiveInvestments)
  const avgChange = selectAverageChange(effectiveInvestments)
  const [selected, setSelected] = useState<Investment | null>(null)

  // selected avec prix live
  const effectiveSelected = selected
    ? effectiveInvestments.find(i => i.id === selected.id) ?? selected
    : null

  const [editOpen, setEditOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 })
  const [vizMode, setVizMode] = useState<'chart' | 'categories'>('chart')

  const chartRef = useRef<IsometricChartHandle>(null)
  const navDirRef = useRef<'left' | 'right'>('right')
  const swipeStartX = useRef<number | null>(null)

  // Ordre croissant de pourcentage pour la navigation swipe
  const sortedByPct = useMemo(
    () => total > 0 ? [...effectiveInvestments].sort((a, b) => a.value - b.value) : effectiveInvestments,
    [effectiveInvestments, total]
  )

  function focusOnBar(inv: Investment, svgPoint?: SvgPoint) {
    const point = svgPoint ?? chartRef.current?.getBarPosition(inv.id)
    if (point) {
      setZoomOrigin({
        x: (point.x / 392) * 100,
        y: ((point.y - VB_Y) / VB_H) * 100,
      })
      setZoom(2)
    }
  }

  const selectedIndex = selected ? sortedByPct.findIndex((i) => i.id === selected.id) : -1

  const handleSelect = useCallback((inv: Investment, svgPoint: SvgPoint) => {
    if (selected?.id === inv.id) {
      setSelected(null)
      setZoom(1)
      return
    }
    const newIndex = sortedByPct.findIndex(i => i.id === inv.id)
    const tot = sortedByPct.length
    if (tot > 1 && selectedIndex >= 0) {
      const diff = newIndex - selectedIndex
      const wrapping = Math.abs(diff) > tot / 2
      navDirRef.current = wrapping ? (diff < 0 ? 'right' : 'left') : (diff > 0 ? 'right' : 'left')
    }
    setSelected(inv)
    focusOnBar(inv, svgPoint)
  }, [selected, sortedByPct, selectedIndex])

  function handleClose() {
    setSelected(null)
    setZoom(1)
  }

  function handleChartSwipeStart(clientX: number) {
    swipeStartX.current = clientX
  }

  function handleChartSwipeEnd(clientX: number) {
    if (swipeStartX.current === null) return
    const delta = clientX - swipeStartX.current
    swipeStartX.current = null
    if (Math.abs(delta) < SWIPE_THRESHOLD) return
    if (delta < 0 && vizMode === 'chart') {
      setVizMode('categories')
      if (selected) { setSelected(null); setZoom(1) }
    } else if (delta > 0 && vizMode === 'categories') {
      setVizMode('chart')
    }
  }

  function handleNext() {
    if (!sortedByPct.length) return
    const next = sortedByPct[(selectedIndex + 1) % sortedByPct.length]
    if (!next) return
    navDirRef.current = 'right'
    setSelected(next)
    focusOnBar(next)
  }

  function handlePrev() {
    if (!sortedByPct.length) return
    const prev = sortedByPct[(selectedIndex - 1 + sortedByPct.length) % sortedByPct.length]
    if (!prev) return
    navDirRef.current = 'left'
    setSelected(prev)
    focusOnBar(prev)
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <PortfolioTotal total={total} monthlyChange={avgChange ?? undefined} />

      {/* Zone graphique */}
      <div
        className="flex-1 flex items-start justify-center pt-16 lg:pt-2 relative overflow-hidden"
        onTouchStart={(e) => handleChartSwipeStart(e.touches[0]?.clientX ?? 0)}
        onTouchEnd={(e) => handleChartSwipeEnd(e.changedTouches[0]?.clientX ?? 0)}
        onMouseDown={(e) => handleChartSwipeStart(e.clientX)}
        onMouseUp={(e) => handleChartSwipeEnd(e.clientX)}
      >
        <div className="w-[90%] max-w-[480px] lg:max-w-[660px]">
          {vizMode === 'chart' ? (
            <div
              style={{
                transformOrigin: '0% 0%',
                transform: `translate(${zoomOrigin.x * (1 - zoom)}%, ${zoomOrigin.y * (1 - zoom)}%) scale(${zoom})`,
                transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              <IsometricChart
                ref={chartRef}
                investments={effectiveInvestments}
                total={total}
                onSelect={handleSelect}
                selected={effectiveSelected}
              />
            </div>
          ) : (
            <CategoryChart investments={effectiveInvestments} total={total} />
          )}
        </div>

        {/* Dots indicateurs de vue */}
        <div className="absolute bottom-4 left-1/2 lg:left-[calc(312px+(100vw-312px)/2)] -translate-x-1/2 flex gap-1.5">
          <div className={`rounded-full transition-all duration-300 ${vizMode === 'chart' ? 'w-4 h-1.5 bg-primary-500' : 'w-1.5 h-1.5 bg-neutral-300 dark:bg-neutral-600'}`} />
          <div className={`rounded-full transition-all duration-300 ${vizMode === 'categories' ? 'w-4 h-1.5 bg-primary-500' : 'w-1.5 h-1.5 bg-neutral-300 dark:bg-neutral-600'}`} />
        </div>
      </div>

      {/* Bouton modifier */}
      <div className="fixed bottom-[120px] lg:bottom-8 left-1/2 lg:left-[calc(312px+(100vw-312px)/2)] -translate-x-1/2 z-[45]">
        <Button
          variant="grey-outline"
          size="lg"
          aria-label={t('home.editInvestments')}
          onClick={() => setEditOpen(true)}
          className="whitespace-nowrap shadow-sm"
        >
          <Icon name="write" size={18} />
          {t('home.editInvestments')}
        </Button>
      </div>

      <EditInvestmentsPanel open={editOpen} onClose={() => setEditOpen(false)} />

      <InvestmentModal
        investment={effectiveSelected}
        total={total}
        onClose={handleClose}
        onNext={effectiveSelected ? handleNext : undefined}
        onPrev={effectiveSelected ? handlePrev : undefined}
        position={{ current: selectedIndex + 1, total: sortedByPct.length }}
        navDirRef={navDirRef}
      />
    </div>
  )
}
