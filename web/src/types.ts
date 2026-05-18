/** Stored in FAS db 'polls' collection. */
export interface PollDoc {
  id: string
  title: string
  timezone: string
  isOpen: boolean
  publicResults: boolean
  votingSystem: 'simple' | 'detailed'
  startTime: number
  endTime: number
  _createdAt?: number
  _updatedAt?: number
  _owner?: string
}

/** Stored in FAS db 'votes' collection. One per user per poll. */
export interface VoteDoc {
  id: string
  pollId: string
  slotRatings: Record<string, number>
  voterName: string | null
  updatedAt: number
  _owner?: string
  _createdAt?: number
  _updatedAt?: number
}

/** Assembled client-side from PollDoc + VoteDocs. */
export interface Poll {
  id: string
  title: string
  timezone: string
  isOpen: boolean
  createdAt: number
  publicResults: boolean
  votingSystem: 'simple' | 'detailed'
  startTime: number
  endTime: number
  votes: Record<string, Record<string, number>>
  voters: Record<string, { name?: string | null; lastVoteAt: number }>
  totalVotes: number
  slotAttendance: Record<string, number>
  slotVoteCounts: Record<string, number>
  slotRatingBreakdowns: Record<string, { can: number; maybe: number; yes: number }>
}
