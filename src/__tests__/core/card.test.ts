import { describe, it, expect } from 'vitest'
import { createCard, sortHand, groupBySuit, hasSuit, getHighestInSuit, getLowestInSuit, isRed, isSpade, cardsEqual } from '../../core/card'
import { Suit, Rank } from '../../core/types'

describe('createCard', () => {
  it('creates a card with correct properties', () => {
    const card = createCard(Suit.SPADES, Rank.ACE)
    expect(card.suit).toBe(Suit.SPADES)
    expect(card.rank).toBe(Rank.ACE)
    expect(card.id).toBe('SPADES_14')
  })
})

describe('sortHand', () => {
  it('sorts spades first, then hearts, diamonds, clubs', () => {
    const hand = [
      createCard(Suit.CLUBS, Rank.ACE),
      createCard(Suit.SPADES, Rank.TWO),
      createCard(Suit.HEARTS, Rank.KING),
      createCard(Suit.DIAMONDS, Rank.JACK),
    ]
    const sorted = sortHand(hand)
    expect(sorted[0].suit).toBe(Suit.SPADES)
    expect(sorted[1].suit).toBe(Suit.HEARTS)
    expect(sorted[2].suit).toBe(Suit.DIAMONDS)
    expect(sorted[3].suit).toBe(Suit.CLUBS)
  })

  it('sorts by rank descending within each suit', () => {
    const hand = [
      createCard(Suit.SPADES, Rank.TWO),
      createCard(Suit.SPADES, Rank.ACE),
      createCard(Suit.SPADES, Rank.SEVEN),
    ]
    const sorted = sortHand(hand)
    expect(sorted[0].rank).toBe(Rank.ACE)
    expect(sorted[1].rank).toBe(Rank.SEVEN)
    expect(sorted[2].rank).toBe(Rank.TWO)
  })
})

describe('isRed', () => {
  it('returns true for hearts and diamonds', () => {
    expect(isRed(createCard(Suit.HEARTS, Rank.ACE))).toBe(true)
    expect(isRed(createCard(Suit.DIAMONDS, Rank.ACE))).toBe(true)
  })
  it('returns false for spades and clubs', () => {
    expect(isRed(createCard(Suit.SPADES, Rank.ACE))).toBe(false)
    expect(isRed(createCard(Suit.CLUBS, Rank.ACE))).toBe(false)
  })
})

describe('isSpade', () => {
  it('returns true only for spades', () => {
    expect(isSpade(createCard(Suit.SPADES, Rank.ACE))).toBe(true)
    expect(isSpade(createCard(Suit.HEARTS, Rank.ACE))).toBe(false)
  })
})

describe('hasSuit', () => {
  it('detects suit presence in hand', () => {
    const hand = [createCard(Suit.HEARTS, Rank.ACE), createCard(Suit.CLUBS, Rank.KING)]
    expect(hasSuit(hand, Suit.HEARTS)).toBe(true)
    expect(hasSuit(hand, Suit.SPADES)).toBe(false)
  })
})

describe('getHighestInSuit', () => {
  it('returns highest card of given suit', () => {
    const hand = [createCard(Suit.HEARTS, Rank.THREE), createCard(Suit.HEARTS, Rank.ACE), createCard(Suit.HEARTS, Rank.KING)]
    const highest = getHighestInSuit(hand, Suit.HEARTS)
    expect(highest?.rank).toBe(Rank.ACE)
  })
  it('returns null if suit not in hand', () => {
    const hand = [createCard(Suit.CLUBS, Rank.ACE)]
    expect(getHighestInSuit(hand, Suit.HEARTS)).toBeNull()
  })
})

describe('getLowestInSuit', () => {
  it('returns lowest card of given suit', () => {
    const hand = [createCard(Suit.HEARTS, Rank.THREE), createCard(Suit.HEARTS, Rank.ACE)]
    const lowest = getLowestInSuit(hand, Suit.HEARTS)
    expect(lowest?.rank).toBe(Rank.THREE)
  })
})

describe('cardsEqual', () => {
  it('correctly identifies equal cards', () => {
    const a = createCard(Suit.SPADES, Rank.ACE)
    const b = createCard(Suit.SPADES, Rank.ACE)
    expect(cardsEqual(a, b)).toBe(true)
  })
  it('correctly identifies unequal cards', () => {
    const a = createCard(Suit.SPADES, Rank.ACE)
    const b = createCard(Suit.HEARTS, Rank.ACE)
    expect(cardsEqual(a, b)).toBe(false)
  })
})

describe('groupBySuit', () => {
  it('groups cards by suit correctly', () => {
    const hand = [
      createCard(Suit.SPADES, Rank.ACE),
      createCard(Suit.HEARTS, Rank.KING),
      createCard(Suit.SPADES, Rank.TWO),
    ]
    const groups = groupBySuit(hand)
    expect(groups[Suit.SPADES]).toHaveLength(2)
    expect(groups[Suit.HEARTS]).toHaveLength(1)
    expect(groups[Suit.DIAMONDS]).toHaveLength(0)
  })
})
