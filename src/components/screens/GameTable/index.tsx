import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GamePhase, PlayerId } from '../../../core/types'
import { PlayerHand } from '../../game/PlayerHand'
import { OpponentHand } from '../../game/OpponentHand'
import { TrickArea } from '../../game/TrickArea'
import { BiddingInterface } from '../../game/BiddingInterface'
import { HUD } from '../../game/HUD'
import { PlayerZone } from '../../game/PlayerZone'
import { RoundSummary } from '../RoundSummary'
import { useGameStore } from '../../../store/gameStore'
import { Button } from '../../ui/Button'

export const GameTable: React.FC = () => {
  const { gameState, returnToMenu, scheduleAIAction } = useGameStore()
  const { phase } = gameState

  // On mount, ensure AI actions are scheduled if it's an AI's turn
  useEffect(() => {
    if (phase === GamePhase.BIDDING || phase === GamePhase.PLAYING) {
      const current = gameState.players[gameState.currentPlayerId]
      if (!current.isHuman) {
        scheduleAIAction()
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const showBidding =
    phase === GamePhase.BIDDING && gameState.currentPlayerId === PlayerId.SOUTH
  const showRoundSummary = phase === GamePhase.ROUND_SUMMARY

  return (
    <div
      className="min-h-screen flex flex-col felt-surface relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #2D6A4F 0%, #1B4332 40%, #0D1F14 100%)' }}
    >
      {/* HUD bar */}
      <HUD />

      {/* Game area */}
      <div className="flex-1 flex flex-col items-center justify-between px-6 py-4 relative">

        {/* Top — North player */}
        <div className="flex flex-col items-center gap-2">
          <PlayerZone playerId={PlayerId.NORTH} position="top" />
          <OpponentHand playerId={PlayerId.NORTH} orientation="top" />
        </div>

        {/* Middle row — West, Center trick area, East */}
        <div className="flex items-center justify-between w-full max-w-3xl gap-4">
          {/* West */}
          <div className="flex flex-col items-center gap-2">
            <OpponentHand playerId={PlayerId.WEST} orientation="left" />
            <PlayerZone playerId={PlayerId.WEST} position="left" />
          </div>

          {/* Center trick area + bidding overlay */}
          <div className="flex-1 flex items-center justify-center relative">
            <TrickArea />

            {/* Bidding interface overlay */}
            <AnimatePresence>
              {showBidding && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center z-20"
                  style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', borderRadius: 16 }}
                >
                  <BiddingInterface />
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI bidding status */}
            {phase === GamePhase.BIDDING && gameState.currentPlayerId !== PlayerId.SOUTH && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-4 text-sm font-sans text-text-muted"
              >
                {gameState.players[gameState.currentPlayerId].name} is bidding…
              </motion.div>
            )}
          </div>

          {/* East */}
          <div className="flex flex-col items-center gap-2">
            <PlayerZone playerId={PlayerId.EAST} position="right" />
            <OpponentHand playerId={PlayerId.EAST} orientation="right" />
          </div>
        </div>

        {/* Bottom — South (human player) */}
        <div className="flex flex-col items-center gap-3 pb-2">
          <PlayerZone playerId={PlayerId.SOUTH} position="bottom" />
          <PlayerHand />
        </div>
      </div>

      {/* Round summary overlay */}
      <AnimatePresence>
        {showRoundSummary && <RoundSummary />}
      </AnimatePresence>

      {/* Menu button */}
      <div className="absolute top-16 right-4 z-30">
        <Button variant="ghost" size="sm" onClick={returnToMenu}>
          ✕ Menu
        </Button>
      </div>
    </div>
  )
}
