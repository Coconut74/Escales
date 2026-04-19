import { useEffect, useRef, useState } from 'react'
import type { Investment } from '../accueil.types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../accueil.types'
import { formatCurrency } from '@/lib/formatting'
import { useProfilStore } from '@/features/profil/profil.store'

const DEMO_CHANGE: Record<string, number> = {
  '1': 8.3, '2': 4.1, '3': 12.7, '4': 1.2, '5': -2.4,
}

const SWIPE_THRESHOLD = 50

interface Props {
  investment: Investment | null
  total: number
  onClose: () => void
  onNext?: () => void
  onPrev?: () => void
  position?: { current: number; total: number }
}

export default function InvestmentModal({ investment, total, onClose, onNext, onPrev, position }: Props) {
  const open = !!investment
  const currency = useProfilStore((s) => s.currency)

  const touchStartX = useRef<number | null>(null)
  const mouseStartX = useRef<number | null>(null)
  const [swipeDelta, setSwipeDelta] = useState(0)
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)

  // Escape key + arrow keys
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNext?.()
      if (e.key === 'ArrowLeft') onPrev?.()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose, onNext, onPrev])

  // Réinitialiser l'animation de slide quand l'investissement change
  useEffect(() => {
    if (!slideDir) return
    const t = setTimeout(() => setSlideDir(null), 250)
    return () => clearTimeout(t)
  }, [investment?.id])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null
    setSwipeDelta(0)
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const clientX = e.touches[0]?.clientX
    if (clientX !== undefined) setSwipeDelta(clientX - touchStartX.current)
  }

  function handleTouchEnd() {
    if (touchStartX.current === null) return
    const delta = swipeDelta
    touchStartX.current = null
    setSwipeDelta(0)
    if (delta < -SWIPE_THRESHOLD && onNext) { setSlideDir('left'); onNext() }
    else if (delta > SWIPE_THRESHOLD && onPrev) { setSlideDir('right'); onPrev() }
  }

  function handleMouseDown(e: React.MouseEvent) {
    mouseStartX.current = e.clientX
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (mouseStartX.current === null) return
    setSwipeDelta(e.clientX - mouseStartX.current)
  }

  function handleMouseUp() {
    if (mouseStartX.current === null) return
    const delta = swipeDelta
    mouseStartX.current = null
    setSwipeDelta(0)
    if (delta < -SWIPE_THRESHOLD && onNext) { setSlideDir('left'); onNext() }
    else if (delta > SWIPE_THRESHOLD && onPrev) { setSlideDir('right'); onPrev() }
  }

  const pct    = investment ? ((investment.value / total) * 100).toFixed(1) : '0'
  const change = investment ? (DEMO_CHANGE[investment.id] ?? 0) : 0
  const color  = investment ? CATEGORY_COLORS[investment.category] : null
  const label  = investment ? CATEGORY_LABELS[investment.category] : ''

  // Légère résistance visuelle au swipe (max ±20px)
  const clampedDelta = Math.max(-20, Math.min(20, swipeDelta * 0.4))
  const slideTranslate = slideDir === 'left' ? '-8px' : slideDir === 'right' ? '8px' : `${clampedDelta}px`

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={investment?.label ?? 'Détail investissement'}
      className={`
        fixed left-1/2 lg:left-[calc(50vw+112px)] -translate-x-1/2
        w-[calc(100%-32px)] max-w-[600px]
        bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl
        transition-transform duration-300 ease-out
        select-none cursor-grab active:cursor-grabbing
        ${open ? 'translate-y-0' : 'translate-y-[calc(100%+24px)]'}
      `}
      style={{
        bottom: '16px',
        maxHeight: '44vh',
        zIndex: 100,
        transform: open
          ? `translateX(calc(-50% + ${slideTranslate})) translateY(0)`
          : 'translateX(-50%) translateY(calc(100% + 24px))',
        transition: slideDir
          ? 'transform 0.25s ease-out'
          : swipeDelta !== 0
          ? 'none'
          : 'transform 0.3s ease-out',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {investment && color && (
        <div className="px-6 pt-5 pb-6">

          {/* En-tête : badge catégorie + nom + fermer */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
              style={{ backgroundColor: color.bg, color: color.text }}
            >
              {investment.label.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-neutral-900 dark:text-neutral-50 truncate">
                {investment.label}
              </p>
              <span
                className="text-sm font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${color.bg}22`, color: color.bg }}
              >
                {label}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors shrink-0"
              aria-label="Fermer"
              onMouseDown={(e) => e.stopPropagation()}
            >
              ✕
            </button>
          </div>

          {/* Métriques */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Metric label="Valeur" value={formatCurrency(investment.value, currency)} highlight />
            <Metric label="Part" value={`${pct}%`} />
            <Metric
              label="Evolution"
              value={`${change >= 0 ? '+' : ''}${change.toFixed(1)}%`}
              positive={change >= 0}
              negative={change < 0}
            />
          </div>

          {/* Navigation swipe */}
          {position && (
            <div className="flex items-center justify-between">
              <button
                onClick={(e) => { e.stopPropagation(); onPrev?.() }}
                onMouseDown={(e) => e.stopPropagation()}
                disabled={!onPrev}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Investissement précédent"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Préc.
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: position.total }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all duration-200 ${
                      i === position.current - 1
                        ? 'w-4 h-1.5 bg-primary-500'
                        : 'w-1.5 h-1.5 bg-neutral-300 dark:bg-neutral-600'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); onNext?.() }}
                onMouseDown={(e) => e.stopPropagation()}
                disabled={!onNext}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Investissement suivant"
              >
                Suiv.
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Metric({
  label, value, highlight, positive, negative,
}: {
  label: string
  value: string
  highlight?: boolean
  positive?: boolean
  negative?: boolean
}) {
  let valueColor = 'text-neutral-800 dark:text-neutral-100'
  if (positive) valueColor = 'text-green-600 dark:text-green-400'
  if (negative) valueColor = 'text-red-500 dark:text-red-400'

  return (
    <div className="bg-neutral-50 dark:bg-neutral-700 rounded-2xl px-3 py-3">
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1 leading-tight">{label}</p>
      <p className={`text-base font-bold leading-tight ${highlight ? 'text-primary-700 dark:text-primary-400' : valueColor}`}>
        {value}
      </p>
    </div>
  )
}
