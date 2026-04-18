import { useMemo } from 'react'
import type { Investment } from '../accueil.types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../accueil.types'

// ─── Dimensions ─────────────────────────────────────────────────────────────
const TW = 90,  HW = 45   // tuile : largeur / demi-largeur
const TH = 45,  HH = 22.5 // tuile : hauteur losange / demi-hauteur
const FH = 24              // hauteur d'un niveau de cube rempli
const EH = 2               // hauteur d'un emplacement vide (dalle plate)
const MAX_STACKS = 4       // nombre max de niveaux
const CX = 196             // centre SVG X
const GY = 240             // ancre Y du sol (position 0,0)
const BR = 20              // rayon badge

// ─── Couleurs ────────────────────────────────────────────────────────────────
const FILLED = { top: '#FCCFA9', left: '#E17924', right: '#B95415' }
const EMPTY  = { top: '#F2F3F7', left: '#E8EAF0', right: '#DDE0EA' }

// ─── Grille isométrique ──────────────────────────────────────────────────────
// (0,0) = centre arrière, le plus élevé visuellement
// col+row croissant = au premier plan
const GRID = [
  { col: 0, row: 0 }, // slot 0 → plus grand
  { col: 0, row: 1 }, // slot 1
  { col: 1, row: 0 }, // slot 2
  { col: 0, row: 2 }, // slot 3
  { col: 1, row: 1 }, // slot 4
  // 11 cases vides
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

interface Props {
  investments: Investment[]
  total: number
  onSelect: (inv: Investment) => void
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
      style={{ overflow: 'visible', maxHeight: '52vh' }}
      role="img"
      aria-label="Carte isométrique du portefeuille"
    >
      {cubes.map(({ col, row, layer, faceH, filled, isTop, inv, pct }) => {
        const { x, y } = origin(col, row, layer, faceH)
        const c = filled ? FILLED : EMPTY
        const isSelected = !!selected && selected.id === inv?.id
        const color = inv ? CATEGORY_COLORS[inv.category] : null

        // Faces
        const topFace   = poly([x,y],[x+HW,y+HH],[x,y+TH],[x-HW,y+HH])
        const leftFace  = poly([x-HW,y+HH],[x,y+TH],[x,y+TH+faceH],[x-HW,y+HH+faceH])
        const rightFace = poly([x,y+TH],[x+HW,y+HH],[x+HW,y+HH+faceH],[x,y+TH+faceH])

        // Centre géométrique de la face gauche
        const lblX = x - HW * 0.5
        const lblY = y + (HH + TH + faceH) / 2 + 2

        const key = `${col}-${row}-${layer}`

        return (
          <g
            key={key}
            onClick={filled && isTop && inv ? () => onSelect(inv) : undefined}
            style={{ cursor: filled ? 'pointer' : 'default' }}
          >
            {/* Faces du cube */}
            <polygon points={leftFace}  fill={isSelected ? '#C85E10' : c.left} />
            <polygon points={rightFace} fill={isSelected ? '#9E490D' : c.right} />
            <polygon points={topFace}   fill={isSelected ? '#FAB97A' : c.top} />

            {/* Zone cliquable (top face agrandie pour faciliter le tap) */}
            {filled && isTop && (
              <polygon points={topFace} fill="transparent" />
            )}

            {/* % sur la face gauche — uniquement pour les cubes remplis du sommet */}
            {isTop && filled && pct !== undefined && faceH > 10 && (
              <text
                x={lblX} y={lblY}
                textAnchor="middle"
                fontSize="16"
                fontWeight="700"
                fontFamily="Urbanist, sans-serif"
                fill="rgba(255,255,255,0.95)"
                style={{ pointerEvents: 'none' }}
              >
                {pct.toFixed(0)}%
              </text>
            )}

            {/* Badge au-dessus du sommet */}
            {isTop && filled && inv && color && (
              <g style={{ pointerEvents: 'none' }}>
                <circle
                  cx={x} cy={y - BR - 5}
                  r={BR}
                  fill={isSelected ? color.bg : 'white'}
                  stroke={color.bg}
                  strokeWidth={2.5}
                />
                <text
                  x={x} y={y - BR - 5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fontWeight="800"
                  fontFamily="Urbanist, sans-serif"
                  fill={isSelected ? 'white' : color.bg}
                >
                  {inv.label.slice(0, 3).toUpperCase()}
                </text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}
