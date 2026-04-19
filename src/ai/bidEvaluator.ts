import { Bid, BidType, Card, Difficulty, GameConfig, GameState, PlayerId, Rank, Suit, TeamId } from '../core/types'
import { groupBySuit, hasSuit } from '../core/card'
import { PLAYER_TEAMS } from '../core/constants'
import { DIFFICULTY_POLICIES } from './difficulty'

/**
 * Evaluates a hand and returns an appropriate bid for the AI player.
 */
export function evaluateBid(
  playerId: PlayerId,
  state: GameState,
  config: GameConfig,
): Bid {
  const hand = state.players[playerId].hand
  const difficulty = config.difficulty
  const policy = DIFFICULTY_POLICIES[difficulty]

  // Check if blind nil is viable (only if enabled, team trailing significantly)
  if (config.blindNilEnabled && difficulty === Difficulty.HARD) {
    const teamId = PLAYER_TEAMS[playerId]
    const opposingTeamId = teamId === TeamId.TEAM_NS ? TeamId.TEAM_WE : TeamId.TEAM_NS
    const myTeamScore = state.teams[teamId].score
    const oppScore = state.teams[opposingTeamId].score
    if (oppScore - myTeamScore > 150 && estimateTricks(hand, difficulty) <= 1) {
      return { playerId, type: BidType.BLIND_NIL, value: 0 }
    }
  }

  const estimate = estimateTricks(hand, difficulty)

  // Nil bid consideration
  if (config.nilEnabled && estimate <= policy.nilBidThreshold) {
    if (isNilViable(hand, difficulty)) {
      return { playerId, type: BidType.NIL, value: 0 }
    }
  }

  const bid = Math.max(1, estimate - policy.bidAdjustment)
  return { playerId, type: BidType.NUMBER, value: Math.min(13, bid) }
}

function estimateTricks(hand: Card[], difficulty: Difficulty): number {
  let count = 0
  const groups = groupBySuit(hand)

  if (difficulty === Difficulty.EASY) {
    // Easy: count aces and J/Q/K/A of spades only
    for (const card of hand) {
      if (card.suit === Suit.SPADES && card.rank >= Rank.JACK) count++
      else if (card.rank === Rank.ACE) count++
    }
    return count
  }

  // Normal / Hard: more sophisticated hand evaluation
  const spades = groups[Suit.SPADES]

  // Spade trick estimation
  const spadeCount = spades.length
  if (spadeCount >= 5) count += Math.min(spadeCount - 2, 5)
  else if (spadeCount >= 3) count += spadeCount - 2
  else if (spadeCount === 2) count += 1
  else if (spadeCount === 1 && spades[0].rank >= Rank.QUEEN) count += 1

  // Individual high spade contributions
  for (const card of spades) {
    if (card.rank === Rank.ACE) count += 1
    else if (card.rank === Rank.KING && spadeCount <= 4) count += 0.5
    else if (card.rank === Rank.QUEEN && spadeCount <= 3) count += 0.3
  }

  // Off-suit high cards
  for (const suit of [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS]) {
    const suitCards = groups[suit]
    const suitLen = suitCards.length
    for (const card of suitCards) {
      if (card.rank === Rank.ACE) count += suitLen >= 2 ? 0.9 : 0.7
      else if (card.rank === Rank.KING && hasSuit(suitCards, Suit.SPADES === suit ? Suit.HEARTS : suit)) {
        count += suitLen >= 2 ? 0.6 : 0.4
      }
    }
    // Void bonus — can trump
    if (suitLen === 0 && spadeCount >= 2) count += 0.5
  }

  if (difficulty === Difficulty.HARD) {
    // Hard: reduce estimate if hand is risky
    const lowSpades = spades.filter(c => c.rank < Rank.SEVEN).length
    count -= lowSpades * 0.1
  }

  return Math.round(count)
}

function isNilViable(hand: Card[], difficulty: Difficulty): boolean {
  if (difficulty === Difficulty.EASY) return false

  // Check for dangerously high cards
  const dangerThreshold = difficulty === Difficulty.HARD ? Rank.QUEEN : Rank.KING
  const spades = hand.filter(c => c.suit === Suit.SPADES)
  const highSpades = spades.filter(c => c.rank >= dangerThreshold)

  if (highSpades.length > 0) return false

  const nonSpadeHighs = hand.filter(
    c => c.suit !== Suit.SPADES && c.rank >= Rank.KING,
  )

  // If no high spades and few danger cards in other suits, nil is viable
  return nonSpadeHighs.length <= (difficulty === Difficulty.HARD ? 1 : 0)
}
