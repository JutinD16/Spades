import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '../../../core/types'
import { isRed } from '../../../core/card'
import { RANK_NAMES, SUIT_SYMBOLS } from '../../../core/constants'
import { cn } from '../../../utils/helpers'

interface CardComponentProps {
  card: Card
  isLegal?: boolean
  isSelected?: boolean
  isFaceDown?: boolean
  onClick?: (card: Card) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  style?: React.CSSProperties
}

const sizes = {
  sm: { width: 52, height: 74, rankSize: 'text-xs', suitSize: 'text-sm', centerSize: 'text-lg' },
  md: { width: 64, height: 90, rankSize: 'text-sm', suitSize: 'text-base', centerSize: 'text-2xl' },
  lg: { width: 76, height: 106, rankSize: 'text-sm', suitSize: 'text-base', centerSize: 'text-2xl' },
}

export const CardComponent: React.FC<CardComponentProps> = ({
  card,
  isLegal = true,
  isSelected = false,
  isFaceDown = false,
  onClick,
  className,
  size = 'md',
  style,
}) => {
  const dims = sizes[size]
  const red = isRed(card)
  const suitColor = red ? 'text-[#C41E3A]' : 'text-[#1A1A1A]'
  const rank = RANK_NAMES[card.rank]
  const suit = SUIT_SYMBOLS[card.suit]
  const isClickable = isLegal && onClick

  const handleClick = () => {
    if (isClickable) onClick!(card)
  }

  if (isFaceDown) {
    return (
      <div
        className={cn('card-back rounded-lg select-none', className)}
        style={{
          width: dims.width,
          height: dims.height,
          background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #1B4332 100%)',
          border: '1px solid rgba(200,151,58,0.3)',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          ...style,
        }}
      >
        {/* Card back pattern */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 7,
            background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(200,151,58,0.08) 3px, rgba(200,151,58,0.08) 6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: 'rgba(200,151,58,0.6)', fontSize: dims.centerSize.replace('text-', '') === '2xl' ? 20 : 16 }}>♠</span>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      whileHover={isLegal && onClick ? { y: -10, scale: 1.04 } : {}}
      whileTap={isLegal && onClick ? { scale: 0.98 } : {}}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      onClick={handleClick}
      className={cn(
        'card-face select-none',
        isLegal && onClick ? 'cursor-pointer' : isLegal ? '' : 'illegal',
        isSelected && 'selected',
        className,
      )}
      style={{
        width: dims.width,
        height: dims.height,
        padding: '3px 4px',
        position: 'relative',
        ...style,
      }}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? `Play ${rank} of ${card.suit.toLowerCase()}` : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick() }}
    >
      {/* Top-left rank + suit */}
      <div className="absolute top-1 left-1 flex flex-col items-center leading-none">
        <span className={cn('font-bold font-sans', suitColor, dims.rankSize)}>{rank}</span>
        <span className={cn(suitColor, dims.suitSize)} style={{ lineHeight: 1 }}>{suit}</span>
      </div>

      {/* Center suit symbol */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn(suitColor, dims.centerSize)} style={{ opacity: 0.15, fontSize: parseInt(dims.centerSize.replace('text-', '')) * 6 + 'px' }}>{suit}</span>
      </div>

      {/* Center rank (overlay) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn('font-bold font-sans', suitColor, dims.centerSize)}>{rank}</span>
      </div>

      {/* Bottom-right rank + suit (rotated) */}
      <div
        className="absolute bottom-1 right-1 flex flex-col items-center leading-none"
        style={{ transform: 'rotate(180deg)' }}
      >
        <span className={cn('font-bold font-sans', suitColor, dims.rankSize)}>{rank}</span>
        <span className={cn(suitColor, dims.suitSize)} style={{ lineHeight: 1 }}>{suit}</span>
      </div>

      {/* Illegal overlay */}
      {!isLegal && (
        <div className="absolute inset-0 rounded-lg bg-black/20" style={{ borderRadius: 7 }} />
      )}
    </motion.div>
  )
}
