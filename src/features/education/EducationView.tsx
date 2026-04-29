import { useState } from 'react'
import type { ResourceType } from './education.types'
import ResourceListView from './components/ResourceListView'
import Icon from '@/components/ui/Icon'
import { useT } from '@/lib/i18n'
import type { TKey } from '@/lib/i18n'
import type { IconName } from '@/components/ui/Icon'

interface Category {
  id: ResourceType
  titleKey: TKey
  bg: string
  titleColor: string
  iconColor: string
  icon: IconName
}

const CATEGORIES: Category[] = [
  {
    id: 'video',
    titleKey: 'education.videos',
    bg: 'bg-green-50 dark:bg-green-950/40',
    titleColor: 'text-green-700 dark:text-green-400',
    iconColor: 'text-green-200 dark:text-green-900',
    icon: 'book',
  },
  {
    id: 'podcast',
    titleKey: 'education.podcasts',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    titleColor: 'text-orange-700 dark:text-orange-400',
    iconColor: 'text-orange-200 dark:text-orange-900',
    icon: 'feed',
  },
  {
    id: 'article',
    titleKey: 'education.articles',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    titleColor: 'text-purple-700 dark:text-purple-400',
    iconColor: 'text-purple-200 dark:text-purple-900',
    icon: 'write',
  },
  {
    id: 'bref',
    titleKey: 'education.bref',
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    titleColor: 'text-sky-700 dark:text-sky-400',
    iconColor: 'text-sky-200 dark:text-sky-900',
    icon: 'external-link',
  },
]

export default function EducationView() {
  const t = useT()
  const [activeCategory, setActiveCategory] = useState<ResourceType | null>(null)

  if (activeCategory && activeCategory !== 'bref') {
    return <ResourceListView type={activeCategory} onBack={() => setActiveCategory(null)} />
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-neutral-100/90 dark:bg-neutral-900/90 backdrop-blur-md px-4 pt-6 pb-3">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
          {t('education.title')}
        </h1>
      </div>

      {/* Grille des catégories */}
      <div className="flex-1 overflow-auto px-4 pb-32 lg:pb-8 pt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 content-start">
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            onClick={() => setActiveCategory(cat.id)}
          />
        ))}
      </div>

      {/* Modal "En bref" */}
      {activeCategory === 'bref' && (
        <BrefModal onClose={() => setActiveCategory(null)} />
      )}
    </div>
  )
}

function CategoryCard({ category, onClick }: { category: Category; onClick: () => void }) {
  const t = useT()

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t(category.titleKey)}
      className={`relative w-full text-left rounded-3xl overflow-hidden p-5 h-28 border border-black/10 dark:border-white/10 ${category.bg} transition-opacity hover:opacity-90`}
    >
      {/* Titre + chevron */}
      <div className="flex items-center justify-between w-full relative z-10">
        <span className={`text-base font-extrabold uppercase tracking-wide ${category.titleColor}`}>
          {t(category.titleKey)}
        </span>
        <Icon name="arrow" size={20} className={category.titleColor} />
      </div>

      {/* Icône décorative */}
      <div className={`absolute -bottom-3 -right-3 ${category.iconColor}`} aria-hidden="true">
        <Icon name={category.icon} size={96} />
      </div>
    </button>
  )
}

function BrefModal({ onClose }: { onClose: () => void }) {
  const t = useT()
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="bref-title" className="fixed inset-0 z-[60] flex items-end lg:items-center justify-center bg-black/40 backdrop-blur-sm p-4 lg:p-8">
      <div className="w-full max-w-sm bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-200 dark:border-neutral-700 shadow-2xl p-8 flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center">
          <Icon name="external-link" size={28} className="text-sky-500" />
        </div>
        <p id="bref-title" className="text-base font-semibold text-neutral-800 dark:text-neutral-100">{t('education.bref')}</p>
        <p className="text-base text-neutral-500 dark:text-neutral-400">{t('education.brefSoon')}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-700 text-base font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
        >
          {t('common.close')}
        </button>
      </div>
    </div>
  )
}
