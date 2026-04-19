import Icon from '@/components/ui/Icon'
import { useProfilStore } from '@/features/profil/profil.store'
import type { View } from '@/App'

const NAV_ITEMS: { id: View; label: string; icon: 'accueil' | 'journal' | 'event' }[] = [
  { id: 'accueil', label: 'Accueil',         icon: 'accueil' },
  { id: 'journal', label: 'Journal de bord', icon: 'journal' },
  { id: 'planner', label: 'Planner',         icon: 'event'   },
]

interface SidebarProps {
  activeView: View
  onNavigate: (view: View) => void
}

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const { firstName, lastName, avatarEmoji } = useProfilStore()
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'Mon profil'

  return (
    <nav className="hidden lg:flex w-56 bg-surface-raised dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 flex-col py-6 px-3 gap-1">
      <span className="text-xl font-semibold text-primary-600 px-3 mb-6 tracking-tight">
        Escales
      </span>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors
            ${activeView === item.id
              ? 'bg-primary-600 text-white'
              : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-800 dark:hover:text-neutral-100'
            }`}
        >
          <Icon name={item.icon} size={20} />
          {item.label}
        </button>
      ))}

      <div className="flex-1" />

      <button
        onClick={() => onNavigate('profil')}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors
          ${activeView === 'profil'
            ? 'bg-primary-600 text-white'
            : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-800 dark:hover:text-neutral-100'
          }`}
      >
        <div className="w-5 h-5 rounded-md bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-xs leading-none flex-shrink-0">
          {avatarEmoji}
        </div>
        <span className="truncate">{displayName}</span>
      </button>
    </nav>
  )
}
