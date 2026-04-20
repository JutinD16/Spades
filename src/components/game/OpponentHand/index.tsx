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

// Visible card back — ivory with gold border so it pops against the green felt
const cardBackStyle = (w: number, h: number): React.CSSProperties => ({
  width: w,
  height: h,
  borderRadius: 6,
  backgroundColor: '#F5F0E0',
  border: '2px solid #C8973A',
  boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
})

const CardBack: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <div style={cardBackStyle(w, h)}>
    {/* Crosshatch inner border */}
    <div style={{
      position: 'absolute',
      inset: 4,
      border: '1px solid rgba(200,151,58,0.5)',
      borderRadius: 3,
      background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(200,151,58,0.12) 4px, rgba(200,151,58,0.12) 5px)',
    }} />
    <span style={{ color: 'rgba(200,151,58,0.6)', fontSize: Math.max(14, h * 0.22), position: 'relative' }}>♠</span>
  </div>
)

export const OpponentHand: React.FC<OpponentHandProps> = ({
  playerId,
  orientation,
  className,
}) => {
  const { gameState } = useGameStore()
  const player = gameState.players[playerId]
  const cardCount = player.hand.length
  const isThinking = gameState.aiThinkingPlayerId === playerId

  const renderCards = () => {
    if (orientation === 'top') {
      const maxSpread = Math.min(160, cardCount * 13)
      return Array.from({ length: cardCount }).map((_, i) => {
        const offset = cardCount > 1 ? ((i / (cardCount - 1)) - 0.5) * maxSpread : 0
        const rotation = cardCount > 1 ? ((i / (cardCount - 1)) - 0.5) * 14 : 0
        return (
          <div key={i} style={{ position: 'absolute', transform: `translateX(${offset}px) rotate(${rotation}deg)`, zIndex: i }}>
            <CardBack w={44} h={62} />
          </div>
        )
      })
    }

    // Side hands — stacked vertically
    const maxSpread = Math.min(120, cardCount * 10)
    return Array.from({ length: cardCount }).map((_, i) => {
      const offset = cardCount > 1 ? ((i / (cardCount - 1)) - 0.5) * maxSpread : 0
      return (
        <div key={i} style={{ position: 'absolute', transform: `translateY(${offset}px)`, zIndex: i }}>
          <CardBack w={36} h={52} />
        </div>
      )
    })
  }

  const containerStyle: React.CSSProperties =
    orientation === 'top'
      ? { position: 'relative', width: 200, height: 72 }
      : { position: 'relative', width: 44, height: Math.min(160, cardCount * 10 + 60) }

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div style={containerStyle} className="relative flex items-center justify-center">
        {renderCards()}
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
