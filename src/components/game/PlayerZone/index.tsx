import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BidType, GamePhase, PlayerId, TeamId } from '../../../core/types'
import { Badge } from '../../ui/Badge'
import { useGameStore } from '../../../store/gameStore'
import { PLAYER_TEAMS } from '../../../core/constants'
import { cn } from '../../../utils/helpers'

interface PlayerZoneProps {
  playerId: PlayerId
  position?: 'bottom' | 'top' | 'left' | 'right'
  className?: string
}

export const PlayerZone: React.FC<PlayerZoneProps> = ({ playerId, className }) => {
  const { gameState } = useGameStore()
  const player = gameState.players[playerId]
  const isCurrentPlayer = gameState.currentPlayerId === playerId
  const isThinking = gameState.aiThinkingPlayerId === playerId
  const teamId = PLAYER_TEAMS[playerId]
  const isNS = teamId === TeamId.TEAM_NS

  const formatBid = () => {
    if (!player.bid) return null
    if (player.bid.type === BidType.NIL) return 'Nil'
    if (player.bid.type === BidType.BLIND_NIL) return 'Blind Nil'
    return player.bid.value.toString()
  }

  const bid = formatBid()

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      {/* Turn indicator ring */}
      <div className="relative">
        <motion.div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center text-sm font-display font-bold border-2',
            isNS ? 'border-team-ns text-team-ns' : 'border-team-we text-team-we',
            isCurrentPlayer ? (isNS ? 'bg-team-ns/20 shadow-[0_0_16px_rgba(74,144,217,0.5)]' : 'bg-team-we/20 shadow-[0_0_16px_rgba(217,74,74,0.5)]') : 'bg-white/5',
          )}
          animate={isCurrentPlayer ? { scale: [1, 1.05, 1] } : { scale: 1 }}
          transition={{ duration: 1.5, repeat: isCurrentPlayer ? Infinity : 0 }}
        >
          {player.name.charAt(0)}
        </motion.div>

        {/* Thinking dots */}
        <AnimatePresence>
          {isThinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5"
            >
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1 h-1 rounded-full bg-gold"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Name */}
      <span className={cn(
        'text-xs font-sans font-medium',
        isCurrentPlayer ? 'text-gold' : 'text-text-muted',
      )}>
        {player.isHuman ? 'You' : player.name}
      </span>

      {/* Bid badge */}
      <AnimatePresence>
        {bid !== null && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Badge variant={isNS ? 'ns' : 'we'} size="sm">
              Bid: {bid}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tricks won */}
      {gameState.phase === GamePhase.PLAYING && (
        <span className="text-xs font-sans text-text-muted">
          {player.tricksWon} trick{player.tricksWon !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}
