import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'
import { formatCurrency, formatDate } from '@/lib/formatting'

export interface ChartPoint {
  date: string
  value: number
  isLive?: boolean
}

interface Props {
  data: ChartPoint[]
  currency: string
}

function CustomDot(props: { cx?: number; cy?: number; payload?: ChartPoint }) {
  const { cx, cy, payload } = props
  if (!payload?.isLive || cx == null || cy == null) return null
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="#6366f1" stroke="#fff" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={9} fill="#6366f1" fillOpacity={0.2} />
    </g>
  )
}

function CustomTooltip({ active, payload, currency: curr }: {
  active?: boolean
  payload?: Array<{ value: number; payload: ChartPoint }>
  currency: string
}) {
  if (!active || !payload?.length) return null
  const point = payload[0]
  if (!point) return null
  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 shadow-lg text-base">
      <p className="text-neutral-500 dark:text-neutral-400">{formatDate(point.payload.date)}</p>
      <p className="font-bold text-neutral-900 dark:text-neutral-50">{formatCurrency(point.value, curr)}</p>
      {point.payload.isLive && (
        <p className="text-primary-600 dark:text-primary-400 font-semibold">● Live</p>
      )}
    </div>
  )
}

export default function InvestmentLineChart({ data, currency }: Props) {
  if (data.length === 0) return null

  if (data.length === 1) {
    const point = data[0]!
    return (
      <div className="h-[180px] flex flex-col items-center justify-center gap-2">
        <div className="w-3 h-3 rounded-full bg-primary-500 ring-4 ring-primary-200 dark:ring-primary-900/40" />
        <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50 tabular-nums">
          {formatCurrency(point.value, currency)}
        </p>
        <p className="text-base text-neutral-400 dark:text-neutral-500">
          {formatDate(point.date)}
        </p>
      </div>
    )
  }

  const values = data.map((d) => d.value)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const padding = (maxVal - minVal) * 0.15 || maxVal * 0.1 || 100

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => {
            const date = new Date(d)
            return `${date.getDate()}/${date.getMonth() + 1}`
          }}
          tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[minVal - padding, maxVal + padding]}
          tickFormatter={(v: number) => {
            if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
            if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`
            return `${v}`
          }}
          tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip content={<CustomTooltip currency={currency} />} />
        {data.length > 1 && (
          <ReferenceLine
            y={data[0]?.value}
            stroke="currentColor"
            strokeOpacity={0.12}
            strokeDasharray="4 4"
          />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke="#6366f1"
          strokeWidth={2.5}
          dot={<CustomDot />}
          activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
