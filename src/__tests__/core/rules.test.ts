import { describe, it, expect } from 'vitest'
import { getLegalCards, determineTrickWinner, getNextPlayer, getBiddingOrder } from '../../core/rules'
import { createCard } from '../../core/card'
import { Suit, Rank, PlayerId, Trick } from '../../core/types'
import { DEFAULT_CONFIG } from '../../core/constants'

const cfg = DEFAULT_CONFIG

function makeTrick(leadId: PlayerId, cards: { card: ReturnType<typeof createCard>; playerId: PlayerId }[] = []): Trick {
  return {
    id: 0,
    cards,
    leadSuit: cards.length > 0 ? cards[0].card.suit : null,
    leadPlayerId: leadId,
    winnerId: null,
    isComplete: cards.length === 4,
  }
}

describe('getLegalCards - leading', () => {
  it('allows all cards when spades are broken', () => {
    const hand = [
      createCard(Suit.SPADES, Rank.ACE),
      createCard(Suit.HEARTS, Rank.KING),
    ]
    const legal = getLegalCards(hand, null, true, cfg)
    expect(legal).toHaveLength(2)
  })

  it('blocks leading spades when not broken', () => {
    const hand = [
      createCard(Suit.SPADES, Rank.ACE),
      createCard(Suit.HEARTS, Rank.KING),
    ]
    const legal = getLegalCards(hand, null, false, cfg)
    expect(legal).toHaveLength(1)
    expect(legal[0].suit).toBe(Suit.HEARTS)
  })

  it('allows leading spades when hand is all spades', () => {
    const hand = [
      createCard(Suit.SPADES, Rank.ACE),
      createCard(Suit.SPADES, Rank.KING),
    ]
    const legal = getLegalCards(hand, null, false, cfg)
    expect(legal).toHaveLength(2)
    expect(legal.every(c => c.suit === Suit.SPADES)).toBe(true)
  })

  it('allows all cards when breakingSpades is disabled', () => {
    const hand = [createCard(Suit.SPADES, Rank.ACE), createCard(Suit.HEARTS, Rank.TWO)]
    const noBreakCfg = { ...cfg, breakingSpades: false }
    const legal = getLegalCards(hand, null, false, noBreakCfg)
    expect(legal).toHaveLength(2)
  })
})

describe('getLegalCards - following suit', () => {
  it('must follow lead suit if able', () => {
    const hand = [
      createCard(Suit.HEARTS, Rank.ACE),
      createCard(Suit.SPADES, Rank.KING),
    ]
    const trick = makeTrick(PlayerId.WEST, [
      { card: createCard(Suit.HEARTS, Rank.TWO), playerId: PlayerId.WEST },
    ])
    const legal = getLegalCards(hand, trick, false, cfg)
    expect(legal).toHaveLength(1)
    expect(legal[0].suit).toBe(Suit.HEARTS)
  })

  it('can play any card if void in lead suit', () => {
    const hand = [
      createCard(Suit.SPADES, Rank.ACE),
      createCard(Suit.CLUBS, Rank.KING),
    ]
    const trick = makeTrick(PlayerId.WEST, [
      { card: createCard(Suit.HEARTS, Rank.TWO), playerId: PlayerId.WEST },
    ])
    const legal = getLegalCards(hand, trick, false, cfg)
    expect(legal).toHaveLength(2)
  })
})

describe('determineTrickWinner', () => {
  it('highest of lead suit wins when no spades', () => {
    const trick = makeTrick(PlayerId.SOUTH, [
      { card: createCard(Suit.HEARTS, Rank.THREE), playerId: PlayerId.SOUTH },
      { card: createCard(Suit.HEARTS, Rank.ACE), playerId: PlayerId.WEST },
      { card: createCard(Suit.HEARTS, Rank.KING), playerId: PlayerId.NORTH },
      { card: createCard(Suit.CLUBS, Rank.TWO), playerId: PlayerId.EAST },
    ])
    expect(determineTrickWinner(trick)).toBe(PlayerId.WEST)
  })

  it('highest spade wins even if low', () => {
    const trick = makeTrick(PlayerId.SOUTH, [
      { card: createCard(Suit.HEARTS, Rank.ACE), playerId: PlayerId.SOUTH },
      { card: createCard(Suit.SPADES, Rank.TWO), playerId: PlayerId.WEST },
      { card: createCard(Suit.HEARTS, Rank.KING), playerId: PlayerId.NORTH },
      { card: createCard(Suit.HEARTS, Rank.QUEEN), playerId: PlayerId.EAST },
    ])
    expect(determineTrickWinner(trick)).toBe(PlayerId.WEST)
  })

  it('highest spade among multiple spades wins', () => {
    const trick = makeTrick(PlayerId.SOUTH, [
      { card: createCard(Suit.HEARTS, Rank.ACE), playerId: PlayerId.SOUTH },
      { card: createCard(Suit.SPADES, Rank.TWO), playerId: PlayerId.WEST },
      { card: createCard(Suit.SPADES, Rank.ACE), playerId: PlayerId.NORTH },
      { card: createCard(Suit.SPADES, Rank.KING), playerId: PlayerId.EAST },
    ])
    expect(determineTrickWinner(trick)).toBe(PlayerId.NORTH)
  })

  it('off-suit non-spade cards do not win even if high', () => {
    const trick = makeTrick(PlayerId.SOUTH, [
      { card: createCard(Suit.HEARTS, Rank.THREE), playerId: PlayerId.SOUTH },
      { card: createCard(Suit.DIAMONDS, Rank.ACE), playerId: PlayerId.WEST },
      { card: createCard(Suit.HEARTS, Rank.KING), playerId: PlayerId.NORTH },
      { card: createCard(Suit.CLUBS, Rank.ACE), playerId: PlayerId.EAST },
    ])
    expect(determineTrickWinner(trick)).toBe(PlayerId.NORTH)
  })
})

describe('getNextPlayer', () => {
  it('cycles through players clockwise', () => {
    expect(getNextPlayer(PlayerId.SOUTH)).toBe(PlayerId.WEST)
    expect(getNextPlayer(PlayerId.WEST)).toBe(PlayerId.NORTH)
    expect(getNextPlayer(PlayerId.NORTH)).toBe(PlayerId.EAST)
    expect(getNextPlayer(PlayerId.EAST)).toBe(PlayerId.SOUTH)
  })
})

describe('getBiddingOrder', () => {
  it('starts from left of dealer', () => {
    const order = getBiddingOrder(PlayerId.SOUTH)
    expect(order[0]).toBe(PlayerId.WEST)
    expect(order).toHaveLength(4)
  })

  it('includes all four players', () => {
    const order = getBiddingOrder(PlayerId.NORTH)
    const set = new Set(order)
    expect(set.size).toBe(4)
  })

  it('wraps around correctly', () => {
    const order = getBiddingOrder(PlayerId.EAST)
    expect(order[0]).toBe(PlayerId.SOUTH)
  })
})
