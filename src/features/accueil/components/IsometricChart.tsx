import { useMemo } from 'react'
import type { Investment } from '../accueil.types'

// ─── Dimensions ─────────────────────────────────────────────────────────────
const TW = 90,  HW = 45   // tuile : largeur / demi-largeur
const TH = 45,  HH = 22.5 // tuile : hauteur losange / demi-hauteur
const FH = 24              // hauteur d'un niveau de cube rempli
const EH = 2               // hauteur d'un emplacement vide (dalle plate)
const MAX_STACKS = 4       // nombre max de niveaux
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

function stacks(value: number, maxValue: number): number {
  return Math.max(1, Math.round((value / maxValue) * MAX_STACKS))
}

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
  const maxVal = sorted[0]?.value ?? 1

  type Cube = {
    col: number; row: number; layer: number
    faceH: number; filled: boolean; isTop: boolean
    sortKey: number
    inv?: Investment; pct?: number
  }

  const cubes = useMemo((): Cube[] => {
    const list: Cube[] = []
    GRID.forEach(({ col, row }, idx) => {
      const inv = sorted[idx]
      const filled = !!inv
      const n = filled ? stacks(inv!.value, maxVal) : 1
      const faceH = filled ? FH : EH
      const pct = inv ? (inv.value / total) * 100 : 0
      for (let l = 0; l < n; l++) {
        list.push({
          col, row, layer: l, faceH, filled,
          isTop: l === n - 1,
          sortKey: (col + row) * 1000 + l,
          inv: inv ?? undefined,
          pct: inv ? pct : undefined,
        })
      }
    })
    return list.sort((a, b) => a.sortKey - b.sortKey)
  }, [sorted, maxVal, total])

  return (
    <svg
      viewBox="0 0 392 480"
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
