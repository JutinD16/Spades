import React from 'react'
import { motion } from 'framer-motion'
import { TeamId } from '../../../core/types'
import { Button } from '../../ui/Button'
import { useGameStore } from '../../../store/gameStore'
import { cn } from '../../../utils/helpers'

export const MatchResults: React.FC = () => {
  const { gameState, startMatch, returnToMenu } = useGameStore()
  const winnerId = gameState.winnerId
  const playerWon = winnerId === TeamId.TEAM_NS

  const nsScore = gameState.teams[TeamId.TEAM_NS].score
  const weScore = gameState.teams[TeamId.TEAM_WE].score

  // Stats from round history
  const totalRounds = gameState.roundResults.length
  const nsNilResults = gameState.roundResults.flatMap(r => r.teamResults[TeamId.TEAM_NS].nilResults)
  const nsBagsTotal = gameState.roundResults.reduce((sum, r) => sum + r.teamResults[TeamId.TEAM_NS].bagsGained, 0)

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <div className="min-h-screen flex items-center justify-center felt-surface">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-8 text-center px-8 max-w-lg w-full"
      >
        {/* Result header */}
        <motion.div variants={itemVariants}>
          {playerWon ? (
            <>
              <div className="text-6xl mb-3">🏆</div>
              <h1 className="font-display text-5xl text-gold font-bold">Victory!</h1>
              <p className="text-text-muted font-sans mt-2">Your team wins the match</p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-3">💀</div>
              <h1 className="font-display text-5xl text-red-400 font-bold">Defeat</h1>
              <p className="text-text-muted font-sans mt-2">Better luck next time</p>
            </>
          )}
        </motion.div>

        {/* Final scores */}
        <motion.div variants={itemVariants} className="w-full grid grid-cols-2 gap-4">
          <div className={cn(
            'p-5 rounded-2xl border',
            playerWon ? 'border-team-ns/50 bg-team-ns/15' : 'border-white/10 bg-white/5',
          )}>
            <div className="text-xs font-sans text-text-muted uppercase tracking-wide mb-1">Your Team</div>
            <div className="font-display text-4xl font-bold text-team-ns">{nsScore}</div>
            {playerWon && <div className="text-xs text-gold font-sans mt-1">Winner!</div>}
          </div>
          <div className={cn(
            'p-5 rounded-2xl border',
            !playerWon ? 'border-team-we/50 bg-team-we/15' : 'border-white/10 bg-white/5',
          )}>
            <div className="text-xs font-sans text-text-muted uppercase tracking-wide mb-1">Opponents</div>
            <div className="font-display text-4xl font-bold text-team-we">{weScore}</div>
            {!playerWon && winnerId && <div className="text-xs text-gold font-sans mt-1">Winner!</div>}
          </div>
        </motion.div>

        {/* Match highlights */}
        <motion.div variants={itemVariants} className="w-full bg-felt-dark border border-white/10 rounded-xl p-5">
          <h3 className="font-display text-base text-gold mb-3">Match Stats</h3>
          <div className="space-y-2 text-sm font-sans">
            <StatRow label="Rounds Played" value={totalRounds.toString()} />
            <StatRow label="Your Team's Bags" value={nsBagsTotal.toString()} />
            <StatRow
              label="Nil Attempts"
              value={`${nsNilResults.filter(n => n.success).length}/${nsNilResults.length}`}
            />
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div variants={itemVariants} className="flex gap-3 w-full">
          <Button
            variant="ghost"
            size="md"
            onClick={returnToMenu}
            className="flex-1"
          >
            Main Menu
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => startMatch(gameState.config)}
            className="flex-1 font-display"
          >
            Play Again
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

const StatRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-text-muted">{label}</span>
    <span className="text-text-primary font-medium">{value}</span>
  </div>
)
