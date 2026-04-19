import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GamePhase } from './core/types'
import { useGameStore } from './store/gameStore'
import { MainMenu } from './components/screens/MainMenu'
import { GameTable } from './components/screens/GameTable'
import { MatchResults } from './components/screens/MatchResults'
import './styles/globals.css'

export const App: React.FC = () => {
  const { gameState } = useGameStore()
  const { phase } = gameState

  const isInGame =
    phase === GamePhase.DEALING ||
    phase === GamePhase.BIDDING ||
    phase === GamePhase.BLIND_NIL_SWAP ||
    phase === GamePhase.PLAYING ||
    phase === GamePhase.ROUND_SUMMARY

  const isMatchResults = phase === GamePhase.MATCH_RESULTS

  return (
    <AnimatePresence mode="wait">
      {isMatchResults ? (
        <motion.div
          key="results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MatchResults />
        </motion.div>
      ) : isInGame ? (
        <motion.div
          key="game"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <GameTable />
        </motion.div>
      ) : (
        <motion.div
          key="menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <MainMenu />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
