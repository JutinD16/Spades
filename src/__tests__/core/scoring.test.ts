import { describe, it, expect } from 'vitest'
import { calculateRoundScores, checkMatchOver } from '../../core/scoring'
import { BidType, GameConfig, PlayerState, PlayerId, TeamId, TeamState } from '../../core/types'
import { DEFAULT_CONFIG, TEAM_PLAYERS } from '../../core/constants'

const cfg: GameConfig = { ...DEFAULT_CONFIG }

function makePlayer(id: PlayerId, bidValue: number, tricksWon: number, bidType: BidType = BidType.NUMBER): PlayerState {
  return {
    id,
    name: id,
    isHuman: id === PlayerId.SOUTH,
    hand: [],
    bid: { playerId: id, type: bidType, value: bidValue },
    tricksWon,
  }
}

function makeTeam(id: TeamId, score: number = 0, bags: number = 0): TeamState {
  return {
    id,
    players: TEAM_PLAYERS[id],
    score,
    cumulativeBags: bags,
  }
}

describe('calculateRoundScores - made contract', () => {
  it('awards bid * 10 for exact contract', () => {
    const players = {
      [PlayerId.SOUTH]: makePlayer(PlayerId.SOUTH, 3, 3),
      [PlayerId.NORTH]: makePlayer(PlayerId.NORTH, 2, 2),
      [PlayerId.WEST]: makePlayer(PlayerId.WEST, 3, 4),
      [PlayerId.EAST]: makePlayer(PlayerId.EAST, 2, 2),
    }
    const teams = {
      [TeamId.TEAM_NS]: makeTeam(TeamId.TEAM_NS),
      [TeamId.TEAM_WE]: makeTeam(TeamId.TEAM_WE),
    }
    const { teamResults } = calculateRoundScores(teams, players, cfg)
    expect(teamResults[TeamId.TEAM_NS].roundScore).toBe(50) // 5 * 10
    expect(teamResults[TeamId.TEAM_WE].roundScore).toBe(51) // 5 * 10 + 1 bag
  })

  it('awards overtricks as 1 point each (bags)', () => {
    const players = {
      [PlayerId.SOUTH]: makePlayer(PlayerId.SOUTH, 3, 5),
      [PlayerId.NORTH]: makePlayer(PlayerId.NORTH, 2, 3),
      [PlayerId.WEST]: makePlayer(PlayerId.WEST, 4, 4),
      [PlayerId.EAST]: makePlayer(PlayerId.EAST, 3, 3),
    }
    const teams = {
      [TeamId.TEAM_NS]: makeTeam(TeamId.TEAM_NS),
      [TeamId.TEAM_WE]: makeTeam(TeamId.TEAM_WE),
    }
    const { teamResults } = calculateRoundScores(teams, players, cfg)
    // NS: bid 5, won 8 → 50 + 3 bags = 53
    expect(teamResults[TeamId.TEAM_NS].roundScore).toBe(53)
    expect(teamResults[TeamId.TEAM_NS].bagsGained).toBe(3)
  })
})

describe('calculateRoundScores - missed contract', () => {
  it('deducts bid * 10 for missed contract', () => {
    const players = {
      [PlayerId.SOUTH]: makePlayer(PlayerId.SOUTH, 4, 2),
      [PlayerId.NORTH]: makePlayer(PlayerId.NORTH, 3, 1),
      [PlayerId.WEST]: makePlayer(PlayerId.WEST, 4, 4),
      [PlayerId.EAST]: makePlayer(PlayerId.EAST, 3, 3),
    }
    const teams = {
      [TeamId.TEAM_NS]: makeTeam(TeamId.TEAM_NS),
      [TeamId.TEAM_WE]: makeTeam(TeamId.TEAM_WE),
    }
    const { teamResults } = calculateRoundScores(teams, players, cfg)
    // NS bid 7, won 3 → -70
    expect(teamResults[TeamId.TEAM_NS].roundScore).toBe(-70)
  })
})

