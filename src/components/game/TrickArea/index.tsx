import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlayerId, Suit } from '../../../core/types'
import { CardComponent } from '../CardComponent'
import { useGameStore } from '../../../store/gameStore'
import { SUIT_SYMBOLS } from '../../../core/constants'

const SLOT_POSITIONS: Record<PlayerId, { top: string; left: string; transform: string }> = {
  [PlayerId.SOUTH]: { top: '60%', left: '50%', transform: 'translateX(-50%)' },
  [PlayerId.NORTH]: { top: '5%', left: '50%', transform: 'translateX(-50%)' },
  [PlayerId.WEST]: { top: '35%', left: '5%', transform: 'translateY(-50%)' },
  [PlayerId.EAST]: { top: '35%', left: '80%', transform: 'translateY(-50%)' },
}

export const TrickArea: React.FC = () => {
  const { gameState } = useGameStore()
  const trick = gameState.currentTrick

  return (
    <div
      className="relative rounded-2xl"
      style={{
        width: 280,
        height: 220,
        background: 'radial-gradient(ellipse at center, rgba(45,106,79,0.3) 0%, transparent 70%)',
      }}
    >
      {/* Lead suit indicator */}
      {trick?.leadSuit && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div
            className="text-3xl opacity-10 pointer-events-none select-none"
            style={{
              color:
                trick.leadSuit === Suit.HEARTS || trick.leadSuit === Suit.DIAMONDS
                  ? '#C41E3A'
                  : '#F0ECD8',
            }}
          >
            {SUIT_SYMBOLS[trick.leadSuit]}
          </div>
        </motion.div>
      )}

      {/* Spades broken indicator */}
      {gameState.spadesBroken && (
        <div className="absolute top-1 right-1 text-xs font-sans text-gold/60 select-none">
          ♠ broken
        </div>
      )}

      {/* Trick cards at positional slots */}
      <AnimatePresence>
        {trick?.cards.map(({ card, playerId }) => {
          const pos = SLOT_POSITIONS[playerId]
          return (
            <motion.div
              key={card.id}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              style={{
                position: 'absolute',
                top: pos.top,
                left: pos.left,
                transform: pos.transform,
              }}
            >
              <CardComponent
                card={card}
                size="md"
                isLegal={true}
              />
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Empty slots hint */}
      {(!trick || trick.cards.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xs font-sans text-white/20 text-center select-none">
            {gameState.phase === 'PLAYING' ? 'Waiting for play…' : ''}
          </div>
        </div>
      )}

      {/* Trick winner flash */}
      <AnimatePresence>
        {trick?.isComplete && trick.winnerId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full mt-2 text-xs font-sans text-gold font-semibold whitespace-nowrap"
          >
            {gameState.players[trick.winnerId].name} wins trick!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
