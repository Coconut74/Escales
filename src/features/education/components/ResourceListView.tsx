import { useState } from 'react'
import type { Resource, ResourceType } from '../education.types'
import { SAMPLE_RESOURCES } from '../education.types'
import Icon from '@/components/ui/Icon'
import { useT } from '@/lib/i18n'
import type { TKey } from '@/lib/i18n'

const SEARCH_KEY: Record<ResourceType, TKey> = {
  video:   'education.search.video',
  podcast: 'education.search.podcast',
  article: 'education.search.article',
  bref:    'education.search.article',
}

const TITLE_KEY: Record<ResourceType, TKey> = {
  video:   'education.videos',
  podcast: 'education.podcasts',
  article: 'education.articles',
  bref:    'education.bref',
}

interface Props {
  type: ResourceType
  onBack: () => void
}

export default function ResourceListView({ type, onBack }: Props) {
  const t = useT()
  const [query, setQuery] = useState('')

  const all: Resource[] = SAMPLE_RESOURCES.filter((r) => r.type === type)
  const filtered = query.trim()
    ? all.filter((r) => r.title.toLowerCase().includes(query.toLowerCase()))
    : all

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-neutral-100/90 dark:bg-neutral-900/90 backdrop-blur-md px-4 pt-6 pb-4">
        <button
          type="button"
          onClick={onBack}
          aria-label={t('common.back')}
          className="flex items-center gap-1.5 text-base font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100 mb-4 transition-colors"
        >
          <Icon name="arrow" size={20} className="rotate-180" />
          {t('common.back')}
        </button>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
          {t(TITLE_KEY[type])}
        </h1>
        {/* Barre de recherche */}
        <div className="relative w-full lg:max-w-[300px]">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(SEARCH_KEY[type])}
            aria-label={t(SEARCH_KEY[type])}
            className="w-full pl-4 pr-10 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-base text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-700 transition-colors"
          />
          <Icon name="search" size={20} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        </div>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-auto px-4 pb-32 lg:pb-8 pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
        {filtered.length === 0 ? (
          <p className="text-base text-neutral-400 dark:text-neutral-500 text-center py-16">
            {t('education.noResults')}
          </p>
        ) : (
          filtered.map((resource) => (
            <ResourceItem key={resource.id} resource={resource} />
          ))
        )}
      </div>
    </div>
  )
}

function ResourceItem({ resource }: { resource: Resource }) {
  const t = useT()

  function handleClick() {
    window.open(resource.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full text-left bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all"
    >
      {/* Thumbnail */}
      <div className="aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-700">
        <img
          src={resource.thumbnail}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
      {/* Infos */}
      <div className="px-4 py-3">
        <p className="font-semibold text-neutral-900 dark:text-neutral-50 leading-snug mb-1">
          {resource.title}
        </p>
        <p className="text-base text-neutral-500 dark:text-neutral-400">
          {resource.author} · {resource.duration}
        </p>
      </div>
    </button>
  )
}
