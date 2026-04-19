import { describe, it, expect } from 'vitest'
import { createDeck, shuffle, deal } from '../../core/deck'
import { PlayerId } from '../../core/types'
import { CARDS_PER_HAND, PLAY_ORDER } from '../../core/constants'

describe('createDeck', () => {
  it('creates exactly 52 cards', () => {
    const deck = createDeck()
    expect(deck).toHaveLength(52)
  })

  it('has all unique card IDs', () => {
    const deck = createDeck()
    const ids = new Set(deck.map(c => c.id))
    expect(ids.size).toBe(52)
  })

  it('has 13 cards per suit', () => {
    const deck = createDeck()
    const bySuit: Record<string, number> = {}
    for (const card of deck) {
      bySuit[card.suit] = (bySuit[card.suit] || 0) + 1
    }
    for (const count of Object.values(bySuit)) {
      expect(count).toBe(13)
    }
  })
})

describe('shuffle', () => {
  it('returns same number of elements', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(shuffle(arr)).toHaveLength(5)
  })

  it('does not mutate the original array', () => {
    const arr = [1, 2, 3, 4, 5]
    shuffle(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('contains the same elements', () => {
    const arr = [1, 2, 3, 4, 5]
    const shuffled = shuffle(arr)
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5])
  })
})

describe('deal', () => {
  it('deals 13 cards to each player', () => {
    const deck = createDeck()
    const { hands } = deal(deck)
    for (const playerId of PLAY_ORDER) {
      expect(hands[playerId]).toHaveLength(CARDS_PER_HAND)
    }
  })

  it('deals all 52 cards with no duplicates', () => {
    const deck = createDeck()
    const { hands } = deal(deck)
    const allCards = PLAY_ORDER.flatMap(id => hands[id])
    const ids = new Set(allCards.map(c => c.id))
    expect(allCards).toHaveLength(52)
    expect(ids.size).toBe(52)
  })

  it('deals to all four players', () => {
    const deck = createDeck()
    const { hands } = deal(deck)
    expect(Object.keys(hands)).toHaveLength(4)
    for (const pid of [PlayerId.SOUTH, PlayerId.WEST, PlayerId.NORTH, PlayerId.EAST]) {
      expect(hands[pid]).toBeDefined()
    }
  })
})
