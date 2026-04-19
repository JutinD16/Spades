import React from 'react'
import { motion } from 'framer-motion'
import { BidType, TeamId } from '../../../core/types'
import { Button } from '../../ui/Button'
import { useGameStore } from '../../../store/gameStore'
import { cn, formatScore } from '../../../utils/helpers'

export const RoundSummary: React.FC = () => {
  const { gameState, proceedFromSummary } = useGameStore()
  const lastResult = gameState.roundResults[gameState.roundResults.length - 1]

  if (!lastResult) return null

  const matchOver = !!gameState.winnerId

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
        className="bg-felt-dark border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl"
      >
        <h2 className="font-display text-2xl text-gold text-center mb-1">
          Round {lastResult.roundNumber} Results
        </h2>
        <p className="text-text-muted text-sm font-sans text-center mb-6">
          Target: {gameState.config.targetScore} points
        </p>

        {/* Team results */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {([TeamId.TEAM_NS, TeamId.TEAM_WE] as TeamId[]).map(teamId => {
            const result = lastResult.teamResults[teamId]
            const isNS = teamId === TeamId.TEAM_NS
            const scoreBefore = lastResult.scoreBefore[teamId]
            const scoreAfter = lastResult.scoreAfter[teamId]

            return (
              <motion.div
                key={teamId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isNS ? 0.1 : 0.2 }}
                className={cn(
                  'p-4 rounded-xl border',
                  isNS ? 'border-team-ns/30 bg-team-ns/10' : 'border-team-we/30 bg-team-we/10',
                )}
              >
                <h3 className={cn('font-display font-bold text-base mb-3', isNS ? 'text-team-ns' : 'text-team-we')}>
                  {isNS ? '🫵 Your Team' : '⚔️ Opponents'}
                </h3>

                <div className="space-y-1.5 text-sm font-sans">
                  <Row label="Bid" value={result.bid.toString()} />
                  <Row label="Tricks Won" value={result.tricksWon.toString()} />
                  <Row
                    label="Contract"
                    value={result.tricksWon >= result.bid ? '✓ Made' : '✗ Missed'}
                    valueClass={result.tricksWon >= result.bid ? 'text-green-400' : 'text-red-400'}
                  />

                  {result.bagsGained > 0 && (
                    <Row label="Bags" value={`+${result.bagsGained}`} valueClass="text-yellow-400" />
                  )}
                  {result.sandbagPenalty && (
                    <Row label="Sandbag Penalty" value="-100" valueClass="text-red-400" />
                  )}

                  {result.nilResults.map((nr, i) => (
                    <div key={i} className={cn('text-xs', nr.success ? 'text-green-400' : 'text-red-400')}>
                      {gameState.players[nr.playerId].name} {nr.bidType === BidType.BLIND_NIL ? 'Blind Nil' : 'Nil'}:{' '}
                      {nr.success ? 'Success' : 'Failed'} ({formatScore(nr.bonus)})
                    </div>
                  ))}

                  <div className="border-t border-white/10 pt-1.5 mt-1.5 flex justify-between font-semibold">
                    <span className="text-text-muted">Round</span>
                    <span className={result.roundScore >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {formatScore(result.roundScore)}
                    </span>
                  </div>
                </div>

                {/* Score progression */}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex justify-between items-end">
                    <div className="text-xs text-text-muted font-sans">{scoreBefore}</div>
                    <div className="text-xs text-text-muted font-sans">→</div>
                    <motion.div
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                      className={cn('text-xl font-display font-bold', isNS ? 'text-team-ns' : 'text-team-we')}
                    >
                      {scoreAfter}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Button variant="primary" size="lg" onClick={proceedFromSummary} className="w-full">
            {matchOver ? 'See Results' : 'Next Round'}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

const Row: React.FC<{ label: string; value: string; valueClass?: string }> = ({
  label, value, valueClass,
}) => (
  <div className="flex justify-between items-center">
    <span className="text-text-muted">{label}</span>
    <span className={cn('font-medium text-text-primary', valueClass)}>{value}</span>
  </div>
)
