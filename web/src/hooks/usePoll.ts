import { useState, useEffect, useCallback } from 'react'
import type { Poll } from '../types'
import * as api from '../lib/api'
import { fas } from '../lib/fas'
import { DAYS } from '../lib/time-slots'

export function usePoll(pollId: string | undefined) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userVote, setUserVote] = useState<Record<string, number>>({})
  const [voterName, setVoterName] = useState('')

  const loadPoll = useCallback(async () => {
    if (!pollId) return
    try {
      setLoading(true)
      const data = await api.getPoll(pollId)
      if (!data) { setError('Poll not found'); return }
      setPoll(data)

      const userId = fas.auth.user?.id
      if (userId) {
        const existing: Record<string, number> = {}
        for (const [slotId, ratings] of Object.entries(data.votes)) {
          if (ratings[userId] !== undefined) existing[slotId] = ratings[userId]
        }
        if (Object.keys(existing).length > 0) setUserVote(existing)
      }
    } catch {
      setError('Failed to load poll')
    } finally {
      setLoading(false)
    }
  }, [pollId])

  const handleSlotRating = useCallback(async (day: number, hour: number, minute: number) => {
    if (!poll || !pollId || !fas.auth.user) return
    const key = `${DAYS[day]}-${hour}-${minute}`
    const current = userVote[key] || 0

    let next: number
    if (poll.votingSystem === 'simple') {
      next = current === 0 ? 1 : 0
    } else {
      next = current === 0 ? 0.5 : current === 0.5 ? 1 : 0
    }

    const updated = { ...userVote, [key]: next }
    setUserVote(updated)

    try {
      const result = await api.submitVote(pollId, updated, voterName.trim() || null)
      if (result) setPoll(result)
    } catch {
      setUserVote(userVote)
      setError('Failed to save vote')
    }
  }, [poll, pollId, userVote, voterName])

  useEffect(() => { loadPoll() }, [loadPoll])

  return { poll, loading, error, userVote, voterName, setVoterName, handleSlotRating, reloadPoll: loadPoll }
}
