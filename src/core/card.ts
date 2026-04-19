import { Card, Rank, Suit } from './types'
import { ALL_RANKS, ALL_SUITS, RANK_NAMES, SUIT_SYMBOLS } from './constants'

export function createCard(suit: Suit, rank: Rank): Card {
  return { suit, rank, id: `${suit}_${rank}` }
}

export function cardLabel(card: Card): string {
  return `${RANK_NAMES[card.rank]}${SUIT_SYMBOLS[card.suit]}`
}

export function isRed(card: Card): boolean {
  return card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS
}

export function isSpade(card: Card): boolean {
  return card.suit === Suit.SPADES
}

export function compareCards(a: Card, b: Card): number {
  if (a.suit !== b.suit) return 0
  return a.rank - b.rank
}

// Sort hand: spades first (desc), then hearts desc, diamonds desc, clubs desc
// Within each suit, sorted by rank descending (highest first)
export function sortHand(hand: Card[]): Card[] {
  const suitOrder: Record<Suit, number> = {
    [Suit.SPADES]: 0,
    [Suit.HEARTS]: 1,
    [Suit.DIAMONDS]: 2,
    [Suit.CLUBS]: 3,
  }
  return [...hand].sort((a, b) => {
    const suitDiff = suitOrder[a.suit] - suitOrder[b.suit]
    if (suitDiff !== 0) return suitDiff
    return b.rank - a.rank
  })
}

export function groupBySuit(hand: Card[]): Record<Suit, Card[]> {
  const groups: Record<Suit, Card[]> = {
    [Suit.SPADES]: [],
    [Suit.HEARTS]: [],
    [Suit.DIAMONDS]: [],
    [Suit.CLUBS]: [],
  }
  for (const card of hand) {
    groups[card.suit].push(card)
  }
  return groups
}

export function getHighestInSuit(hand: Card[], suit: Suit): Card | null {
  const inSuit = hand.filter(c => c.suit === suit)
  if (inSuit.length === 0) return null
  return inSuit.reduce((best, c) => (c.rank > best.rank ? c : best))
}

export function getLowestInSuit(hand: Card[], suit: Suit): Card | null {
  const inSuit = hand.filter(c => c.suit === suit)
  if (inSuit.length === 0) return null
  return inSuit.reduce((best, c) => (c.rank < best.rank ? c : best))
}

export function hasSuit(hand: Card[], suit: Suit): boolean {
  return hand.some(c => c.suit === suit)
}

export function countSuit(hand: Card[], suit: Suit): number {
  return hand.filter(c => c.suit === suit).length
}

export function cardsEqual(a: Card, b: Card): boolean {
  return a.id === b.id
}

export function getAllPossibleCards(): Card[] {
  return ALL_SUITS.flatMap(suit => ALL_RANKS.map(rank => createCard(suit, rank)))
}
