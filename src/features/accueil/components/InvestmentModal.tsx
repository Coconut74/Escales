import { useEffect, useRef, useState } from 'react'
import type { Investment } from '../accueil.types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../accueil.types'
import { formatCurrency } from '@/lib/formatting'
import { useProfilStore } from '@/features/profil/profil.store'

const DEMO_CHANGE: Record<string, number> = {
  '1': 8.3, '2': 4.1, '3': 12.7, '4': 1.2, '5': -2.4,
}

const SWIPE_THRESHOLD = 50
const ANIM_DURATION = 240

interface Props {
  investment: Investment | null
  total: number
  onClose: () => void
  onNext?: () => void
  onPrev?: () => void
  navDirection?: 'left' | 'right'
  position?: { current: number; total: number }
}

export default function InvestmentModal({ investment, total, onClose, onNext, onPrev, navDirection, position }: Props) {
  const open = !!investment
  const currency = useProfilStore((s) => s.currency)

  // Animation state
  const [displayedInv, setDisplayedInv] = useState<Investment | null>(investment)
  const [exitingInv, setExitingInv] = useState<Investment | null>(null)
  const [animDir, setAnimDir] = useState<'left' | 'right'>('left')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const animTimerRef = useRef<ReturnType<typeof setTimeout>>()

  // navDirection ref so the animation effect always reads the latest value
  const navDirRef = useRef(navDirection)
  useEffect(() => { navDirRef.current = navDirection }, [navDirection])

  // Watch investment changes and trigger slide animation
  useEffect(() => {
    if (!investment) {
      // Modal closing — keep displayed content until slide-out completes
      setExitingInv(null)
      setIsTransitioning(false)
      clearTimeout(animTimerRef.current)
      return
    }

    if (!displayedInv) {
      // First open — no animation, just show
      setDisplayedInv(investment)
      return
    }

    if (investment.id === displayedInv.id) return

    // Switch investment — trigger slide animation
    const dir = navDirRef.current ?? 'left'
    setAnimDir(dir)
    setExitingInv(displayedInv)
    setDisplayedInv(investment)
    setIsTransitioning(true)

    clearTimeout(animTimerRef.current)
    animTimerRef.current = setTimeout(() => {
      setExitingInv(null)
      setIsTransitioning(false)
    }, ANIM_DURATION)
  }, [investment?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearTimeout(animTimerRef.current), [])

  // Keyboard navigation
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

  // Swipe / drag
  const touchStartX = useRef<number | null>(null)
  const mouseStartX = useRef<number | null>(null)
  const [dragDelta, setDragDelta] = useState(0)

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null
    setDragDelta(0)
  }
  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const x = e.touches[0]?.clientX
    if (x !== undefined) setDragDelta(x - touchStartX.current)
  }
  function handleTouchEnd() {
    const delta = dragDelta
    touchStartX.current = null
    setDragDelta(0)
    if (delta < -SWIPE_THRESHOLD) onNext?.()
    else if (delta > SWIPE_THRESHOLD) onPrev?.()
  }

  function handleMouseDown(e: React.MouseEvent) { mouseStartX.current = e.clientX }
  function handleMouseMove(e: React.MouseEvent) {
    if (mouseStartX.current === null) return
    setDragDelta(e.clientX - mouseStartX.current)
  }
  function handleMouseUp() {
    const delta = dragDelta
    mouseStartX.current = null
    setDragDelta(0)
    if (delta < -SWIPE_THRESHOLD) onNext?.()
    else if (delta > SWIPE_THRESHOLD) onPrev?.()
  }

  // Drag resistance on the outer container (max ±16px)
  const clampedDrag = Math.max(-16, Math.min(16, dragDelta * 0.35))

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={investment?.label ?? 'Détail investissement'}
      className={`
        fixed left-1/2 w-[calc(100%-32px)] max-w-[600px]
        lg:left-[calc(50vw+112px)]
        bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl
        select-none cursor-grab active:cursor-grabbing
      `}
      style={{
        bottom: '16px',
        maxHeight: '44vh',
        zIndex: 100,
        transform: open
          ? `translateX(calc(-50% + ${clampedDrag}px)) translateY(0)`
          : 'translateX(-50%) translateY(calc(100% + 24px))',
        transition: dragDelta !== 0 ? 'none' : 'transform 0.3s ease-out',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Conteneur avec overflow:hidden pour clipper les animations de slide */}
      <div className="relative overflow-hidden rounded-3xl">

        {/* Contenu sortant (animé vers l'extérieur) */}
        {exitingInv && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0,
              animation: `${animDir === 'left' ? 'card-exit-left' : 'card-exit-right'} ${ANIM_DURATION}ms ease-out forwards`,
            }}
          >
            <CardContent investment={exitingInv} total={total} currency={currency} onClose={onClose} />
          </div>
        )}

        {/* Contenu entrant (animé depuis l'extérieur) */}
        {displayedInv && (
          <div
            style={{
              animation: isTransitioning
                ? `${animDir === 'left' ? 'card-enter-from-right' : 'card-enter-from-left'} ${ANIM_DURATION}ms ease-out forwards`
                : 'none',
            }}
          >
            <CardContent
              investment={displayedInv}
              total={total}
              currency={currency}
              onClose={onClose}
              onNext={onNext}
              onPrev={onPrev}
              position={position}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Contenu de la card ──────────────────────────────────────────────────────

const DEMO_CHANGE_MAP = DEMO_CHANGE

function CardContent({
  investment, total, currency, onClose, onNext, onPrev, position,
}: {
  investment: Investment
  total: number
  currency: string
  onClose: () => void
  onNext?: () => void
  onPrev?: () => void
  position?: { current: number; total: number }
}) {
  const pct    = ((investment.value / total) * 100).toFixed(1)
  const change = DEMO_CHANGE_MAP[investment.id] ?? 0
  const color  = CATEGORY_COLORS[investment.category]
  const label  = CATEGORY_LABELS[investment.category]

  return (
    <div className="px-6 pt-5 pb-6">

      {/* En-tête */}
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
          onMouseDown={(e) => e.stopPropagation()}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors shrink-0"
          aria-label="Fermer"
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

      {/* Navigation */}
      {position && (
        <div className="flex items-center justify-between">
          <button
            onClick={(e) => { e.stopPropagation(); onPrev?.() }}
            onMouseDown={(e) => e.stopPropagation()}
            disabled={!onPrev}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            aria-label="Précédent"
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
            aria-label="Suivant"
          >
            Suiv.
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

function Metric({ label, value, highlight, positive, negative }: {
  label: string; value: string
  highlight?: boolean; positive?: boolean; negative?: boolean
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
