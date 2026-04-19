import Icon from '@/components/ui/Icon'
import type { View } from '@/App'

const NAV_ITEMS: { id: View; label: string; icon: 'accueil' | 'journal' | 'event' | 'profile' }[] = [
  { id: 'accueil', label: 'Accueil',         icon: 'accueil'  },
  { id: 'journal', label: 'Journal de bord', icon: 'journal'  },
  { id: 'planner', label: 'Planner',         icon: 'event'    },
  { id: 'profil',  label: 'Profil',          icon: 'profile'  },
]

interface BottomNavProps {
  activeView: View
  onNavigate: (view: View) => void
}

export default function BottomNav({ activeView, onNavigate }: BottomNavProps) {
  return (
    <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <nav className="flex items-center gap-4 px-5 py-3 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-lg">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              aria-label={item.label}
              className={`
                flex items-center justify-center rounded-xl transition-all
                ${isActive
                  ? 'bg-primary-600 text-white p-3 shadow-md'
                  : 'text-neutral-500 dark:text-neutral-400 p-2 hover:text-neutral-700 dark:hover:text-neutral-200'}
              `}
            >
              <Icon name={item.icon} size={isActive ? 26 : 24} />
            </button>
          )
        })}
      </nav>
    </div>
  )
}
