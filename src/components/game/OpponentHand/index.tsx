import React from 'react'
import { motion } from 'framer-motion'
import { PlayerId } from '../../../core/types'
import { useGameStore } from '../../../store/gameStore'
import { cn } from '../../../utils/helpers'

interface OpponentHandProps {
  playerId: PlayerId
  orientation: 'top' | 'left' | 'right'
  className?: string
}

export const OpponentHand: React.FC<OpponentHandProps> = ({
  playerId,
  orientation,
  className,
}) => {
  const { gameState } = useGameStore()
  const player = gameState.players[playerId]
  const cardCount = player.hand.length
  const isThinking = gameState.aiThinkingPlayerId === playerId

  const cardStyle: React.CSSProperties = {
    width: 42,
    height: 58,
    borderRadius: 6,
    background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #1B4332 100%)',
    border: '1px solid rgba(200,151,58,0.25)',
    boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
    position: 'absolute',
  }

  // Render fan of face-down cards
  const renderCards = () => {
    if (orientation === 'top') {
      return Array.from({ length: cardCount }).map((_, i) => {
        const offset = cardCount > 1
          ? ((i / (cardCount - 1)) - 0.5) * Math.min(140, cardCount * 11)
          : 0
        const rotation = cardCount > 1
          ? ((i / (cardCount - 1)) - 0.5) * 12
          : 0
        return (
          <div
            key={i}
            style={{
              ...cardStyle,
              transform: `translateX(${offset}px) rotate(${rotation}deg)`,
              zIndex: i,
            }}
          />
        )
      })
    }

    // Side hands — rotate cards 90 degrees
    return Array.from({ length: cardCount }).map((_, i) => {
      const offset = cardCount > 1
        ? ((i / (cardCount - 1)) - 0.5) * Math.min(110, cardCount * 9)
        : 0
      return (
        <div
          key={i}
          style={{
            ...cardStyle,
            width: 34,
            height: 50,
            transform: `translateY(${offset}px)`,
            zIndex: i,
          }}
        />
      )
    })
  }

  const containerStyle: React.CSSProperties =
    orientation === 'top'
      ? { position: 'relative', width: 220, height: 70 }
      : { position: 'relative', width: 50, height: Math.min(160, cardCount * 10 + 60) }

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div style={containerStyle} className="relative flex items-center justify-center">
        {renderCards()}
        {/* Thinking indicator */}
        {isThinking && (
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gold font-sans whitespace-nowrap"
          >
            thinking…
          </motion.div>
        )}
      </div>
      <div className="text-xs text-text-muted font-sans">{cardCount} cards</div>
    </div>
  )
}
