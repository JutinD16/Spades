import { BidType, GameConfig, NilResult, PlayerState, PlayerId, TeamId, TeamRoundResult, TeamState } from './types'
import { BLIND_NIL_BONUS, NIL_BONUS, SANDBAG_PENALTY, TEAM_PLAYERS } from './constants'

export interface ScoreCalculation {
  teamResults: Record<TeamId, TeamRoundResult>
}

/**
 * Calculate round scoring for both teams.
 *
 * Scoring rules:
 *   Made contract: bid * 10 + overtricks_as_bags
 *   Missed contract: -(bid * 10)
 *   Nil success: +100; failure: -100
 *   Blind nil success: +200; failure: -200
 *   Sandbag penalty: -100 per 10 cumulative bags (bags reset mod 10)
 *
 * Nil bids are scored separately; the nil bidder's tricks do NOT contribute
 * to the team's trick count for contract purposes but DO count as bags if
 * the team otherwise makes their contract.
 */
export function calculateRoundScores(
  teams: Record<TeamId, TeamState>,
  players: Record<PlayerId, PlayerState>,
  config: GameConfig,
): ScoreCalculation {
  const teamResults: Partial<Record<TeamId, TeamRoundResult>> = {}

  for (const teamId of [TeamId.TEAM_NS, TeamId.TEAM_WE]) {
    const team = teams[teamId]
    const [p1Id, p2Id] = TEAM_PLAYERS[teamId]
    const p1 = players[p1Id]
    const p2 = players[p2Id]

    // Separate nil bidders from number bidders
    const nilResults: NilResult[] = []
    let teamBid = 0
    let teamTricksForContract = 0

    for (const player of [p1, p2]) {
      if (!player.bid) continue

      if (player.bid.type === BidType.NIL || player.bid.type === BidType.BLIND_NIL) {
        const success = player.tricksWon === 0
        const bonus = player.bid.type === BidType.BLIND_NIL ? BLIND_NIL_BONUS : NIL_BONUS
        nilResults.push({
          playerId: player.id,
          bidType: player.bid.type as BidType.NIL | BidType.BLIND_NIL,
          success,
          bonus: success ? bonus : -bonus,
        })
        // Nil player tricks become bags for the team if contract is made
        teamTricksForContract += 0
      } else {
        teamBid += player.bid.value
        teamTricksForContract += player.tricksWon
      }
    }

    // Nil player tricks are accounted for as extra tricks for the non-nil partner
    // but are not part of the partner's bid — they become bags if contract made
    const totalTeamTricks = p1.tricksWon + p2.tricksWon
    const nilPlayerTricks = nilResults.reduce((sum, nr) => {
      const player = nr.playerId === p1Id ? p1 : p2
      return sum + player.tricksWon
    }, 0)
    const contractTricks = totalTeamTricks - nilPlayerTricks

    const madeContract = contractTricks >= teamBid
    let roundScore = 0

    if (teamBid === 0 && nilResults.length === 0) {
      // Edge: both players bid nil handled above
      roundScore = 0
    } else if (madeContract) {
      const overtricks = contractTricks - teamBid
      roundScore = teamBid * 10 + overtricks
    } else {
      roundScore = -(teamBid * 10)
    }

    // Add nil bonuses/penalties
    for (const nr of nilResults) {
      roundScore += nr.bonus
    }

    // Calculate bags (nil player tricks always count as bags)
    let bagsGained = 0
    if (madeContract) {
      bagsGained = contractTricks - teamBid + nilPlayerTricks
    } else {
      bagsGained = nilPlayerTricks
    }

    // Sandbag penalty
    let sandbagPenalty = false
    let newCumulativeBags = team.cumulativeBags + bagsGained

    if (config.sandbagPenaltyEnabled && newCumulativeBags >= config.sandbagLimit) {
      const penalties = Math.floor(newCumulativeBags / config.sandbagLimit)
      roundScore -= penalties * SANDBAG_PENALTY
      newCumulativeBags = newCumulativeBags % config.sandbagLimit
      sandbagPenalty = true
    }

    teamResults[teamId] = {
      teamId,
      bid: teamBid,
      tricksWon: totalTeamTricks,
      nilResults,
      bagsGained,
      sandbagPenalty,
      roundScore,
    }
  }

  return { teamResults: teamResults as Record<TeamId, TeamRoundResult> }
}

/**
 * Checks if the match has ended.
 * Returns the winning TeamId or null if game continues.
 * If both teams cross targetScore simultaneously, the higher score wins.
 * If tied, the round continues (returns null).
 */
export function checkMatchOver(
  teams: Record<TeamId, TeamState>,
  config: GameConfig,
): TeamId | null {
  const nsScore = teams[TeamId.TEAM_NS].score
  const weScore = teams[TeamId.TEAM_WE].score
  const nsOver = nsScore >= config.targetScore
  const weOver = weScore >= config.targetScore

  if (!nsOver && !weOver) return null

  if (nsOver && weOver) {
    if (nsScore > weScore) return TeamId.TEAM_NS
    if (weScore > nsScore) return TeamId.TEAM_WE
    return null // exact tie — play another round
  }

  if (nsOver) return TeamId.TEAM_NS
  return TeamId.TEAM_WE
}

/**
 * Computes updated bags for a team after a round.
 */
export function computeNewBags(
  currentBags: number,
  bagsGained: number,
  config: GameConfig,
): number {
  if (!config.sandbagPenaltyEnabled) return currentBags + bagsGained
  return (currentBags + bagsGained) % config.sandbagLimit
}
