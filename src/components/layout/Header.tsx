import type { View } from '@/App'

const TITLES: Record<View, string> = {
  map:     'Carte du portefeuille',
  journal: 'Journal de bord',
  planner: 'Planificateur',
}

export default function Header({ activeView }: { activeView: View }) {
  return (
    <header className="h-14 bg-surface-raised border-b border-neutral-200 flex items-center px-6">
      <h1 className="text-base font-semibold text-neutral-800">{TITLES[activeView]}</h1>
    </header>
  )
}
