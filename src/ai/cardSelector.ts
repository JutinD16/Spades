import { BidType, Card, Difficulty, GameState, PlayerId, Rank, Trick } from '../core/types'
import { isSpade } from '../core/card'
import { PARTNER, PLAYER_TEAMS } from '../core/constants'
import { getLegalCards } from '../core/rules'
import { DIFFICULTY_POLICIES } from './difficulty'

/**
 * Selects the best card for an AI player to play.
 */
export function selectCard(playerId: PlayerId, state: GameState): Card {
  const player = state.players[playerId]
  const legal = getLegalCards(
    player.hand,
    state.currentTrick,
    state.spadesBroken,
    state.config,
  )

  if (legal.length === 1) return legal[0]

  const difficulty = state.config.difficulty
  const policy = DIFFICULTY_POLICIES[difficulty]

  // Easy: random with slight win preference
  if (Math.random() < policy.randomPlayChance) {
    return legal[Math.floor(Math.random() * legal.length)]
  }

  const trick = state.currentTrick!
  const isLeading = trick.cards.length === 0

  // Check if this player bid nil
  if (player.bid?.type === BidType.NIL || player.bid?.type === BidType.BLIND_NIL) {
    return playNilCard(legal, trick, state, difficulty)
  }

  if (isLeading) {
    return selectLeadCard(playerId, legal, state, difficulty)
  }

  return selectFollowCard(playerId, legal, trick, state, difficulty)
}

function selectLeadCard(
  playerId: PlayerId,
  legal: Card[],
  state: GameState,
  difficulty: Difficulty,
): Card {
  // Hard: if we need bags, play strategically; if we need to conserve, play low
  if (difficulty === Difficulty.HARD && DIFFICULTY_POLICIES[difficulty].bagManagement) {
    const teamId = PLAYER_TEAMS[playerId]
    const team = state.teams[teamId]
    if (team.cumulativeBags >= 7) {
      // Avoid overtricks — lead low card in long suit
      const nonSpades = legal.filter(c => !isSpade(c))
      if (nonSpades.length > 0) {
        return nonSpades.reduce((low, c) => (c.rank < low.rank ? c : low))
      }
    }
  }

  // Lead highest non-spade to probe suit
  const nonSpades = legal.filter(c => !isSpade(c))
  if (nonSpades.length > 0) {
    // Play highest in most populated non-spade suit
    const suitCounts: Record<string, Card[]> = {}
    for (const card of nonSpades) {
      if (!suitCounts[card.suit]) suitCounts[card.suit] = []
      suitCounts[card.suit].push(card)
    }
    const bestSuit = Object.values(suitCounts).sort((a, b) => b.length - a.length)[0]
    return bestSuit.reduce((best, c) => (c.rank > best.rank ? c : best))
  }

  // Only spades left — play lowest
  return legal.reduce((low, c) => (c.rank < low.rank ? c : low))
}

function selectFollowCard(
  playerId: PlayerId,
  legal: Card[],
  trick: Trick,
  _state: GameState,
  _difficulty: Difficulty,
): Card {
  const partnerId = PARTNER[playerId]
  const currentWinner = getTrickCurrentWinner(trick)
  const isPartnerWinning = currentWinner === partnerId

  // If partner is winning and we're not obligated to win, dump lowest card
  if (isPartnerWinning) {
    // Check if partner can actually hold the trick (no one after can beat)
    const lowest = legal.reduce((low, c) => (c.rank < low.rank ? c : low))
    return lowest
  }

  // Try to win the trick cheaply
  const winningCard = getCheapestWinner(legal, trick)
  if (winningCard) return winningCard

  // Can't win — dump lowest card
  const lowestNonSpade = legal.filter(c => !isSpade(c))
  if (lowestNonSpade.length > 0) {
    return lowestNonSpade.reduce((low, c) => (c.rank < low.rank ? c : low))
  }

  return legal.reduce((low, c) => (c.rank < low.rank ? c : low))
}

function playNilCard(legal: Card[], trick: Trick, _state: GameState, _difficulty: Difficulty): Card {
  // Nil player wants to avoid winning tricks
  // Play lowest possible, avoid high cards
  const isLeading = trick.cards.length === 0

  if (isLeading) {
    // Lead lowest card
    const nonSpades = legal.filter(c => !isSpade(c))
    const pool = nonSpades.length > 0 ? nonSpades : legal
    return pool.reduce((low, c) => (c.rank < low.rank ? c : low))
  }

  // Following: play card that won't win
  const losingCards = legal.filter(c => !wouldWinTrick(c, trick))
  if (losingCards.length > 0) {
    return losingCards.reduce((low, c) => (c.rank < low.rank ? c : low))
  }

  // Must win — play lowest possible
  return legal.reduce((low, c) => (c.rank < low.rank ? c : low))
}

function getTrickCurrentWinner(trick: Trick): PlayerId | null {
  if (trick.cards.length === 0) return null

  const spades = trick.cards.filter(tc => isSpade(tc.card))
  if (spades.length > 0) {
    return spades.reduce((best, tc) =>
      tc.card.rank > best.card.rank ? tc : best,
    ).playerId
  }

  const leadSuitCards = trick.cards.filter(tc => tc.card.suit === trick.leadSuit)
  return leadSuitCards.reduce((best, tc) =>
    tc.card.rank > best.card.rank ? tc : best,
  ).playerId
}

function wouldWinTrick(card: Card, trick: Trick): boolean {
  if (trick.cards.length === 0) return true

  const leadSuit = trick.leadSuit!
  const currentWinner = getTrickCurrentWinner(trick)
  const currentWinnerCard = trick.cards.find(tc => tc.playerId === currentWinner)!.card

  if (isSpade(card)) {
    if (isSpade(currentWinnerCard)) return card.rank > currentWinnerCard.rank
    return true // beats non-spade
  }

  if (card.suit === leadSuit) {
    if (isSpade(currentWinnerCard)) return false // can't beat spade
    return card.rank > currentWinnerCard.rank
  }

  return false // off-suit non-spade never wins
}

function getCheapestWinner(legal: Card[], trick: Trick): Card | null {
  const winners = legal.filter(c => wouldWinTrick(c, trick))
  if (winners.length === 0) return null
  // Get cheapest winner (lowest rank among winning cards)
  return winners.reduce((best, c) => (c.rank < best.rank ? c : best))
}

/**
 * Anti-nil: select a card to try to force a nil bidder to take a trick.
 */
export function selectAntiNilCard(
  _playerId: PlayerId,
  nilPlayerId: PlayerId,
  legal: Card[],
  trick: Trick,
  state: GameState,
): Card {
  const nilPlayer = state.players[nilPlayerId]
  const nilHand = nilPlayer.hand

  // If leading: lead a suit where nil player has high cards
  if (trick.cards.length === 0) {
    for (const card of legal.filter(c => !isSpade(c))) {
      const nilCardsInSuit = nilHand.filter(c => c.suit === card.suit)
      if (nilCardsInSuit.some(c => c.rank >= Rank.QUEEN)) {
        // Lead this suit to force nil player to play high
        const inSuit = legal.filter(c => c.suit === card.suit)
        return inSuit.reduce((high, c) => (c.rank > high.rank ? c : high))
      }
    }
  }

  // If following: play card just above nil player's potential contribution
  const winningCard = getCheapestWinner(legal, trick)
  if (winningCard) return winningCard

  // Default to highest card to pressure nil
  return legal.reduce((high, c) => (c.rank > high.rank ? c : high))
}
