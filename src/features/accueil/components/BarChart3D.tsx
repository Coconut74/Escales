import { useMemo } from 'react'
import type { Investment } from '../accueil.types'
import { CATEGORY_COLORS } from '../accueil.types'
import { formatCurrency } from '@/lib/formatting'

interface BarChart3DProps {
  investments: Investment[]
}

export default function BarChart3D({ investments }: BarChart3DProps) {
  const sorted = useMemo(
    () => [...investments].sort((a, b) => b.value - a.value),
    [investments]
  )

  const maxValue = sorted[0]?.value ?? 1

  return (
    <div className="flex flex-col items-center justify-center w-full" style={{ height: '40%' }}>

      {/* Zone graphique 3D */}
      <div className="w-full max-w-xs px-4" style={{ perspective: '600px' }}>
        <div
          className="flex items-end gap-1.5 h-36"
          style={{ transform: 'rotateX(-20deg)', transformOrigin: 'bottom center' }}
        >
          {sorted.map((inv) => {
            const heightPct = (inv.value / maxValue) * 100
            const { bg } = CATEGORY_COLORS[inv.category]
            return (
              <div
                key={inv.id}
                className="relative flex-1 rounded-t-md overflow-hidden"
                style={{ height: `${heightPct}%`, backgroundColor: bg }}
              >
                {/* Tranche lumineuse en haut — face supérieure simulée */}
                <div
                  className="absolute inset-x-0 top-0 h-2 rounded-t-md"
                  style={{ backgroundColor: 'rgba(255,255,255,0.35)' }}
                />
                {/* Ombre droite — face latérale simulée */}
                <div
                  className="absolute inset-y-0 right-0 w-1.5"
                  style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
                />
              </div>
            )
          })}
        </div>

        {/* Sol */}
        <div className="h-px bg-neutral-300 dark:bg-neutral-600" />
      </div>

      {/* Légende — hors du transform 3D */}
      <div className="flex gap-1.5 w-full max-w-xs px-4 mt-3">
        {sorted.map((inv) => {
          const { bg } = CATEGORY_COLORS[inv.category]
          return (
            <div key={inv.id} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: bg }} />
              <p className="text-[9px] text-neutral-400 dark:text-neutral-500 leading-tight text-center truncate w-full">
                {inv.label}
              </p>
              <p className="text-[9px] font-semibold text-neutral-600 dark:text-neutral-300 leading-none">
                {formatCurrency(inv.value, 'EUR').replace(/\s/g, '\u202f')}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
