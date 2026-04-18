import { useMemo } from 'react'
import type { Investment } from '../accueil.types'
import { CATEGORY_COLORS } from '../accueil.types'

// ─── Dimensions isométriques ───────────────────────────────────────────────
const TW = 90    // largeur tuile
const HW = 45    // demi-largeur
const TH = 40    // hauteur face supérieure (losange)
const HH = 20    // demi-hauteur losange
const FH = 38    // hauteur des faces latérales (profondeur d'un niveau)
const CX = 162   // centre SVG X
const GY = 238   // ancre Y du sol (cube du bas en 0,0)
const BR = 22    // rayon du badge

// ─── Couleurs des cubes ────────────────────────────────────────────────────
const FILLED = { top: '#FCCFA9', left: '#E17924', right: '#B95415' }
const EMPTY  = { top: '#EAECF2', left: '#C8CDD8', right: '#B2B8C6' }

// ─── Positions sur la grille isométrique ──────────────────────────────────
// col=0,row=0 = centre arrière (le plus haut visuellement)
// col+row croissant = de plus en plus au premier plan
const GRID: { col: number; row: number }[] = [
  { col: 0, row: 0 }, // 0 → plus grand investissement (centre arrière)
  { col: 0, row: 1 }, // 1 → gauche milieu
  { col: 1, row: 0 }, // 2 → droite milieu
  { col: 0, row: 2 }, // 3 → gauche avant
  { col: 1, row: 1 }, // 4 → centre avant
  { col: 2, row: 0 }, // 5 → droite arrière (vide)
  { col: 1, row: 2 }, // 6 → centre bas (vide)
  { col: 2, row: 1 }, // 7 → droite bas (vide)
  { col: 2, row: 2 }, // 8 → angle avant-droit (vide)
]

function stackHeight(value: number, maxValue: number): number {
  const r = value / maxValue
  if (r >= 0.7) return 4
  if (r >= 0.45) return 3
  if (r >= 0.25) return 2
  return 1
}

// Coordonnées SVG du point central-haut de la face supérieure d'un cube
function cubeOrigin(col: number, row: number, layer: number) {
  return {
    x: CX + (col - row) * HW,
    y: GY + (col + row) * HH - layer * FH,
  }
}

function pts(...pairs: number[][]) {
  return pairs.map(([x, y]) => `${x},${y}`).join(' ')
}

interface Props {
  investments: Investment[]
  total: number
}

export default function IsometricChart({ investments, total }: Props) {
  const sorted = useMemo(
    () => [...investments].sort((a, b) => b.value - a.value),
    [investments]
  )
  const maxVal = sorted[0]?.value ?? 1

  type Cube = {
    col: number; row: number; layer: number
    filled: boolean; isTop: boolean
    sortKey: number
    inv?: Investment; pct?: number
  }

  const cubes = useMemo((): Cube[] => {
    const list: Cube[] = []
    GRID.forEach(({ col, row }, idx) => {
      const inv = sorted[idx]
      const h = inv ? stackHeight(inv.value, maxVal) : 1
      const pct = inv ? (inv.value / total) * 100 : 0
      for (let l = 0; l < h; l++) {
        list.push({
          col, row, layer: l,
          filled: !!inv,
          isTop: l === h - 1,
          sortKey: (col + row) * 200 + l,
          inv: inv ?? undefined,
          pct: inv ? pct : undefined,
        })
      }
    })
    return list.sort((a, b) => a.sortKey - b.sortKey)
  }, [sorted, maxVal, total])

  return (
    <svg
      viewBox="0 0 324 408"
      width="100%"
      style={{ overflow: 'visible', maxWidth: 380 }}
      role="img"
      aria-label="Carte isométrique du portefeuille"
    >
      {cubes.map(({ col, row, layer, filled, isTop, inv, pct }) => {
        const { x, y } = cubeOrigin(col, row, layer)
        const c = filled ? FILLED : EMPTY
        const color = inv ? CATEGORY_COLORS[inv.category] : null

        // Faces du cube
        const topFace  = pts([x,y], [x+HW,y+HH], [x,y+TH], [x-HW,y+HH])
        const leftFace = pts([x-HW,y+HH], [x,y+TH], [x,y+TH+FH], [x-HW,y+HH+FH])
        const rightFace= pts([x,y+TH], [x+HW,y+HH], [x+HW,y+HH+FH], [x,y+TH+FH])

        // Centre géométrique de la face gauche (pour le texte %)
        const txtX = x - HW * 0.5
        const txtY = y + (HH + TH + FH) / 2 + 2

        const key = `${col}-${row}-${layer}`

        return (
          <g key={key}>
            <polygon points={leftFace}  fill={c.left} />
            <polygon points={rightFace} fill={c.right} />
            <polygon points={topFace}   fill={c.top} />

            {/* Pourcentage sur la face gauche du cube du haut */}
            {isTop && filled && pct !== undefined && (
              <text
                x={txtX} y={txtY}
                textAnchor="middle"
                fontSize="15"
                fontWeight="700"
                fontFamily="Urbanist, sans-serif"
                fill="rgba(255,255,255,0.95)"
              >
                {pct.toFixed(0)}%
              </text>
            )}

            {/* Badge circulaire au-dessus du cube du haut */}
            {isTop && filled && inv && color && (
              <g>
                <circle
                  cx={x} cy={y - BR - 4}
                  r={BR}
                  fill="white"
                  stroke={color.bg}
                  strokeWidth={2.5}
                />
                <text
                  x={x} y={y - BR - 4}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="13"
                  fontWeight="700"
                  fontFamily="Urbanist, sans-serif"
                  fill={color.bg}
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
