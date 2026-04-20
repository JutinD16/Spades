import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, GamePhase, PlayerId } from '../../../core/types'
import { CardComponent } from '../CardComponent'
import { useGameStore } from '../../../store/gameStore'
import { getLegalCardsForPlayer } from '../../../core/gameEngine'
import { cn } from '../../../utils/helpers'

interface PlayerHandProps {
  className?: string
}

export const PlayerHand: React.FC<PlayerHandProps> = ({ className }) => {
  const { gameState, humanPlayCard } = useGameStore()
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const player = gameState.players[PlayerId.SOUTH]
  const isMyTurn =
    gameState.phase === GamePhase.PLAYING &&
    gameState.currentPlayerId === PlayerId.SOUTH

  const legalCards = isMyTurn
    ? getLegalCardsForPlayer(gameState, PlayerId.SOUTH)
    : []

  const legalIds = new Set(legalCards.map(c => c.id))

  const handleCardClick = (card: Card) => {
    if (!isMyTurn) return
    if (!legalIds.has(card.id)) return

    if (selectedCard === card.id) {
      humanPlayCard(card)
      setSelectedCard(null)
    } else {
      setSelectedCard(card.id)
    }
  }

  const hand = player.hand
  // Fixed card size — readable on all phones
  const cardW = 64
  const cardH = 90
  // Each card peeks out by this much; last card shows in full
  const step = 48

  return (
    <div className={cn('flex flex-col items-center w-full', className)}>
      {isMyTurn && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 text-xs font-sans text-gold font-medium tracking-wide uppercase"
        >
          {selectedCard ? 'Tap again to play' : 'Your turn — select a card'}
        </motion.div>
      )}

      {/* Scrollable card row */}
      <div
        ref={scrollRef}
        className="w-full overflow-x-auto pb-2"
        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-end',
            paddingLeft: 12,
            paddingRight: 12,
            height: cardH + 28,
            width: 'max-content',
            minWidth: '100%',
            justifyContent: hand.length <= 7 ? 'center' : 'flex-start',
          }}
        >
          <AnimatePresence>
            {hand.map((card, i) => {
              const isLegal = isMyTurn ? legalIds.has(card.id) : true
              const isSelected = selectedCard === card.id

              return (
                <motion.div
                  key={card.id}
                  initial={{ y: -60, opacity: 0 }}
                  animate={{
                    y: isSelected ? -18 : 0,
                    opacity: 1,
                    zIndex: isSelected ? 30 : i,
                    scale: isSelected ? 1.06 : 1,
                  }}
                  exit={{ y: -100, opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28, delay: i * 0.03 }}
                  style={{
                    marginRight: i < hand.length - 1 ? -(cardW - step) : 0,
                    position: 'relative',
                    flexShrink: 0,
                  }}
                >
                  <CardComponent
                    card={card}
                    isLegal={isLegal}
                    isSelected={isSelected}
                    onClick={isMyTurn ? handleCardClick : undefined}
                    size="md"
                  />
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {gameState.invalidPlayMessage && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1 px-4 py-2 bg-red-900/80 border border-red-700/60 rounded-lg text-red-300 text-sm font-sans text-center"
          >
            {gameState.invalidPlayMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
