import {
  BidType,
  GameConfig,
  GamePhase,
  GameState,
  PlayerId,
  TeamId,
  Trick,
  Bid,
  Card,
  RoundResult,
} from './types'
import { createDeck, deal } from './deck'
import { sortHand } from './card'
import { getBiddingOrder, determineTrickWinner, getLegalCards, wouldBreakSpades } from './rules'
import { calculateRoundScores, checkMatchOver, computeNewBags } from './scoring'
import {
  DEFAULT_CONFIG,
  PARTNER,
  PLAY_ORDER,
  PLAYER_NAMES,
  TEAM_PLAYERS,
} from './constants'

export type GameAction =
  | { type: 'START_MATCH'; config: GameConfig }
  | { type: 'DEAL_COMPLETE' }
  | { type: 'SUBMIT_BID'; playerId: PlayerId; bid: Bid }
  | { type: 'SWAP_BLIND_NIL'; playerId: PlayerId; give: Card[]; receive: Card[] }
  | { type: 'PLAY_CARD'; playerId: PlayerId; card: Card }
  | { type: 'COMPLETE_TRICK' }
  | { type: 'END_ROUND' }
  | { type: 'START_NEXT_ROUND' }
  | { type: 'RETURN_TO_MENU' }
  | { type: 'SET_AI_THINKING'; playerId: PlayerId | null }
  | { type: 'CLEAR_INVALID_PLAY' }

export function createInitialState(): GameState {
  return {
    phase: GamePhase.MENU,
    config: DEFAULT_CONFIG,
    roundNumber: 0,
    dealerId: PlayerId.NORTH,
    players: {
      [PlayerId.SOUTH]: { id: PlayerId.SOUTH, name: PLAYER_NAMES[PlayerId.SOUTH], isHuman: true, hand: [], bid: null, tricksWon: 0 },
      [PlayerId.WEST]: { id: PlayerId.WEST, name: PLAYER_NAMES[PlayerId.WEST], isHuman: false, hand: [], bid: null, tricksWon: 0 },
      [PlayerId.NORTH]: { id: PlayerId.NORTH, name: PLAYER_NAMES[PlayerId.NORTH], isHuman: false, hand: [], bid: null, tricksWon: 0 },
      [PlayerId.EAST]: { id: PlayerId.EAST, name: PLAYER_NAMES[PlayerId.EAST], isHuman: false, hand: [], bid: null, tricksWon: 0 },
    },
    teams: {
      [TeamId.TEAM_NS]: { id: TeamId.TEAM_NS, players: TEAM_PLAYERS[TeamId.TEAM_NS], cumulativeBags: 0, score: 0 },
      [TeamId.TEAM_WE]: { id: TeamId.TEAM_WE, players: TEAM_PLAYERS[TeamId.TEAM_WE], cumulativeBags: 0, score: 0 },
    },
    biddingOrder: [],
    currentBidderIndex: 0,
    currentTrick: null,
    completedTricks: [],
    leadPlayerId: PlayerId.SOUTH,
    currentPlayerId: PlayerId.SOUTH,
    spadesBroken: false,
    roundResults: [],
    winnerId: null,
    lastTrickWinnerId: null,
    aiThinkingPlayerId: null,
    pendingBlindNilPlayers: [],
    invalidPlayMessage: null,
  }
}

function dealNewRound(state: GameState): GameState {
  const deck = createDeck()
  const { hands } = deal(deck)
  const biddingOrder = getBiddingOrder(state.dealerId)
  const firstBidder = biddingOrder[0]

  const players = { ...state.players }
  for (const id of PLAY_ORDER) {
    players[id] = {
      ...players[id],
      hand: sortHand(hands[id]),
      bid: null,
      tricksWon: 0,
    }
  }

  return {
    ...state,
    phase: GamePhase.DEALING,
    players,
    biddingOrder,
    currentBidderIndex: 0,
    currentPlayerId: firstBidder,
    currentTrick: null,
    completedTricks: [],
    spadesBroken: false,
    lastTrickWinnerId: null,
    aiThinkingPlayerId: null,
    pendingBlindNilPlayers: [],
    invalidPlayMessage: null,
  }
}

