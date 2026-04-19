import { create } from 'zustand'
import {
  Bid,
  Card,
  AnimationSpeed,
  GameConfig,
  GamePhase,
  GameState,
  PlayerId,
  BidType,
} from '../core/types'
import { applyAction, createInitialState, GameAction, getLegalCardsForPlayer } from '../core/gameEngine'
import { DEFAULT_CONFIG, AI_THINK_DELAYS, PLAY_ORDER, PLAYER_TEAMS } from '../core/constants'
import { evaluateBid } from '../ai/bidEvaluator'
import { selectCard, selectAntiNilCard } from '../ai/cardSelector'
import { validatePlay } from '../core/rules'
import { DIFFICULTY_POLICIES } from '../ai/difficulty'

interface GameStore {
  gameState: GameState
  dispatch: (action: GameAction) => void

  // Game lifecycle
  startMatch: (config?: Partial<GameConfig>) => void
  returnToMenu: () => void

  // Human actions
  submitHumanBid: (bid: Bid) => void
  humanPlayCard: (card: Card) => void
  proceedFromSummary: () => void

  // Internal AI orchestration
  runAIBid: (playerId: PlayerId) => void
  runAIPlay: (playerId: PlayerId) => void
  triggerNextTurn: () => void
  scheduleAIAction: () => void
}

