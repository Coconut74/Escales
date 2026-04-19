import { useLayoutEffect, useEffect, useRef, useState } from 'react'
import type { Investment } from '../accueil.types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../accueil.types'
import { formatCurrency } from '@/lib/formatting'
import { useProfilStore } from '@/features/profil/profil.store'

const DEMO_CHANGE: Record<string, number> = {
  '1': 8.3, '2': 4.1, '3': 12.7, '4': 1.2, '5': -2.4,
}

const SWIPE_THRESHOLD = 50
const ANIM_DURATION = 280

const CARD_CLASSES = 'fixed w-[calc(100%-32px)] max-w-[600px] bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl'

interface Props {
  investment: Investment | null
  total: number
  onClose: () => void
  onNext?: () => void
  onPrev?: () => void
  position?: { current: number; total: number }
}

type ExitEntry = {
  uid: string
  inv: Investment
  dir: 'left' | 'right' | 'down'
  position?: { current: number; total: number }
}

export default function InvestmentModal({ investment, total, onClose, onNext, onPrev, position }: Props) {
  const open = !!investment
  const currency = useProfilStore((s) => s.currency)

  // Chaque transition ajoute une entrée ; chacune se retire après ANIM_DURATION.
  // Cela évite le flash quand on swipe en sens inverse avant la fin de l'animation :
  // l'ancienne carte sortante reste vivante jusqu'au bout de sa propre animation.
  const [exitStack, setExitStack] = useState<ExitEntry[]>([])
  const [animDir, setAnimDir] = useState<'left' | 'right'>('left')
  const [isTransitioning, setIsTransitioning] = useState(false)
  // Snap le div principal hors-écran sans transition pendant l'animation de fermeture,
  // pour éviter qu'un rectangle vide glisse par-dessus la carte sortante.
  const [isClosing, setIsClosing] = useState(false)

  const prevInvRef = useRef<Investment | null>(investment)
  // Mémorise la position précédente pour que la carte sortante ait la même hauteur
  const prevPositionRef = useRef(position)
  // Timer du dernier enter (contrôle isTransitioning)
  const enterTimerRef = useRef<ReturnType<typeof setTimeout>>()

  // useEffect (pas useLayoutEffect) : on veut capturer la position AVANT qu'elle change,
  // donc on la mémorise à chaque render APRÈS que useLayoutEffect a déjà lu prevPositionRef.
  useEffect(() => { prevPositionRef.current = position }, [position])

  useLayoutEffect(() => {
    const prev = prevInvRef.current
    const prevPos = prevPositionRef.current
    prevInvRef.current = investment ?? null

    if (!prev) return

    // Fermeture : investment est devenu null
    if (!investment) {
      const uid = `${prev.id}-${Date.now()}`
      setIsClosing(true)
      setExitStack(s => [...s, { uid, inv: prev, dir: 'down', position: prevPos }])
      setTimeout(() => {
        setExitStack(s => s.filter(e => e.uid !== uid))
        setIsClosing(false)
      }, ANIM_DURATION)
      return
    }

    if (investment.id === prev.id) return

    // Direction dérivée du changement de position : robuste pour swipe ET clic bouton.
    // position.current est déjà mis à jour dans ce render ; prevPositionRef.current
    // contient encore l'ancienne valeur (useEffect court après useLayoutEffect).
    const prevCur = prevPos?.current ?? 0
    const newCur  = position?.current ?? 0
    const tot     = position?.total ?? 1
    const diff    = newCur - prevCur
    // Détection du wrap circulaire : si le saut dépasse la moitié du total, on a bouclé.
    const wrapping = tot > 1 && Math.abs(diff) > tot / 2
    const dir: 'left' | 'right' = wrapping ? (diff < 0 ? 'right' : 'left') : (diff > 0 ? 'right' : 'left')
    const uid = `${prev.id}-${Date.now()}`

    setAnimDir(dir)
    setIsTransitioning(true)
    setExitStack(s => [...s, { uid, inv: prev, dir, position: prevPos }])

    // Chaque carte sortante se retire seule après sa propre animation
    setTimeout(() => {
      setExitStack(s => s.filter(e => e.uid !== uid))
    }, ANIM_DURATION)

    // Réinitialise isTransitioning après la dernière animation en cours
    clearTimeout(enterTimerRef.current)
    enterTimerRef.current = setTimeout(() => setIsTransitioning(false), ANIM_DURATION)
  }, [investment?.id])

  useEffect(() => () => clearTimeout(enterTimerRef.current), [])

  // Keyboard
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
  }
  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const x = e.touches[0]?.clientX
    if (x !== undefined) setDragDelta(x - touchStartX.current)
  }
  function handleTouchEnd() {
    const d = dragDelta; touchStartX.current = null; setDragDelta(0)
    if (d < -SWIPE_THRESHOLD) onPrev?.()
    else if (d > SWIPE_THRESHOLD) onNext?.()
  }
  function handleMouseDown(e: React.MouseEvent) { mouseStartX.current = e.clientX }
  function handleMouseMove(e: React.MouseEvent) {
    if (mouseStartX.current === null) return
    setDragDelta(e.clientX - mouseStartX.current)
  }
  function handleMouseUp() {
    const d = dragDelta; mouseStartX.current = null; setDragDelta(0)
    if (d < -SWIPE_THRESHOLD) onPrev?.()
    else if (d > SWIPE_THRESHOLD) onNext?.()
  }

  const clampedDrag = Math.max(-18, Math.min(18, dragDelta * 0.35))

  const baseLeft = { left: '50%' } as const

  return (
    <>
      {/* Cartes sortantes — chacune vit jusqu'à la fin de sa propre animation */}
      {exitStack.map(({ uid, inv, dir, position: exitPos }) => (
        <div
          key={uid}
          aria-hidden="true"
          className={`${CARD_CLASSES} lg:left-[calc(50vw+112px)] pointer-events-none`}
          style={{
            ...baseLeft,
            bottom: '16px',
            zIndex: 99,
            animation: `${dir === 'left' ? 'card-exit-left' : dir === 'right' ? 'card-exit-right' : 'card-exit-down'} ${ANIM_DURATION}ms ease-out forwards`,
          }}
        >
          <CardContent investment={inv} total={total} currency={currency} onClose={onClose} position={exitPos} />
        </div>
      ))}

      {/* Carte principale — open/close + drag + enter animation */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={investment?.label ?? 'Détail investissement'}
        className={`${CARD_CLASSES} lg:left-[calc(50vw+112px)] select-none cursor-grab active:cursor-grabbing`}
        style={{
          ...baseLeft,
          bottom: '16px',
          zIndex: 100,
          transform: open
            ? `translateX(calc(-50% + ${dragDelta !== 0 ? clampedDrag : 0}px))`
            : 'translateX(-50%) translateY(calc(100% + 24px))',
          animation: isTransitioning
            ? `${animDir === 'left' ? 'card-enter-from-right' : 'card-enter-from-left'} ${ANIM_DURATION}ms ease-out forwards`
            : 'none',
          transition: isTransitioning || isClosing || dragDelta !== 0 ? 'none' : 'transform 0.3s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {investment && (
          <CardContent
            investment={investment}
            total={total}
            currency={currency}
            onClose={onClose}
            onNext={onNext}
            onPrev={onPrev}
            position={position}
          />
        )}
      </div>
    </>
  )
}

