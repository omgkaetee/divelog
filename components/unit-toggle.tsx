'use client'

import { cn } from '@/lib/utils'

interface UnitToggleProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  className?: string
}

export function UnitToggle<T extends string>({
  value,
  onChange,
  options,
  className,
}: UnitToggleProps<T>) {
  return (
    <div className={cn('flex rounded-md border border-input overflow-hidden', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'px-2 py-1 text-xs font-medium transition-colors',
            value === option.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
