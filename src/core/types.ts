export enum Suit {
  SPADES = 'SPADES',
  HEARTS = 'HEARTS',
  DIAMONDS = 'DIAMONDS',
  CLUBS = 'CLUBS',
}

export enum Rank {
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
  SIX = 6,
  SEVEN = 7,
  EIGHT = 8,
  NINE = 9,
  TEN = 10,
  JACK = 11,
  QUEEN = 12,
  KING = 13,
  ACE = 14,
}

export interface Card {
  suit: Suit
  rank: Rank
  id: string
}

export enum PlayerId {
  SOUTH = 'SOUTH',
  WEST = 'WEST',
  NORTH = 'NORTH',
  EAST = 'EAST',
}

export enum TeamId {
  TEAM_NS = 'TEAM_NS',
  TEAM_WE = 'TEAM_WE',
}

export enum BidType {
  NUMBER = 'NUMBER',
  NIL = 'NIL',
  BLIND_NIL = 'BLIND_NIL',
}

export enum GamePhase {
  MENU = 'MENU',
  DEALING = 'DEALING',
  BIDDING = 'BIDDING',
  BLIND_NIL_SWAP = 'BLIND_NIL_SWAP',
  PLAYING = 'PLAYING',
  ROUND_SUMMARY = 'ROUND_SUMMARY',
  MATCH_RESULTS = 'MATCH_RESULTS',
}

export enum Difficulty {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD',
}

export enum AnimationSpeed {
  SLOW = 'SLOW',
  NORMAL = 'NORMAL',
  FAST = 'FAST',
  OFF = 'OFF',
}

export interface Bid {
  playerId: PlayerId
  type: BidType
  value: number
}

export interface TrickCard {
  card: Card
  playerId: PlayerId
}

export interface Trick {
  id: number
  cards: TrickCard[]
  leadSuit: Suit | null
  leadPlayerId: PlayerId
  winnerId: PlayerId | null
  isComplete: boolean
}

export interface PlayerState {
  id: PlayerId
  name: string
  isHuman: boolean
  hand: Card[]
  bid: Bid | null
  tricksWon: number
}

export interface TeamState {
  id: TeamId
  players: [PlayerId, PlayerId]
  cumulativeBags: number
  score: number
}

export interface NilResult {
  playerId: PlayerId
  bidType: BidType.NIL | BidType.BLIND_NIL
  success: boolean
  bonus: number
}

export interface TeamRoundResult {
  teamId: TeamId
  bid: number
  tricksWon: number
  nilResults: NilResult[]
  bagsGained: number
  sandbagPenalty: boolean
  roundScore: number
}

export interface RoundResult {
  roundNumber: number
  teamResults: Record<TeamId, TeamRoundResult>
  scoreBefore: Record<TeamId, number>
  scoreAfter: Record<TeamId, number>
}

export interface GameConfig {
  targetScore: number
  nilEnabled: boolean
  blindNilEnabled: boolean
  sandbagPenaltyEnabled: boolean
  sandbagLimit: number
  breakingSpades: boolean
  difficulty: Difficulty
  animationSpeed: AnimationSpeed
  hintsEnabled: boolean
}

export interface GameState {
  phase: GamePhase
  config: GameConfig
  roundNumber: number
  dealerId: PlayerId
  players: Record<PlayerId, PlayerState>
  teams: Record<TeamId, TeamState>
  biddingOrder: PlayerId[]
  currentBidderIndex: number
  currentTrick: Trick | null
  completedTricks: Trick[]
  leadPlayerId: PlayerId
  currentPlayerId: PlayerId
  spadesBroken: boolean
  roundResults: RoundResult[]
  winnerId: TeamId | null
  lastTrickWinnerId: PlayerId | null
  aiThinkingPlayerId: PlayerId | null
  pendingBlindNilPlayers: PlayerId[]
  invalidPlayMessage: string | null
}
