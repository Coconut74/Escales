import { InputHTMLAttributes } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function TextField({ label, error, className = '', id, ...props }: TextFieldProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-4 py-3.5 rounded-xl border text-sm font-sans
          bg-white dark:bg-neutral-700 placeholder-neutral-400 dark:placeholder-neutral-500 text-neutral-900 dark:text-neutral-50
          border-neutral-200 dark:border-neutral-600 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800
          disabled:bg-neutral-50 dark:disabled:bg-neutral-800 disabled:text-neutral-400
          ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}
          ${className}
        `.trim()}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
