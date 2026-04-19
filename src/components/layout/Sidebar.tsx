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
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'Utilisateur'

  return (
    <aside
      className="hidden lg:flex fixed left-4 top-4 bottom-4 z-40 w-56 flex-col rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-neutral-900/75 border border-neutral-200/70 dark:border-white/10 shadow-xl shadow-neutral-300/40 dark:shadow-black/30"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 pt-6 pb-5">
        <span className="text-xl leading-none">🦉</span>
        <span className="text-base font-bold tracking-widest text-primary-500 uppercase">
          Escales
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 w-full text-left
                ${isActive
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 hover:text-neutral-700'
                }`}
            >
              <Icon name={item.icon} size={19} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="flex-1" />

      {/* User */}
      <div className="px-3 pb-5">
        <button
          onClick={() => onNavigate('profil')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 w-full text-left
            ${activeView === 'profil'
              ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
              : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 hover:text-neutral-700'
            }`}
        >
          <span className="text-base leading-none">{avatarEmoji || '👤'}</span>
          <span className="truncate">{displayName}</span>
        </button>
      </div>
    </aside>
  )
}
