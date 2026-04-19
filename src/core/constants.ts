import { AnimationSpeed, Difficulty, GameConfig, PlayerId, Rank, Suit, TeamId } from './types'

export const PLAY_ORDER: PlayerId[] = [
  PlayerId.SOUTH,
  PlayerId.WEST,
  PlayerId.NORTH,
  PlayerId.EAST,
]

export const PLAYER_TEAMS: Record<PlayerId, TeamId> = {
  [PlayerId.SOUTH]: TeamId.TEAM_NS,
  [PlayerId.NORTH]: TeamId.TEAM_NS,
  [PlayerId.WEST]: TeamId.TEAM_WE,
  [PlayerId.EAST]: TeamId.TEAM_WE,
}

export const TEAM_PLAYERS: Record<TeamId, [PlayerId, PlayerId]> = {
  [TeamId.TEAM_NS]: [PlayerId.SOUTH, PlayerId.NORTH],
  [TeamId.TEAM_WE]: [PlayerId.WEST, PlayerId.EAST],
}

export const PARTNER: Record<PlayerId, PlayerId> = {
  [PlayerId.SOUTH]: PlayerId.NORTH,
  [PlayerId.NORTH]: PlayerId.SOUTH,
  [PlayerId.WEST]: PlayerId.EAST,
  [PlayerId.EAST]: PlayerId.WEST,
}

export const ALL_SUITS: Suit[] = [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS]

export const ALL_RANKS: Rank[] = [
  Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX, Rank.SEVEN,
  Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE,
]

export const RANK_NAMES: Record<Rank, string> = {
  [Rank.TWO]: '2',
  [Rank.THREE]: '3',
  [Rank.FOUR]: '4',
  [Rank.FIVE]: '5',
  [Rank.SIX]: '6',
  [Rank.SEVEN]: '7',
  [Rank.EIGHT]: '8',
  [Rank.NINE]: '9',
  [Rank.TEN]: '10',
  [Rank.JACK]: 'J',
  [Rank.QUEEN]: 'Q',
  [Rank.KING]: 'K',
  [Rank.ACE]: 'A',
}

export const SUIT_SYMBOLS: Record<Suit, string> = {
  [Suit.SPADES]: '♠',
  [Suit.HEARTS]: '♥',
  [Suit.DIAMONDS]: '♦',
  [Suit.CLUBS]: '♣',
}

export const SUIT_NAMES: Record<Suit, string> = {
  [Suit.SPADES]: 'Spades',
  [Suit.HEARTS]: 'Hearts',
  [Suit.DIAMONDS]: 'Diamonds',
  [Suit.CLUBS]: 'Clubs',
}

export const PLAYER_NAMES: Record<PlayerId, string> = {
  [PlayerId.SOUTH]: 'You',
  [PlayerId.WEST]: 'West',
  [PlayerId.NORTH]: 'North',
  [PlayerId.EAST]: 'East',
}

export const TEAM_NAMES: Record<TeamId, string> = {
  [TeamId.TEAM_NS]: 'Your Team',
  [TeamId.TEAM_WE]: 'Opponents',
}

export const CARDS_PER_HAND = 13
export const TOTAL_TRICKS = 13

export const NIL_BONUS = 100
export const BLIND_NIL_BONUS = 200
export const SANDBAG_PENALTY = 100

export const DEFAULT_CONFIG: GameConfig = {
  targetScore: 500,
  nilEnabled: true,
  blindNilEnabled: true,
  sandbagPenaltyEnabled: true,
  sandbagLimit: 10,
  breakingSpades: true,
  difficulty: Difficulty.NORMAL,
  animationSpeed: AnimationSpeed.NORMAL,
  hintsEnabled: false,
}

export const ANIMATION_DURATIONS: Record<AnimationSpeed, number> = {
  [AnimationSpeed.SLOW]: 1.6,
  [AnimationSpeed.NORMAL]: 1.0,
  [AnimationSpeed.FAST]: 0.4,
  [AnimationSpeed.OFF]: 0,
}

export const AI_THINK_DELAYS: Record<AnimationSpeed, number> = {
  [AnimationSpeed.SLOW]: 1800,
  [AnimationSpeed.NORMAL]: 900,
  [AnimationSpeed.FAST]: 350,
  [AnimationSpeed.OFF]: 50,
}