// ─── Contenu de la card ──────────────────────────────────────────────────────

function CardContent({
  investment, total, currency, onClose, onNext, onPrev, position,
}: {
  investment: Investment; total: number; currency: string
  onClose: () => void; onNext?: () => void; onPrev?: () => void
  position?: { current: number; total: number }
}) {
  const pct    = ((investment.value / total) * 100).toFixed(1)
  const change = DEMO_CHANGE[investment.id] ?? 0
  const color  = CATEGORY_COLORS[investment.category]
  const label  = CATEGORY_LABELS[investment.category]

  return (
    <div className="px-6 pt-5 pb-6">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
          style={{ backgroundColor: color.bg, color: color.text }}
        >
          {investment.label.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-neutral-900 dark:text-neutral-50 truncate">{investment.label}</p>
          <span className="text-sm font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color.bg}22`, color: color.bg }}>
            {label}
          </span>
        </div>
        <button
          onClick={onClose}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors shrink-0"
          aria-label="Fermer"
        >✕</button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Metric label="Valeur" value={formatCurrency(investment.value, currency)} highlight />
        <Metric label="Part" value={`${pct}%`} />
        <Metric label="Evolution" value={`${change >= 0 ? '+' : ''}${change.toFixed(1)}%`} positive={change >= 0} negative={change < 0} />
      </div>

      {position && (
        <div className="flex items-center justify-between">
          <button
            onClick={(e) => { e.stopPropagation(); onPrev?.() }}
            onMouseDown={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-neutral-400 dark:text-neutral-500"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Préc.
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: position.total }).map((_, i) => (
              <div key={i} className={`rounded-full transition-all duration-200 ${i === position.current - 1 ? 'w-4 h-1.5 bg-primary-500' : 'w-1.5 h-1.5 bg-neutral-300 dark:bg-neutral-600'}`} />
            ))}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onNext?.() }}
            onMouseDown={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-neutral-400 dark:text-neutral-500"
          >
            Suiv.
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      )}
    </div>
  )
}

function Metric({ label, value, highlight, positive, negative }: {
  label: string; value: string; highlight?: boolean; positive?: boolean; negative?: boolean
}) {
  let valueColor = 'text-neutral-800 dark:text-neutral-100'
  if (positive) valueColor = 'text-green-600 dark:text-green-400'
  if (negative) valueColor = 'text-red-500 dark:text-red-400'
  return (
    <div className="bg-neutral-50 dark:bg-neutral-700 rounded-2xl px-3 py-3">
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1 leading-tight">{label}</p>
      <p className={`text-base font-bold leading-tight ${highlight ? 'text-primary-700 dark:text-primary-400' : valueColor}`}>{value}</p>
    </div>
  )
}
