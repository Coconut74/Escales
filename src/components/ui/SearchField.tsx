import { InputHTMLAttributes } from 'react'
import Icon from './Icon'

interface SearchFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export default function SearchField({ label, className = '', id, ...props }: SearchFieldProps) {
  const inputId = id ?? 'search-field'
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-neutral-700">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
          <Icon name="search" size={18} />
        </span>
        <input
          id={inputId}
          type="search"
          className={`
            w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm font-sans
            bg-white dark:bg-neutral-700 placeholder-neutral-400 dark:placeholder-neutral-500 text-neutral-900 dark:text-neutral-50
            border-neutral-200 dark:border-neutral-600 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800
            ${className}
          `.trim()}
          {...props}
        />
      </div>
    </div>
  )
}
