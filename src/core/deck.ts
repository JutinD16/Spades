import { Card, PlayerId } from './types'
import { createCard } from './card'
import { ALL_RANKS, ALL_SUITS, CARDS_PER_HAND, PLAY_ORDER } from './constants'

export function createDeck(): Card[] {
  return ALL_SUITS.flatMap(suit => ALL_RANKS.map(rank => createCard(suit, rank)))
}

// Fisher-Yates shuffle — returns a new shuffled array
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export interface DealtHands {
  hands: Record<PlayerId, Card[]>
}

export function deal(deck: Card[]): DealtHands {
  const shuffled = shuffle(deck)
  const hands: Partial<Record<PlayerId, Card[]>> = {}

  PLAY_ORDER.forEach((playerId, i) => {
    hands[playerId] = shuffled.slice(i * CARDS_PER_HAND, (i + 1) * CARDS_PER_HAND)
  })

  return { hands: hands as Record<PlayerId, Card[]> }
}
