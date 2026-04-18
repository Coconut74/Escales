import type { View } from '@/App'

const TITLES: Record<View, string> = {
  journal: 'Journal de bord',
  map: 'Map du portefeuille',
  coffre: 'Coffre-fort à projets',
}

export default function Header({ activeView }: { activeView: View }) {
  return (
    <header className="h-14 bg-surface-raised border-b border-gray-200 flex items-center px-6">
      <h1 className="text-base font-semibold text-gray-800">{TITLES[activeView]}</h1>
    </header>
  )
}