export function applyAction(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_MATCH': {
      const nextDealerIdx = Math.floor(Math.random() * PLAY_ORDER.length)
      const dealer = PLAY_ORDER[nextDealerIdx]
      const newState: GameState = {
        ...createInitialState(),
        config: action.config,
        roundNumber: 1,
        dealerId: dealer,
        teams: {
          [TeamId.TEAM_NS]: { id: TeamId.TEAM_NS, players: TEAM_PLAYERS[TeamId.TEAM_NS], cumulativeBags: 0, score: 0 },
          [TeamId.TEAM_WE]: { id: TeamId.TEAM_WE, players: TEAM_PLAYERS[TeamId.TEAM_WE], cumulativeBags: 0, score: 0 },
        },
        roundResults: [],
        winnerId: null,
      }
      return dealNewRound(newState)
    }

    case 'DEAL_COMPLETE': {
      return {
        ...state,
        phase: GamePhase.BIDDING,
        currentBidderIndex: 0,
        currentPlayerId: state.biddingOrder[0],
      }
    }

    case 'SUBMIT_BID': {
      const { playerId, bid } = action
      const players = {
        ...state.players,
        [playerId]: { ...state.players[playerId], bid },
      }

      const nextBidderIndex = state.currentBidderIndex + 1
      const allBid = nextBidderIndex >= state.biddingOrder.length

      if (!allBid) {
        return {
          ...state,
          players,
          currentBidderIndex: nextBidderIndex,
          currentPlayerId: state.biddingOrder[nextBidderIndex],
        }
      }

      // All players have bid — check for blind nil swaps needed
      const blindNilPlayers = PLAY_ORDER.filter(
        id => players[id].bid?.type === BidType.BLIND_NIL,
      )

      if (blindNilPlayers.length > 0) {
        return {
          ...state,
          players,
          phase: GamePhase.BLIND_NIL_SWAP,
          pendingBlindNilPlayers: blindNilPlayers,
          currentPlayerId: blindNilPlayers[0],
        }
      }

      // Start trick-taking
      const leaderId = state.biddingOrder[0]
      return {
        ...state,
        players,
        phase: GamePhase.PLAYING,
        leadPlayerId: leaderId,
        currentPlayerId: leaderId,
        currentTrick: createNewTrick(0, leaderId),
      }
    }

    case 'SWAP_BLIND_NIL': {
      const { playerId, give, receive } = action
      const partnerId = PARTNER[playerId]
      const playerHand = state.players[playerId].hand
      const partnerHand = state.players[partnerId].hand

      // Remove given cards from player, add received
      const newPlayerHand = sortHand([
        ...playerHand.filter(c => !give.some(g => g.id === c.id)),
        ...receive,
      ])
      const newPartnerHand = sortHand([
        ...partnerHand.filter(c => !receive.some(r => r.id === c.id)),
        ...give,
      ])

      const players = {
        ...state.players,
        [playerId]: { ...state.players[playerId], hand: newPlayerHand },
        [partnerId]: { ...state.players[partnerId], hand: newPartnerHand },
      }

      const remaining = state.pendingBlindNilPlayers.filter(id => id !== playerId)

      if (remaining.length > 0) {
        return { ...state, players, pendingBlindNilPlayers: remaining, currentPlayerId: remaining[0] }
      }

      const leaderId = state.biddingOrder[0]
      return {
        ...state,
        players,
        pendingBlindNilPlayers: [],
        phase: GamePhase.PLAYING,
        leadPlayerId: leaderId,
        currentPlayerId: leaderId,
        currentTrick: createNewTrick(0, leaderId),
      }
    }

    case 'PLAY_CARD': {
      const { playerId, card } = action
      const player = state.players[playerId]
      const newHand = player.hand.filter(c => c.id !== card.id)
      const players = {
        ...state.players,
        [playerId]: { ...player, hand: newHand },
      }

      const newSpadesBroken = state.spadesBroken || wouldBreakSpades(card)

      const trick = state.currentTrick!
      const newCards = [...trick.cards, { card, playerId }]
      const isLeading = trick.cards.length === 0
      const leadSuit = isLeading ? card.suit : trick.leadSuit

      const updatedTrick: Trick = {
        ...trick,
        cards: newCards,
        leadSuit,
        isComplete: newCards.length === 4,
      }

      if (newCards.length < 4) {
        const nextPlayer = getNextInTrick(playerId, trick.leadPlayerId)
        return {
          ...state,
          players,
          currentTrick: updatedTrick,
          currentPlayerId: nextPlayer,
          spadesBroken: newSpadesBroken,
          invalidPlayMessage: null,
        }
      }

      // Trick complete — determine winner
      const winnerId = determineTrickWinner(updatedTrick)
      const completedTrick = { ...updatedTrick, winnerId, isComplete: true }

      const updatedPlayers = {
        ...players,
        [winnerId]: { ...players[winnerId], tricksWon: players[winnerId].tricksWon + 1 },
      }

      return {
        ...state,
        players: updatedPlayers,
        currentTrick: completedTrick,
        completedTricks: [...state.completedTricks, completedTrick],
        spadesBroken: newSpadesBroken,
        lastTrickWinnerId: winnerId,
        invalidPlayMessage: null,
      }
    }

    case 'COMPLETE_TRICK': {
      const trickCount = state.completedTricks.length
      const winnerId = state.lastTrickWinnerId!

      if (trickCount >= 13) {
        // Round over
        return state
      }

      const newTrick = createNewTrick(trickCount, winnerId)
      return {
        ...state,
        currentTrick: newTrick,
        leadPlayerId: winnerId,
        currentPlayerId: winnerId,
      }
    }

    case 'END_ROUND': {
      const { teamResults } = calculateRoundScores(state.teams, state.players, state.config)
      const scoreBefore: Record<TeamId, number> = {
        [TeamId.TEAM_NS]: state.teams[TeamId.TEAM_NS].score,
        [TeamId.TEAM_WE]: state.teams[TeamId.TEAM_WE].score,
      }

      const updatedTeams = { ...state.teams }
      for (const teamId of [TeamId.TEAM_NS, TeamId.TEAM_WE]) {
        const result = teamResults[teamId]
        const team = state.teams[teamId]
        const newScore = team.score + result.roundScore
        const newBags = computeNewBags(team.cumulativeBags, result.bagsGained, state.config)
        updatedTeams[teamId] = { ...team, score: newScore, cumulativeBags: newBags }
      }

      const scoreAfter: Record<TeamId, number> = {
        [TeamId.TEAM_NS]: updatedTeams[TeamId.TEAM_NS].score,
        [TeamId.TEAM_WE]: updatedTeams[TeamId.TEAM_WE].score,
      }

      const roundResult: RoundResult = {
        roundNumber: state.roundNumber,
        teamResults,
        scoreBefore,
        scoreAfter,
      }

      const winner = checkMatchOver(updatedTeams, state.config)

      return {
        ...state,
        teams: updatedTeams,
        roundResults: [...state.roundResults, roundResult],
        phase: GamePhase.ROUND_SUMMARY,
        winnerId: winner,
      }
    }

    case 'START_NEXT_ROUND': {
      const nextDealerIdx = (PLAY_ORDER.indexOf(state.dealerId) + 1) % PLAY_ORDER.length
      const nextDealer = PLAY_ORDER[nextDealerIdx]
      return dealNewRound({
        ...state,
        dealerId: nextDealer,
        roundNumber: state.roundNumber + 1,
        phase: GamePhase.DEALING,
      })
    }

    case 'RETURN_TO_MENU': {
      return createInitialState()
    }

    case 'SET_AI_THINKING': {
      return { ...state, aiThinkingPlayerId: action.playerId }
    }

    case 'CLEAR_INVALID_PLAY': {
      return { ...state, invalidPlayMessage: null }
    }

    default:
      return state
  }
}

function createNewTrick(id: number, leadPlayerId: PlayerId): Trick {
  return {
    id,
    cards: [],
    leadSuit: null,
    leadPlayerId,
    winnerId: null,
    isComplete: false,
  }
}

function getNextInTrick(currentPlayer: PlayerId, leadPlayer: PlayerId): PlayerId {
  // Trick play order starts from lead player going clockwise
  const startIdx = PLAY_ORDER.indexOf(leadPlayer)
  const trickOrder = [0, 1, 2, 3].map(i => PLAY_ORDER[(startIdx + i) % 4])
  const currentIdx = trickOrder.indexOf(currentPlayer)
  return trickOrder[(currentIdx + 1) % 4]
}

export function getLegalCardsForPlayer(state: GameState, playerId: PlayerId): Card[] {
  const player = state.players[playerId]
  return getLegalCards(player.hand, state.currentTrick, state.spadesBroken, state.config)
}
