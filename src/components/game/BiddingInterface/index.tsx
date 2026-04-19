import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bid, BidType, GamePhase, PlayerId } from '../../../core/types'
import { Button } from '../../ui/Button'
import { useGameStore } from '../../../store/gameStore'
import { cn } from '../../../utils/helpers'

export const BiddingInterface: React.FC = () => {
  const { gameState, submitHumanBid } = useGameStore()
  const [selectedBid, setSelectedBid] = useState<number | 'NIL' | 'BLIND_NIL' | null>(null)

  const isMyTurn =
    gameState.phase === GamePhase.BIDDING &&
    gameState.currentPlayerId === PlayerId.SOUTH

  if (!isMyTurn) return null

  const handleSubmit = () => {
    if (selectedBid === null) return

    let bid: Bid
    if (selectedBid === 'NIL') {
      bid = { playerId: PlayerId.SOUTH, type: BidType.NIL, value: 0 }
    } else if (selectedBid === 'BLIND_NIL') {
      bid = { playerId: PlayerId.SOUTH, type: BidType.BLIND_NIL, value: 0 }
    } else {
      bid = { playerId: PlayerId.SOUTH, type: BidType.NUMBER, value: selectedBid }
    }

    submitHumanBid(bid)
    setSelectedBid(null)
  }

  const config = gameState.config

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4 p-5 bg-felt-dark/90 border border-white/10 rounded-2xl backdrop-blur-sm shadow-2xl"
      style={{ minWidth: 320 }}
    >
      <div className="font-display text-lg text-gold font-semibold">
        Your Bid
      </div>

      {/* Number bids grid */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 13 }, (_, i) => i + 1).map(n => (
          <motion.button
            key={n}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setSelectedBid(n)}
            className={cn(
              'w-9 h-9 rounded-lg font-sans font-bold text-sm transition-all duration-100',
              selectedBid === n
                ? 'bg-gold text-felt-shadow shadow-glow'
                : 'bg-felt-light text-text-primary hover:bg-felt hover:text-gold border border-white/10',
            )}
          >
            {n}
          </motion.button>
        ))}
      </div>

      {/* Nil options */}
      <div className="flex gap-3 w-full">
        {config.nilEnabled && (
          <button
            onClick={() => setSelectedBid('NIL')}
            className={cn(
              'flex-1 py-2 rounded-lg font-sans font-semibold text-sm transition-all duration-100',
              selectedBid === 'NIL'
                ? 'bg-gold text-felt-shadow shadow-glow'
                : 'bg-felt-light text-text-primary hover:text-gold border border-white/10',
            )}
          >
            Nil (+100)
          </button>
        )}
        {config.blindNilEnabled && (
          <button
            onClick={() => setSelectedBid('BLIND_NIL')}
            className={cn(
              'flex-1 py-2 rounded-lg font-sans font-semibold text-sm transition-all duration-100',
              selectedBid === 'BLIND_NIL'
                ? 'bg-gold text-felt-shadow shadow-glow'
                : 'bg-felt-light text-text-primary hover:text-gold border border-white/10',
            )}
          >
            Blind Nil (+200)
          </button>
        )}
      </div>

      {/* Bid selected summary */}
      {selectedBid !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-text-muted font-sans"
        >
          Bidding:{' '}
          <span className="text-gold font-semibold">
            {selectedBid === 'NIL' ? 'Nil' : selectedBid === 'BLIND_NIL' ? 'Blind Nil' : selectedBid}
          </span>
        </motion.div>
      )}

      <Button
        variant="primary"
        size="md"
        disabled={selectedBid === null}
        onClick={handleSubmit}
        className="w-full"
      >
        Confirm Bid
      </Button>
    </motion.div>
  )
}
