import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'grey-outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary:        'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
  secondary:      'bg-primary-100 text-primary-700 hover:bg-primary-200 active:bg-primary-300',
  'grey-outline': 'bg-transparent text-neutral-700 border border-neutral-300 hover:bg-neutral-100 active:bg-neutral-200',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-3 text-sm',
  lg: 'px-6 py-4 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400
        disabled:opacity-40 disabled:pointer-events-none
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `.trim()}
      {...props}
    >
      {children}
    </button>
  )
}
