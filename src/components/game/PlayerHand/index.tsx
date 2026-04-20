import React, { useState } from 'react'
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
  const cardCount = hand.length

  // Responsive card sizing: smaller on narrow screens
  const vw = typeof window !== 'undefined' ? window.innerWidth : 390
  const cardW = vw < 400 ? 56 : vw < 500 ? 64 : 72
  const cardH = Math.round(cardW * 1.4)

  // Fan geometry — tighter overlap on small screens
  const maxFanWidth = Math.min(vw - 32, 340)
  const totalOverlap = cardCount > 1 ? maxFanWidth / (cardCount - 1) : 0
  const step = Math.min(totalOverlap, cardW * 0.55)
  const totalWidth = cardCount > 1 ? step * (cardCount - 1) + cardW : cardW
  const maxRotation = Math.min(12, cardCount * 0.9)

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

      <div
        className="relative flex items-end justify-center"
        style={{ height: cardH + 30, width: totalWidth }}
      >
        <AnimatePresence>
          {hand.map((card, i) => {
            const offset = cardCount > 1
              ? i * step - (totalWidth - cardW) / 2
              : 0
            const rotation = cardCount > 1
              ? ((i / (cardCount - 1)) - 0.5) * maxRotation * 2
              : 0
            const isLegal = isMyTurn ? legalIds.has(card.id) : true
            const isSelected = selectedCard === card.id

            return (
              <motion.div
                key={card.id}
                initial={{ y: -60, opacity: 0 }}
                animate={{
                  x: offset - (totalWidth - cardW) / 2,
                  y: isSelected ? -16 : 0,
                  rotate: rotation,
                  opacity: 1,
                  zIndex: isSelected ? 30 : i,
                }}
                exit={{ y: -100, opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 280, damping: 26, delay: i * 0.04 }}
                style={{ position: 'absolute', bottom: 0, left: (totalWidth - cardW) / 2 }}
                whileHover={isLegal && isMyTurn ? { zIndex: 40 } : {}}
              >
                <CardComponent
                  card={card}
                  isLegal={isLegal}
                  isSelected={isSelected}
                  onClick={isMyTurn ? handleCardClick : undefined}
                  size={cardW >= 72 ? 'lg' : cardW >= 64 ? 'md' : 'sm'}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {gameState.invalidPlayMessage && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 px-4 py-2 bg-red-900/80 border border-red-700/60 rounded-lg text-red-300 text-sm font-sans text-center"
          >
            {gameState.invalidPlayMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
