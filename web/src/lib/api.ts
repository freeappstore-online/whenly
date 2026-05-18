import type { Poll, PollDoc, VoteDoc } from '../types'
import { fas } from './fas'

const polls = fas.db.collection('polls')
const votes = fas.db.collection('votes')

function assemblePoll(doc: PollDoc, voteDocs: VoteDoc[]): Poll {
  const pollVotes: Poll['votes'] = {}
  const voters: Poll['voters'] = {}
  const uniqueVoters = new Set<string>()

  for (const v of voteDocs) {
    const odId = v._owner ?? v.id
    for (const [slotId, rating] of Object.entries(v.slotRatings)) {
      if (!pollVotes[slotId]) pollVotes[slotId] = {}
      pollVotes[slotId][odId] = rating
    }
    voters[odId] = { name: v.voterName, lastVoteAt: v.updatedAt }
    uniqueVoters.add(odId)
  }

  const slotAttendance: Record<string, number> = {}
  const slotVoteCounts: Record<string, number> = {}
  const slotRatingBreakdowns: Record<string, { can: number; maybe: number; yes: number }> = {}

  for (const [slotId, ratings] of Object.entries(pollVotes)) {
    slotAttendance[slotId] = 0
    slotVoteCounts[slotId] = 0
    slotRatingBreakdowns[slotId] = { can: 0, maybe: 0, yes: 0 }
    for (const rating of Object.values(ratings)) {
      slotVoteCounts[slotId]++
      slotAttendance[slotId] += rating
      if (rating === 0) slotRatingBreakdowns[slotId].can++
      else if (rating === 0.5) slotRatingBreakdowns[slotId].maybe++
      else if (rating === 1) slotRatingBreakdowns[slotId].yes++
    }
  }

  return {
    id: doc.id,
    title: doc.title,
    timezone: doc.timezone,
    isOpen: doc.isOpen,
    createdAt: doc._createdAt ?? Date.now(),
    publicResults: doc.publicResults,
    votingSystem: doc.votingSystem,
    startTime: doc.startTime,
    endTime: doc.endTime,
    votes: pollVotes,
    voters,
    totalVotes: uniqueVoters.size,
    slotAttendance,
    slotVoteCounts,
    slotRatingBreakdowns,
  }
}

/** Fetch all vote docs for a given pollId, paginating through the full collection. */
async function fetchVotesForPoll(pollId: string): Promise<VoteDoc[]> {
  const all: VoteDoc[] = []
  let offset = 0
  const limit = 100
  while (true) {
    const { documents, total } = await votes.query<VoteDoc>({ limit, offset })
    for (const doc of documents) {
      if (doc.pollId === pollId) all.push(doc)
    }
    offset += documents.length
    if (offset >= total || documents.length === 0) break
  }
  return all
}

export async function createPoll(data: Omit<PollDoc, 'id' | 'isOpen' | '_createdAt' | '_updatedAt' | '_owner'>): Promise<string> {
  const doc = await polls.create({ ...data, isOpen: true })
  return doc.id
}

export async function getPoll(id: string): Promise<Poll | null> {
  const doc = await polls.get<PollDoc>(id)
  if (!doc) return null
  const pollVotes = await fetchVotesForPoll(id)
  return assemblePoll(doc, pollVotes)
}

export async function submitVote(pollId: string, slotRatings: Record<string, number>, voterName: string | null): Promise<Poll | null> {
  const userId = fas.auth.user?.id
  if (!userId) throw new Error('Not signed in')

  // Find existing vote by this user for this poll
  const { documents } = await votes.query<VoteDoc>({ owner: userId, limit: 100 })
  const existing = documents.find(v => v.pollId === pollId)

  if (existing) {
    await votes.update(existing.id, { slotRatings, voterName, updatedAt: Date.now() })
  } else {
    await votes.create({ pollId, slotRatings, voterName, updatedAt: Date.now() })
  }

  return getPoll(pollId)
}

export async function deletePoll(id: string): Promise<void> {
  await polls.delete(id)
}

export async function getPolls(ids: string[]): Promise<Poll[]> {
  if (ids.length === 0) return []
  const results = await Promise.allSettled(ids.map(id => getPoll(id)))
  const out: Poll[] = []
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value !== null) out.push(r.value)
  }
  return out
}
