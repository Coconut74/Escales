import Icon from '@/components/ui/Icon'
import { useProfilStore } from '@/features/profil/profil.store'
import { useT } from '@/lib/i18n'
import type { View } from '@/App'

const ITEM_SIZE = 50
const GAP = 4

interface BottomNavProps {
  activeView: View
  onNavigate: (view: View) => void
}

export default function BottomNav({ activeView, onNavigate }: BottomNavProps) {
  const t = useT()
  const avatarId = useProfilStore((s) => s.avatarId)

  const NAV_ITEMS: { id: View; label: string; icon: 'accueil' | 'journal' | 'book' | 'profile' }[] = [
    { id: 'accueil',   label: t('nav.home'),      icon: 'accueil'  },
    { id: 'journal',   label: t('nav.journal'),   icon: 'journal'  },
    { id: 'education', label: t('nav.education'), icon: 'book'     },
    { id: 'profil',    label: t('nav.profile'),   icon: 'profile'  },
  ]

  const activeIndex = NAV_ITEMS.findIndex(i => i.id === activeView)

  return (
    <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <nav
        className="relative flex items-center gap-1 px-1.5 py-1.5 rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/70 dark:border-white/10 shadow-xl shadow-neutral-300/40 dark:shadow-black/30"
      >
        {/* orange sliding indicator */}
        <div
          aria-hidden
          className="absolute top-1.5 left-1.5 rounded-xl bg-primary-500"
          style={{
            width: ITEM_SIZE,
            height: ITEM_SIZE,
            transform: `translateX(${activeIndex * (ITEM_SIZE + GAP)}px)`,
            transition: 'transform 380ms cubic-bezier(0.25, 1.2, 0.5, 1)',
          }}
        />

        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              aria-label={item.label}
              className="relative z-10 flex items-center justify-center"
              style={{ width: ITEM_SIZE, height: ITEM_SIZE }}
            >
              {item.id === 'profil' ? (
                <img
                  src={`/avatars/${avatarId || 'avatar-1'}.png`}
                  alt="avatar"
                  className={`w-9 h-9 rounded-full object-cover ${isActive ? '' : 'opacity-60'}`}
                />
              ) : (
                <Icon
                  name={item.icon}
                  size={22}
                  className={isActive ? 'text-white' : 'text-neutral-400 dark:text-neutral-500'}
                />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
