import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { searchSymbol } from '@/services/finnhub'
import type { FinnhubSearchResult } from '@/services/finnhub'
import { useT } from '@/lib/i18n'
import Icon from '@/components/ui/Icon'

interface Props {
  ticker?: string
  apiKey: string
  onSelect: (symbol: string) => void
  onUnlink: () => void
}

export default function TickerField({ ticker, apiKey, onSelect, onUnlink }: Props) {
  const t = useT()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FinnhubSearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const node = e.target as Node
      if (
        wrapRef.current && !wrapRef.current.contains(node) &&
        dropdownRef.current && !dropdownRef.current.contains(node)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function openDropdown() {
    if (inputRef.current) setDropdownRect(inputRef.current.getBoundingClientRect())
    setOpen(true)
  }

  function handleChange(v: string) {
    setQuery(v)
    openDropdown()
    clearTimeout(timerRef.current)
    if (!apiKey || v.length < 1) { setResults([]); return }
    timerRef.current = setTimeout(async () => {
      setSearching(true)
      try { setResults(await searchSymbol(v, apiKey)) }
      catch { setResults([]) }
      finally { setSearching(false) }
    }, 350)
  }

  if (ticker) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20">
        <Icon name="chart" size={20} className="text-primary-600 dark:text-primary-400 shrink-0" />
        <span className="text-base font-bold text-primary-700 dark:text-primary-300 font-mono">{ticker}</span>
        <span className="text-base text-primary-500 dark:text-primary-400">{t('edit.livePriceEnabled')}</span>
        <button
          onClick={onUnlink}
          onMouseDown={(e) => e.stopPropagation()}
          className="ml-auto text-primary-400 hover:text-primary-600 dark:hover:text-primary-200 text-base leading-none"
          aria-label="Délier"
        >×</button>
      </div>
    )
  }

  const dropdown = open && results.length > 0 && dropdownRect
    ? createPortal(
        <div
          ref={dropdownRef}
          style={{ position: 'fixed', top: dropdownRect.bottom + 4, left: dropdownRect.left, width: dropdownRect.width, zIndex: 9999 }}
          className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl max-h-48 overflow-y-auto"
        >
          {results.map((r) => (
            <button
              key={r.symbol}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onSelect(r.symbol); setQuery(''); setResults([]); setOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-left transition-colors"
            >
              <span className="text-base font-bold text-neutral-900 dark:text-neutral-50 font-mono w-24 shrink-0">{r.displaySymbol}</span>
              <span className="text-base text-neutral-500 dark:text-neutral-400 truncate">{r.description}</span>
              <span className="text-base text-neutral-400 dark:text-neutral-500 shrink-0 ml-auto">{r.type}</span>
            </button>
          ))}
        </div>,
        document.body
      )
    : null

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => { if (results.length > 0) openDropdown() }}
          placeholder={apiKey ? t('edit.linkTicker') : t('edit.configureFinnhub')}
          disabled={!apiKey}
          className="w-full px-3 py-2 pl-10 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 text-base placeholder:text-neutral-400 dark:placeholder:text-neutral-500 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
          {searching ? (
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.25"/><path d="M21 12a9 9 0 00-9-9" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          )}
        </span>
      </div>
      {dropdown}
    </div>
  )
}
