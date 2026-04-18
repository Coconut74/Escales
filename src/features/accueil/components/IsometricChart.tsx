import { useMemo } from 'react'
import type { Investment } from '../accueil.types'

// ─── Dimensions ─────────────────────────────────────────────────────────────
const TW = 90,  HW = 45   // tuile : largeur / demi-largeur
const TH = 45,  HH = 22.5 // tuile : hauteur losange / demi-hauteur
const MAX_BAR_H = GY - 160 // hauteur max disponible (GY=240, viewBox top=140, marge 20px)
const EH = 2               // hauteur d'un emplacement vide (dalle plate)
const CX = 196             // centre SVG X
const GY = 240             // ancre Y du sol (position 0,0)

// ─── Couleurs ────────────────────────────────────────────────────────────────
const FILLED = { top: '#E17924', left: '#B95415', right: '#5F3012' }
const EMPTY  = { top: '#F2F3F7', left: '#E8EAF0', right: '#DDE0EA' }

// ─── Grille isométrique ──────────────────────────────────────────────────────
const GRID = [
  { col: 0, row: 0 },
  { col: 0, row: 1 },
  { col: 1, row: 0 },
  { col: 0, row: 2 },
  { col: 1, row: 1 },
  { col: 2, row: 0 },
  { col: 0, row: 3 },
  { col: 1, row: 2 },
  { col: 2, row: 1 },
  { col: 3, row: 0 },
  { col: 1, row: 3 },
  { col: 2, row: 2 },
  { col: 3, row: 1 },
  { col: 2, row: 3 },
  { col: 3, row: 2 },
  { col: 3, row: 3 },
]


function origin(col: number, row: number, layer: number, faceH: number) {
  return {
    x: CX + (col - row) * HW,
    y: GY + (col + row) * HH - layer * faceH,
  }
}

function poly(...pts: [number, number][]) {
  return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

export type SvgPoint = { x: number; y: number }

interface Props {
  investments: Investment[]
  total: number
  onSelect: (inv: Investment, svgPoint: SvgPoint) => void
  selected: Investment | null
}

export default function IsometricChart({ investments, total, onSelect, selected }: Props) {
  const sorted = useMemo(
    () => [...investments].sort((a, b) => b.value - a.value),
    [investments]
  )

  type Cube = {
    col: number; row: number; layer: number
    faceH: number; filled: boolean; isTop: boolean
    sortKey: number
    inv?: Investment; pct?: number
  }

  const cubes = useMemo((): Cube[] => {
    const totalValue = sorted.reduce((s, inv) => s + Number(inv.value), 0)
    const maxPct = sorted[0] && totalValue > 0 ? (sorted[0].value / totalValue) * 100 : 100
    const pxPerPct = MAX_BAR_H / maxPct
    const list: Cube[] = []
    GRID.forEach(({ col, row }, idx) => {
      const inv = sorted[idx]
      const filled = !!inv
      const pct = filled && totalValue > 0 ? (Number(inv!.value) / totalValue) * 100 : 0
      const faceH = filled ? Math.max(4, Math.round(pct * pxPerPct)) : EH
      list.push({
        col, row, layer: 1, faceH, filled,
        isTop: true,
        sortKey: (col + row) * 1000,
        inv: inv ?? undefined,
        pct: filled ? pct : undefined,
      })
    })
    return list.sort((a, b) => a.sortKey - b.sortKey)
  }, [sorted])

  return (
    <svg
      viewBox="0 140 392 310"
      width="100%"
      className="max-h-[52vh] lg:max-h-[78vh]"
      style={{ overflow: 'visible' }}
      role="img"
      aria-label="Carte isométrique du portefeuille"
    >
      {cubes.map(({ col, row, layer, faceH, filled, isTop, inv, pct }) => {
        const { x, y } = origin(col, row, layer, faceH)
        const c = filled ? FILLED : EMPTY
        const isSelected = !!selected && selected.id === inv?.id

        const topFace   = poly([x,y],[x+HW,y+HH],[x,y+TH],[x-HW,y+HH])
        const leftFace  = poly([x-HW,y+HH],[x,y+TH],[x,y+TH+faceH],[x-HW,y+HH+faceH])
        const rightFace = poly([x,y+TH],[x+HW,y+HH],[x+HW,y+HH+faceH],[x,y+TH+faceH])

        const key = `${col}-${row}-${layer}`

        return (
          <g
            key={key}
            onClick={filled && isTop && inv
              ? () => onSelect(inv, { x, y: y + HH })
              : undefined}
            style={{ cursor: filled ? 'pointer' : 'default' }}
          >
            <polygon points={leftFace}  fill={isSelected ? '#7A2E08' : c.left} />
            <polygon points={rightFace} fill={isSelected ? '#4A1D06' : c.right} />
            <polygon points={topFace}   fill={isSelected ? '#B95415' : c.top} />

            {filled && isTop && (
              <polygon points={topFace} fill="transparent" />
            )}

            {isTop && filled && pct !== undefined && (
              <text
                x={x} y={y + HH}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="18"
                fontWeight="800"
                fontFamily="Urbanist, sans-serif"
                fill="rgba(255,255,255,0.92)"
                style={{ pointerEvents: 'none' }}
              >
                {Math.round(pct)}%
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