describe('calculateRoundScores - nil', () => {
  it('awards +100 for successful nil', () => {
    const players = {
      [PlayerId.SOUTH]: makePlayer(PlayerId.SOUTH, 0, 0, BidType.NIL),
      [PlayerId.NORTH]: makePlayer(PlayerId.NORTH, 4, 7),
      [PlayerId.WEST]: makePlayer(PlayerId.WEST, 4, 4),
      [PlayerId.EAST]: makePlayer(PlayerId.EAST, 4, 3),
    }
    const teams = {
      [TeamId.TEAM_NS]: makeTeam(TeamId.TEAM_NS),
      [TeamId.TEAM_WE]: makeTeam(TeamId.TEAM_WE),
    }
    const { teamResults } = calculateRoundScores(teams, players, cfg)
    // NS: nil bonus +100, North bid 4 won 7 (made) → 40 + 3 bags
    expect(teamResults[TeamId.TEAM_NS].nilResults[0].success).toBe(true)
    expect(teamResults[TeamId.TEAM_NS].nilResults[0].bonus).toBe(100)
  })

  it('deducts 100 for failed nil', () => {
    const players = {
      [PlayerId.SOUTH]: makePlayer(PlayerId.SOUTH, 0, 2, BidType.NIL),
      [PlayerId.NORTH]: makePlayer(PlayerId.NORTH, 4, 5),
      [PlayerId.WEST]: makePlayer(PlayerId.WEST, 4, 4),
      [PlayerId.EAST]: makePlayer(PlayerId.EAST, 4, 3),
    }
    const teams = {
      [TeamId.TEAM_NS]: makeTeam(TeamId.TEAM_NS),
      [TeamId.TEAM_WE]: makeTeam(TeamId.TEAM_WE),
    }
    const { teamResults } = calculateRoundScores(teams, players, cfg)
    expect(teamResults[TeamId.TEAM_NS].nilResults[0].success).toBe(false)
    expect(teamResults[TeamId.TEAM_NS].nilResults[0].bonus).toBe(-100)
  })

  it('awards +200 for blind nil success', () => {
    const players = {
      [PlayerId.SOUTH]: makePlayer(PlayerId.SOUTH, 0, 0, BidType.BLIND_NIL),
      [PlayerId.NORTH]: makePlayer(PlayerId.NORTH, 4, 13),
      [PlayerId.WEST]: makePlayer(PlayerId.WEST, 4, 4),
      [PlayerId.EAST]: makePlayer(PlayerId.EAST, 4, 3),
    }
    const teams = {
      [TeamId.TEAM_NS]: makeTeam(TeamId.TEAM_NS),
      [TeamId.TEAM_WE]: makeTeam(TeamId.TEAM_WE),
    }
    const { teamResults } = calculateRoundScores(teams, players, cfg)
    expect(teamResults[TeamId.TEAM_NS].nilResults[0].success).toBe(true)
    expect(teamResults[TeamId.TEAM_NS].nilResults[0].bonus).toBe(200)
  })
})

describe('calculateRoundScores - sandbag penalty', () => {
  it('applies -100 penalty when bags reach limit', () => {
    const players = {
      [PlayerId.SOUTH]: makePlayer(PlayerId.SOUTH, 3, 5),
      [PlayerId.NORTH]: makePlayer(PlayerId.NORTH, 2, 4),
      [PlayerId.WEST]: makePlayer(PlayerId.WEST, 4, 4),
      [PlayerId.EAST]: makePlayer(PlayerId.EAST, 3, 3),
    }
    // NS already at 8 bags, will gain 4 overtricks this round → 12 bags → 1 penalty
    const teams = {
      [TeamId.TEAM_NS]: makeTeam(TeamId.TEAM_NS, 0, 8),
      [TeamId.TEAM_WE]: makeTeam(TeamId.TEAM_WE),
    }
    const { teamResults } = calculateRoundScores(teams, players, cfg)
    expect(teamResults[TeamId.TEAM_NS].sandbagPenalty).toBe(true)
    // 5 bid, won 9 → 50 + 4 bags - 100 penalty = -46
    expect(teamResults[TeamId.TEAM_NS].roundScore).toBe(-46)
  })
})

describe('checkMatchOver', () => {
  it('returns winning team when over target', () => {
    const teams = {
      [TeamId.TEAM_NS]: makeTeam(TeamId.TEAM_NS, 510),
      [TeamId.TEAM_WE]: makeTeam(TeamId.TEAM_WE, 200),
    }
    expect(checkMatchOver(teams, cfg)).toBe(TeamId.TEAM_NS)
  })

  it('returns null when no team has reached target', () => {
    const teams = {
      [TeamId.TEAM_NS]: makeTeam(TeamId.TEAM_NS, 400),
      [TeamId.TEAM_WE]: makeTeam(TeamId.TEAM_WE, 300),
    }
    expect(checkMatchOver(teams, cfg)).toBeNull()
  })

  it('returns higher-scoring team when both cross simultaneously', () => {
    const teams = {
      [TeamId.TEAM_NS]: makeTeam(TeamId.TEAM_NS, 520),
      [TeamId.TEAM_WE]: makeTeam(TeamId.TEAM_WE, 510),
    }
    expect(checkMatchOver(teams, cfg)).toBe(TeamId.TEAM_NS)
  })

  it('returns null on exact tie when both cross simultaneously', () => {
    const teams = {
      [TeamId.TEAM_NS]: makeTeam(TeamId.TEAM_NS, 510),
      [TeamId.TEAM_WE]: makeTeam(TeamId.TEAM_WE, 510),
    }
    expect(checkMatchOver(teams, cfg)).toBeNull()
  })
})
