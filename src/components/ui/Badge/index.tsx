import React from 'react'
import { cn } from '../../../utils/helpers'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'gold' | 'ns' | 'we' | 'neutral' | 'success' | 'danger'
  size?: 'sm' | 'md'
  className?: string
}

const variants = {
  gold: 'bg-gold/20 text-gold-bright border border-gold/40',
  ns: 'bg-team-ns/20 text-team-ns border border-team-ns/40',
  we: 'bg-team-we/20 text-team-we border border-team-we/40',
  neutral: 'bg-white/10 text-text-muted border border-white/20',
  success: 'bg-green-900/30 text-green-400 border border-green-700/40',
  danger: 'bg-red-900/30 text-red-400 border border-red-700/40',
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs rounded-md',
  md: 'px-3 py-1 text-sm rounded-lg',
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-sans font-medium whitespace-nowrap',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  )
}
