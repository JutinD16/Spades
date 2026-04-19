import React from 'react'
import { motion } from 'framer-motion'
import { BidType, GamePhase, PlayerId, TeamId } from '../../../core/types'
import { Badge } from '../../ui/Badge'
import { useGameStore } from '../../../store/gameStore'
import { PLAYER_NAMES, PLAY_ORDER } from '../../../core/constants'
import { cn } from '../../../utils/helpers'

export const HUD: React.FC = () => {
  const { gameState } = useGameStore()
  const { teams, players, phase, spadesBroken, completedTricks } = gameState

  const nsTeam = teams[TeamId.TEAM_NS]
  const weTeam = teams[TeamId.TEAM_WE]

  const formatBid = (playerId: PlayerId) => {
    const bid = players[playerId].bid
    if (!bid) return '?'
    if (bid.type === BidType.NIL) return 'Nil'
    if (bid.type === BidType.BLIND_NIL) return 'BNil'
    return bid.value.toString()
  }

  return (
    <div className="flex items-stretch gap-3 px-4 py-3 bg-felt-shadow/80 border-b border-white/5 backdrop-blur-sm">
      {/* NS Team Score */}
      <TeamScoreCard teamId={TeamId.TEAM_NS} score={nsTeam.score} bags={nsTeam.cumulativeBags} />

      {/* Center info */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1">
        {/* Round info */}
        <div className="text-xs font-sans text-text-muted uppercase tracking-widest">
          Round {gameState.roundNumber}
          {' · '}Trick {completedTricks.length + (phase === GamePhase.PLAYING && gameState.currentTrick ? 1 : 0)}/13
        </div>

        {/* Bid status row */}
        {(phase === GamePhase.BIDDING || phase === GamePhase.PLAYING) && (
          <div className="flex gap-2 items-center">
            {PLAY_ORDER.map(id => (
              <PlayerBidChip
                key={id}
                playerId={id}
                bid={formatBid(id)}
                tricks={players[id].tricksWon}
                isCurrent={gameState.currentPlayerId === id}
                isHuman={players[id].isHuman}
              />
            ))}
          </div>
        )}

        {/* Spades broken */}
        {spadesBroken && (
          <Badge variant="neutral" size="sm">♠ Spades broken</Badge>
        )}
      </div>

      {/* WE Team Score */}
      <TeamScoreCard teamId={TeamId.TEAM_WE} score={weTeam.score} bags={weTeam.cumulativeBags} />
    </div>
  )
}

interface TeamScoreCardProps {
  teamId: TeamId
  score: number
  bags: number
}

const TeamScoreCard: React.FC<TeamScoreCardProps> = ({ teamId, score, bags }) => {
  const isNS = teamId === TeamId.TEAM_NS
  const label = isNS ? 'Your Team' : 'Opponents'

  return (
    <div className={cn(
      'flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl bg-white/5 border',
      isNS ? 'border-team-ns/30' : 'border-team-we/30',
    )}>
      <span className="text-xs font-sans text-text-muted uppercase tracking-wide">{label}</span>
      <motion.span
        key={score}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className={cn(
          'text-2xl font-display font-bold',
          isNS ? 'text-team-ns' : 'text-team-we',
        )}
      >
        {score}
      </motion.span>
      {bags > 0 && (
        <Badge variant="neutral" size="sm">{bags} bag{bags !== 1 ? 's' : ''}</Badge>
      )}
    </div>
  )
}

interface PlayerBidChipProps {
  playerId: PlayerId
  bid: string
  tricks: number
  isCurrent: boolean
  isHuman: boolean
}

const PlayerBidChip: React.FC<PlayerBidChipProps> = ({ playerId, bid, tricks, isCurrent, isHuman }) => {
  const name = isHuman ? 'You' : PLAYER_NAMES[playerId]
  const nsPlayers = new Set([PlayerId.SOUTH, PlayerId.NORTH])
  const isNS = nsPlayers.has(playerId)

  return (
    <div className={cn(
      'flex flex-col items-center px-2 py-1 rounded-lg text-xs font-sans gap-0.5 transition-all',
      isCurrent ? 'bg-gold/20 border border-gold/40' : 'bg-white/5 border border-transparent',
    )}>
      <span className={cn('font-medium', isNS ? 'text-team-ns' : 'text-team-we')}>{name}</span>
      <span className="text-text-muted">
        <span className="text-gold font-bold">{bid}</span>
        {bid !== '?' && <span className="text-text-muted"> / {tricks}</span>}
      </span>
    </div>
  )
}
