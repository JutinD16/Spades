import React from 'react'
import { cn } from '../../../utils/helpers'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const variants = {
  primary:
    'bg-gradient-to-b from-[#E8B84B] to-[#C8973A] text-[#112B20] font-semibold border border-[#8A6520] hover:from-yellow-300 hover:to-[#E8B84B] active:from-[#C8973A] active:to-[#8A6520]',
  secondary:
    'bg-[#2D6A4F] text-[#F0ECD8] border border-[#2D6A4F] hover:bg-[#1B4332] hover:border-[#8A6520]',
  ghost:
    'bg-transparent text-[#F0ECD8] border border-transparent hover:border-[#8A6520] hover:text-[#C8973A]',
  danger:
    'bg-transparent text-red-400 border border-red-800 hover:bg-red-900/30 hover:text-red-300',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-5 py-2.5 text-base rounded-lg',
  lg: 'px-8 py-3.5 text-lg rounded-xl',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', className, children, disabled, onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={cn(
          'inline-flex items-center justify-center font-sans transition-all duration-150 select-none',
          'hover:scale-[1.02] active:scale-[0.97]',
          variants[variant],
          sizes[size],
          disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
          className,
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
