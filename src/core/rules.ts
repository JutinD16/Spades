import { Card, GameConfig, GameState, PlayerId, Suit, Trick } from './types'
import { hasSuit, isSpade } from './card'
import { PLAY_ORDER } from './constants'

/**
 * Returns all cards the player is legally allowed to play.
 *
 * Leading (no cards in trick yet):
 *   - If spades have not been broken: can only lead non-spades
 *     UNLESS the player has only spades in hand
 *   - If spades broken (or breakingSpades is off): any card
 *
 * Following (trick already has cards):
 *   - Must follow lead suit if possible
 *   - If void in lead suit: any card is legal
 */
export function getLegalCards(
  hand: Card[],
  trick: Trick | null,
  spadesBroken: boolean,
  config: GameConfig,
): Card[] {
  if (hand.length === 0) return []

  const isLeading = !trick || trick.cards.length === 0

  if (isLeading) {
    if (!config.breakingSpades || spadesBroken) {
      return [...hand]
    }
    const nonSpades = hand.filter(c => !isSpade(c))
    // If only spades remain, allow leading spades
    return nonSpades.length > 0 ? nonSpades : [...hand]
  }

  // Following suit
  const leadSuit = trick!.cards[0].card.suit
  const inLeadSuit = hand.filter(c => c.suit === leadSuit)
  return inLeadSuit.length > 0 ? inLeadSuit : [...hand]
}

/**
 * Determines which player won a completed trick.
 * Highest spade wins if any spade was played; otherwise highest of the lead suit.
 */
export function determineTrickWinner(trick: Trick): PlayerId {
  const spades = trick.cards.filter(tc => tc.card.suit === Suit.SPADES)

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

/**
 * Validates whether a player's attempted card play is legal.
 */
export function validatePlay(
  card: Card,
  playerId: PlayerId,
  state: GameState,
): { valid: boolean; reason?: string } {
  const player = state.players[playerId]

  if (!player.hand.some(c => c.id === card.id)) {
    return { valid: false, reason: 'Card is not in your hand.' }
  }

  if (state.currentPlayerId !== playerId) {
    return { valid: false, reason: "It's not your turn." }
  }

  const legal = getLegalCards(
    player.hand,
    state.currentTrick,
    state.spadesBroken,
    state.config,
  )

  if (!legal.some(c => c.id === card.id)) {
    const isLeading = !state.currentTrick || state.currentTrick.cards.length === 0
    if (isLeading && isSpade(card) && !state.spadesBroken) {
      return { valid: false, reason: 'Spades have not been broken yet.' }
    }
    const leadSuit = state.currentTrick?.cards[0]?.card.suit
    if (leadSuit && hasSuit(player.hand, leadSuit)) {
      return {
        valid: false,
        reason: `You must follow suit — play a ${leadSuit.toLowerCase()}.`,
      }
    }
    return { valid: false, reason: 'That card cannot be played right now.' }
  }

  return { valid: true }
}

/**
 * Returns the next player in clockwise order.
 */
export function getNextPlayer(currentId: PlayerId): PlayerId {
  const idx = PLAY_ORDER.indexOf(currentId)
  return PLAY_ORDER[(idx + 1) % PLAY_ORDER.length]
}

/**
 * Returns bidding order starting from the player left of the dealer.
 */
export function getBiddingOrder(dealerId: PlayerId): PlayerId[] {
  const dealerIdx = PLAY_ORDER.indexOf(dealerId)
  return [0, 1, 2, 3].map(i => PLAY_ORDER[(dealerIdx + 1 + i) % PLAY_ORDER.length])
}

/**
 * Checks if playing a card would break spades.
 */
export function wouldBreakSpades(card: Card): boolean {
  return isSpade(card)
}
