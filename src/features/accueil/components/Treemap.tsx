import { useMemo } from 'react'
import type { Investment } from '../accueil.types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../accueil.types'
import { formatCurrency } from '@/lib/formatting'

interface TreemapProps {
  investments: Investment[]
  total: number
}

interface Block {
  investment: Investment
  pct: number
}

function TreemapBlock({ block, flex }: { block: Block; flex: number }) {
  const { bg, text } = CATEGORY_COLORS[block.investment.category]
  return (
    <div
      style={{ flex, backgroundColor: bg, color: text }}
      className="relative flex flex-col justify-end p-3 overflow-hidden rounded-xl m-0.5 min-h-[64px]"
    >
      {/* Fond watermark décoratif */}
      <div
        className="absolute top-2 right-2 text-6xl font-bold opacity-10 leading-none select-none"
        aria-hidden
      >
        {block.pct.toFixed(0)}
      </div>
      <p className="text-xs font-semibold opacity-80 leading-tight">
        {CATEGORY_LABELS[block.investment.category]}
      </p>
      <p className="text-sm font-semibold leading-tight truncate">
        {block.investment.label}
      </p>
      <p className="text-xs font-semibold opacity-70 mt-0.5">
        {formatCurrency(block.investment.value)} · {block.pct.toFixed(1)}%
      </p>
    </div>
  )
}

export default function Treemap({ investments, total }: TreemapProps) {
  const blocks: Block[] = useMemo(
    () =>
      [...investments]
        .sort((a, b) => b.value - a.value)
        .map((inv) => ({ investment: inv, pct: (inv.value / total) * 100 })),
    [investments, total]
  )

  if (blocks.length === 0 || !blocks[0]) return null

  const [first, ...rest] = blocks as [Block, ...Block[]]
  const firstFlex = first.pct
  const restFlex = 100 - firstFlex

  return (
    <div className="px-4 flex-1">
      <div className="flex h-72 lg:h-96">
        {/* Colonne gauche — plus grand actif */}
        <div style={{ flex: firstFlex }} className="flex flex-col">
          <TreemapBlock block={first} flex={1} />
        </div>

        {/* Colonne droite — reste empilé */}
        {rest.length > 0 && (
          <div style={{ flex: restFlex }} className="flex flex-col">
            {rest.map((block) => (
              <TreemapBlock key={block.investment.id} block={block} flex={block.pct} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
