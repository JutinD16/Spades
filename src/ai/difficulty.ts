import { Difficulty } from '../core/types'

export interface DifficultyPolicy {
  bidAdjustment: number        // subtracted from raw trick count estimate
  nilBidThreshold: number      // max expected tricks to consider nil
  randomPlayChance: number     // 0–1, chance of playing randomly vs strategically
  trackPlayedCards: boolean
  antiNilPressure: boolean
  bagManagement: boolean
}

export const DIFFICULTY_POLICIES: Record<Difficulty, DifficultyPolicy> = {
  [Difficulty.EASY]: {
    bidAdjustment: 0,
    nilBidThreshold: -1,       // never bids nil
    randomPlayChance: 0.55,
    trackPlayedCards: false,
    antiNilPressure: false,
    bagManagement: false,
  },
  [Difficulty.NORMAL]: {
    bidAdjustment: 1,
    nilBidThreshold: 1,        // bids nil if expects 0–1 tricks
    randomPlayChance: 0.15,
    trackPlayedCards: false,
    antiNilPressure: true,
    bagManagement: false,
  },
  [Difficulty.HARD]: {
    bidAdjustment: 1,
    nilBidThreshold: 1,
    randomPlayChance: 0.0,
    trackPlayedCards: true,
    antiNilPressure: true,
    bagManagement: true,
  },
}
