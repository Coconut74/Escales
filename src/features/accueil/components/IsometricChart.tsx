import { useMemo, useImperativeHandle, forwardRef } from 'react'
import type { Investment } from '../accueil.types'
import { useProfilStore } from '@/features/profil/profil.store'
import { useIsDark } from '@/features/profil/useIsDark'
import { COLOR_THEME_BARS } from '@/features/profil/color-themes'

// ─── Dimensions ─────────────────────────────────────────────────────────────
const TW = 90,  HW = 45
const TH = 45,  HH = 22.5
const EH = 2
const CX = 196
const GY = 240
const MAX_BAR_H = GY - 160

// ─── Couleurs ────────────────────────────────────────────────────────────────
function darken(hex: string, amount = 0.25): string {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, (n >> 16) - Math.round(((n >> 16)) * amount))
  const g = Math.max(0, ((n >> 8) & 0xff) - Math.round(((n >> 8) & 0xff) * amount))
  const b = Math.max(0, (n & 0xff) - Math.round((n & 0xff) * amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

const EMPTY_LIGHT = { top: '#E4E6F2', left: '#D5D8E8', right: '#BEC3D6' }
const EMPTY_DARK  = { top: '#2E3148', left: '#252840', right: '#1C1E33' }

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

export interface IsometricChartHandle {
  getBarPosition: (id: string) => SvgPoint | null
}

interface Props {
  investments: Investment[]
  total: number
  onSelect: (inv: Investment, svgPoint: SvgPoint) => void
  selected: Investment | null
}

const IsometricChart = forwardRef<IsometricChartHandle, Props>(function IsometricChart(
  { investments, total, onSelect, selected }, ref
) {
  const colorTheme = useProfilStore((s) => s.colorTheme)
  const isDark = useIsDark()
  const EMPTY = isDark ? EMPTY_DARK : EMPTY_LIGHT
  const FILLED = COLOR_THEME_BARS[colorTheme]
  // Face selected = version plus sombre du thème (face du bas surtout)
  const SELECTED = { top: FILLED.left, left: FILLED.right, right: darken(FILLED.right) }

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

  // Expose la position SVG de chaque barre pour le zoom externe
  useImperativeHandle(ref, () => ({
    getBarPosition: (id: string): SvgPoint | null => {
      const cube = cubes.find((c) => c.inv?.id === id)
      if (!cube) return null
      const { x, y } = origin(cube.col, cube.row, cube.layer, cube.faceH)
      return { x, y: y + HH }
    },
  }), [cubes])

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
            <polygon points={leftFace}  fill={isSelected ? SELECTED.left  : c.left} />
            <polygon points={rightFace} fill={isSelected ? SELECTED.right : c.right} />
            <polygon points={topFace}   fill={isSelected ? SELECTED.top   : c.top} />

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
})

export default IsometricChart
