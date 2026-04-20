import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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
      className="h-screen w-screen flex flex-col overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #2D6A4F 0%, #1B4332 40%, #0D1F14 100%)' }}
    >
      {/* HUD bar */}
      <HUD />

      {/* Main game area — fills remaining height */}
      <div className="flex-1 flex flex-col items-center justify-between px-3 py-2 relative overflow-hidden">

        {/* North */}
        <div className="flex flex-col items-center gap-1">
          <PlayerZone playerId={PlayerId.NORTH} />
          <OpponentHand playerId={PlayerId.NORTH} orientation="top" />
        </div>

        {/* Middle row */}
        <div className="flex items-center justify-between w-full gap-2">

          {/* West */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <OpponentHand playerId={PlayerId.WEST} orientation="left" />
            <PlayerZone playerId={PlayerId.WEST} />
          </div>

          {/* Center */}
          <div className="flex-1 flex items-center justify-center relative min-w-0">
            <TrickArea />

            <AnimatePresence>
              {showBidding && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center z-20 rounded-2xl"
                  style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
                >
                  <BiddingInterface />
                </motion.div>
              )}
            </AnimatePresence>

            {phase === GamePhase.BIDDING && gameState.currentPlayerId !== PlayerId.SOUTH && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-2 text-xs font-sans text-text-muted"
              >
                {gameState.players[gameState.currentPlayerId].name} is bidding…
              </motion.div>
            )}
          </div>

          {/* East */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <PlayerZone playerId={PlayerId.EAST} />
            <OpponentHand playerId={PlayerId.EAST} orientation="right" />
          </div>
        </div>

        {/* South — human player */}
        <div className="flex flex-col items-center gap-2 w-full pb-1">
          <PlayerZone playerId={PlayerId.SOUTH} />
          <PlayerHand />
        </div>
      </div>

      <AnimatePresence>
        {showRoundSummary && <RoundSummary />}
      </AnimatePresence>

      {/* Menu button */}
      <div className="absolute top-14 right-2 z-30">
        <Button variant="ghost" size="sm" onClick={returnToMenu}>✕</Button>
      </div>
    </div>
  )
}