export const useGameStore = create<GameStore>()((set, get) => ({
  gameState: createInitialState(),

  dispatch: (action: GameAction) => {
    set(state => ({ gameState: applyAction(state.gameState, action) }))
  },

  startMatch: (configOverrides = {}) => {
    const config = { ...DEFAULT_CONFIG, ...configOverrides }
    const { dispatch } = get()
    dispatch({ type: 'START_MATCH', config })
    // After dealing, trigger deal complete and start bidding
    setTimeout(() => {
      const currentState = get().gameState
      if (currentState.phase === GamePhase.DEALING) {
        dispatch({ type: 'DEAL_COMPLETE' })
        // After transitioning to bidding, schedule first AI bid if needed
        setTimeout(() => get().scheduleAIAction(), 100)
      }
    }, getAnimationDelay(config) * 1.5)
  },

  returnToMenu: () => {
    get().dispatch({ type: 'RETURN_TO_MENU' })
  },

  submitHumanBid: (bid: Bid) => {
    const { gameState, dispatch } = get()
    if (gameState.phase !== GamePhase.BIDDING) return
    if (gameState.currentPlayerId !== PlayerId.SOUTH) return

    dispatch({ type: 'SUBMIT_BID', playerId: PlayerId.SOUTH, bid })

    // Schedule next turn (may be AI bid or start of play)
    setTimeout(() => get().scheduleAIAction(), 200)
  },

  humanPlayCard: (card: Card) => {
    const { gameState, dispatch } = get()
    if (gameState.phase !== GamePhase.PLAYING) return
    if (gameState.currentPlayerId !== PlayerId.SOUTH) return

    const validation = validatePlay(card, PlayerId.SOUTH, gameState)
    if (!validation.valid) {
      set(state => ({
        gameState: { ...state.gameState, invalidPlayMessage: validation.reason ?? 'Invalid play.' },
      }))
      // Clear after 2.5s
      setTimeout(() => {
        dispatch({ type: 'CLEAR_INVALID_PLAY' })
      }, 2500)
      return
    }

    dispatch({ type: 'PLAY_CARD', playerId: PlayerId.SOUTH, card })

    // After human plays, process trick completion or schedule next AI
    setTimeout(() => get().triggerNextTurn(), 300)
  },

  proceedFromSummary: () => {
    const { gameState, dispatch } = get()
    if (gameState.phase !== GamePhase.ROUND_SUMMARY) return

    if (gameState.winnerId) {
      set(state => ({
        gameState: { ...state.gameState, phase: GamePhase.MATCH_RESULTS },
      }))
      return
    }

    dispatch({ type: 'START_NEXT_ROUND' })
    const animDelay = getAnimationDelay(gameState.config) * 1500
    setTimeout(() => {
      const s = get().gameState
      if (s.phase === GamePhase.DEALING) {
        get().dispatch({ type: 'DEAL_COMPLETE' })
        setTimeout(() => get().scheduleAIAction(), 100)
      }
    }, animDelay)
  },

  runAIBid: (playerId: PlayerId) => {
    const { gameState, dispatch } = get()
    const bid = evaluateBid(playerId, gameState, gameState.config)
    dispatch({ type: 'SUBMIT_BID', playerId, bid })
    dispatch({ type: 'SET_AI_THINKING', playerId: null })

    setTimeout(() => get().scheduleAIAction(), 150)
  },

  runAIPlay: (playerId: PlayerId) => {
    const { gameState, dispatch } = get()

    // Check if any opponent bid nil and needs anti-nil pressure
    const nilOpponents = PLAY_ORDER.filter(id => {
      const bid = gameState.players[id].bid
      return (
        bid?.type === BidType.NIL || bid?.type === BidType.BLIND_NIL
      ) && gameState.players[id].tricksWon === 0
    })

    let cardToPlay: Card
    const policy = DIFFICULTY_POLICIES[gameState.config.difficulty]

    if (
      policy.antiNilPressure &&
      nilOpponents.length > 0 &&
      gameState.currentTrick
    ) {
      // Target an opposing nil player
      const myTeam = PLAY_ORDER.filter(id => PLAYER_TEAMS[id] !== PLAYER_TEAMS[playerId])
      const nilOpponent = nilOpponents.find(id => myTeam.includes(id))
      if (nilOpponent) {
        const legal = getLegalCardsForPlayer(gameState, playerId)
        cardToPlay = selectAntiNilCard(
          playerId,
          nilOpponent,
          legal,
          gameState.currentTrick!,
          gameState,
        )
      } else {
        cardToPlay = selectCard(playerId, gameState)
      }
    } else {
      cardToPlay = selectCard(playerId, gameState)
    }

    dispatch({ type: 'PLAY_CARD', playerId, card: cardToPlay })
    dispatch({ type: 'SET_AI_THINKING', playerId: null })

    setTimeout(() => get().triggerNextTurn(), 300)
  },

  triggerNextTurn: () => {
    const { gameState, dispatch } = get()

    if (gameState.phase !== GamePhase.PLAYING) return

    const trick = gameState.currentTrick
    if (!trick) return

    // Trick is complete — pause then collect
    if (trick.isComplete) {
      const delay = getAnimationDelay(gameState.config) * 1200
      setTimeout(() => {
        const current = get().gameState
        if (!current.currentTrick?.isComplete) return

        if (current.completedTricks.length >= 13) {
          dispatch({ type: 'END_ROUND' })
          return
        }

        dispatch({ type: 'COMPLETE_TRICK' })
        // Schedule next player
        setTimeout(() => get().scheduleAIAction(), 200)
      }, delay)
      return
    }

    // Not complete — schedule next player
    get().scheduleAIAction()
  },

  scheduleAIAction: () => {
    const { gameState } = get()

    if (
      gameState.phase !== GamePhase.BIDDING &&
      gameState.phase !== GamePhase.PLAYING
    ) return

    const currentPlayer = gameState.currentPlayerId
    if (!currentPlayer) return

    const player = gameState.players[currentPlayer]
    if (player.isHuman) return // Human acts on their own

    // Schedule AI action with think delay
    const delay = AI_THINK_DELAYS[gameState.config.animationSpeed]

    set(state => ({
      gameState: { ...state.gameState, aiThinkingPlayerId: currentPlayer },
    }))

    setTimeout(() => {
      const current = get().gameState
      // Verify state hasn't changed under us
      if (current.currentPlayerId !== currentPlayer) return
      if (current.players[currentPlayer].isHuman) return

      if (current.phase === GamePhase.BIDDING) {
        get().runAIBid(currentPlayer)
      } else if (current.phase === GamePhase.PLAYING) {
        get().runAIPlay(currentPlayer)
      }
    }, delay)
  },
}))

function getAnimationDelay(config: GameConfig): number {
  const multipliers: Record<AnimationSpeed, number> = {
    [AnimationSpeed.SLOW]: 1.6,
    [AnimationSpeed.NORMAL]: 1.0,
    [AnimationSpeed.FAST]: 0.4,
    [AnimationSpeed.OFF]: 0.05,
  }
  return multipliers[config.animationSpeed] ?? 1.0
}
