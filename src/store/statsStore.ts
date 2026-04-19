import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MatchStats {
  matchesPlayed: number
  matchesWon: number
  matchesLost: number
  totalRoundsPlayed: number
  nilsBid: number
  nilsSucceeded: number
  blindNilsBid: number
  blindNilsSucceeded: number
  totalBagsGained: number
  sandbagPenaltiesHit: number
  highestScore: number
  bestRoundScore: number
}

const defaultStats: MatchStats = {
  matchesPlayed: 0,
  matchesWon: 0,
  matchesLost: 0,
  totalRoundsPlayed: 0,
  nilsBid: 0,
  nilsSucceeded: 0,
  blindNilsBid: 0,
  blindNilsSucceeded: 0,
  totalBagsGained: 0,
  sandbagPenaltiesHit: 0,
  highestScore: 0,
  bestRoundScore: 0,
}

interface StatsStore {
  stats: MatchStats
  recordMatchResult: (won: boolean, finalScore: number) => void
  recordRound: (roundScore: number) => void
  recordNil: (success: boolean, isBlind: boolean) => void
  recordBags: (bags: number, penaltyHit: boolean) => void
  resetStats: () => void
}

export const useStatsStore = create<StatsStore>()(
  persist(
    (set) => ({
      stats: defaultStats,

      recordMatchResult: (won, finalScore) =>
        set(state => ({
          stats: {
            ...state.stats,
            matchesPlayed: state.stats.matchesPlayed + 1,
            matchesWon: state.stats.matchesWon + (won ? 1 : 0),
            matchesLost: state.stats.matchesLost + (won ? 0 : 1),
            highestScore: Math.max(state.stats.highestScore, finalScore),
          },
        })),

      recordRound: (roundScore) =>
        set(state => ({
          stats: {
            ...state.stats,
            totalRoundsPlayed: state.stats.totalRoundsPlayed + 1,
            bestRoundScore: Math.max(state.stats.bestRoundScore, roundScore),
          },
        })),

      recordNil: (success, isBlind) =>
        set(state => ({
          stats: {
            ...state.stats,
            nilsBid: state.stats.nilsBid + (isBlind ? 0 : 1),
            nilsSucceeded: state.stats.nilsSucceeded + (!isBlind && success ? 1 : 0),
            blindNilsBid: state.stats.blindNilsBid + (isBlind ? 1 : 0),
            blindNilsSucceeded: state.stats.blindNilsSucceeded + (isBlind && success ? 1 : 0),
          },
        })),

      recordBags: (bags, penaltyHit) =>
        set(state => ({
          stats: {
            ...state.stats,
            totalBagsGained: state.stats.totalBagsGained + bags,
            sandbagPenaltiesHit: state.stats.sandbagPenaltiesHit + (penaltyHit ? 1 : 0),
          },
        })),

      resetStats: () => set({ stats: defaultStats }),
    }),
    { name: 'spades-stats' },
  ),
)
